<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\CampaignAnalytic;
use App\Models\CampaignDonation;
use App\Models\Project;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CampaignService
{
    /**
     * Create a new campaign
     */
    public function createCampaign(array $data, $userId)
    {
        return DB::transaction(function () use ($data, $userId) {
            $campaign = Campaign::create([
                'user_id' => $userId,
                'project_id' => $data['project_id'] ?? null,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'target_amount' => $data['target_amount'] ?? null,
                'campaign_type' => $data['campaign_type'] ?? 'general',
                'end_date' => $data['end_date'] ?? null,
                'settings' => $data['settings'] ?? [],
                'status' => 'active'
            ]);

            // Log creation
            activity()
                ->performedOn($campaign)
                ->causedBy($userId)
                ->withProperties(['action' => 'campaign_created'])
                ->log('Campaign created: ' . $campaign->title);

            return $campaign;
        });
    }

    /**
     * Update campaign
     */
    public function updateCampaign(Campaign $campaign, array $data)
    {
        return DB::transaction(function () use ($campaign, $data) {
            $campaign->update(array_filter([
                'title' => $data['title'] ?? null,
                'description' => $data['description'] ?? null,
                'target_amount' => $data['target_amount'] ?? null,
                'end_date' => $data['end_date'] ?? null,
                'status' => $data['status'] ?? null,
                'settings' => $data['settings'] ?? null,
            ], fn($value) => $value !== null));

            return $campaign->fresh();
        });
    }

    /**
     * Get campaign analytics summary
     */
    public function getCampaignAnalytics(Campaign $campaign)
    {
        $analytics = $campaign->analytics()
            ->selectRaw('
                event_type,
                COUNT(*) as total_events,
                COUNT(DISTINCT visitor_id) as unique_visitors,
                COUNT(DISTINCT DATE(created_at)) as active_days
            ')
            ->groupBy('event_type')
            ->get()
            ->keyBy('event_type');

        $sourceBreakdown = $campaign->analytics()
            ->selectRaw('source, COUNT(*) as count')
            ->groupBy('source')
            ->get();

        $donationsBySource = $campaign->donations()
            ->completed()
            ->selectRaw('source, COUNT(*) as count, SUM(amount) as total_amount')
            ->groupBy('source')
            ->get();

        $recentDonations = $campaign->donations()
            ->completed()
            ->public()
            ->latest()
            ->take(10)
            ->get();

        $dailyStats = $campaign->analytics()
            ->selectRaw('
                DATE(created_at) as date,
                event_type,
                COUNT(*) as count
            ')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date', 'event_type')
            ->orderBy('date', 'desc')
            ->get()
            ->groupBy('date');

        return [
            'overview' => [
                'total_views' => $campaign->views_count,
                'total_shares' => $campaign->shares_count,
                'total_donations' => $campaign->donations_count,
                'total_raised' => $campaign->current_amount,
                'target_amount' => $campaign->target_amount,
                'progress_percentage' => $campaign->progress_percentage,
                'conversion_rate' => $campaign->views_count > 0
                    ? round(($campaign->donations_count / $campaign->views_count) * 100, 2)
                    : 0,
            ],
            'events' => $analytics,
            'sources' => $sourceBreakdown,
            'donations_by_source' => $donationsBySource,
            'recent_donations' => $recentDonations,
            'daily_stats' => $dailyStats,
        ];
    }

    /**
     * Track campaign view
     */
    public function trackView(Campaign $campaign, array $data = [])
    {
        CampaignAnalytic::trackView($campaign->id, $data);
        $campaign->incrementViews();
    }

    /**
     * Track campaign share
     */
    public function trackShare(Campaign $campaign, string $source, array $data = [])
    {
        CampaignAnalytic::trackShare($campaign->id, $source, $data);
        $campaign->incrementShares();
    }

    /**
     * Process donation through campaign
     */
    public function processDonation(Campaign $campaign, array $data)
    {
        return DB::transaction(function () use ($campaign, $data) {
            $donation = CampaignDonation::create([
                'campaign_id' => $campaign->id,
                'transaction_id' => $data['transaction_id'] ?? null,
                'donor_name' => $data['donor_name'],
                'donor_email' => $data['donor_email'] ?? null,
                'donor_phone' => $data['donor_phone'],
                'amount' => $data['amount'],
                'is_anonymous' => $data['is_anonymous'] ?? false,
                'message' => $data['message'] ?? null,
                'source' => $data['source'] ?? 'link',
                'status' => 'pending',
            ]);

            // Track donation event
            CampaignAnalytic::trackDonation($campaign->id, [
                'visitor_id' => $data['visitor_id'] ?? null,
                'metadata' => [
                    'amount' => $data['amount'],
                    'source' => $data['source'] ?? 'link',
                ]
            ]);

            return $donation;
        });
    }

    /**
     * Complete donation after payment verification
     */
    public function completeDonation(CampaignDonation $donation, string $mpesaReceipt = null)
    {
        return DB::transaction(function () use ($donation, $mpesaReceipt) {
            $donation->markAsCompleted($mpesaReceipt);

            // Track conversion
            CampaignAnalytic::trackConversion($donation->campaign_id, [
                'metadata' => [
                    'donation_id' => $donation->id,
                    'amount' => $donation->amount,
                ]
            ]);

            return $donation;
        });
    }

    /**
     * Get campaign by unique code
     */
    public function getCampaignByCode(string $code)
    {
        return Campaign::where('unique_code', $code)
            ->with(['user', 'project'])
            ->firstOrFail();
    }

    /**
     * Get user's campaigns with statistics
     */
    public function getUserCampaigns($userId)
    {
        return Campaign::where('user_id', $userId)
            ->with(['project'])
            ->withCount([
                'donations as completed_donations_count' => function ($query) {
                    $query->where('status', 'completed');
                }
            ])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Pause/Resume campaign
     */
    public function toggleCampaignStatus(Campaign $campaign)
    {
        $newStatus = $campaign->status === 'active' ? 'paused' : 'active';
        $campaign->update(['status' => $newStatus]);

        activity()
            ->performedOn($campaign)
            ->withProperties(['old_status' => $campaign->status, 'new_status' => $newStatus])
            ->log('Campaign status changed to: ' . $newStatus);

        return $campaign;
    }

    /**
     * Generate shareable content for campaign
     */
    public function getShareableContent(Campaign $campaign)
    {
        $url = $campaign->getPublicUrl();

        return [
            'url' => $url,
            'short_url' => $url, // TODO: Integrate URL shortener service
            'qr_code' => $this->generateQRCode($url),
            'social_text' => [
                'whatsapp' => "Support: {$campaign->title}\n\nHelp us reach our goal! Donate here: {$url}",
                'twitter' => "Support {$campaign->title}! Every contribution counts. {$url} #UETJkuat #Fundraising",
                'facebook' => $campaign->getShareableText(),
                'email' => [
                    'subject' => "Support: {$campaign->title}",
                    'body' => "Hi,\n\nI wanted to share this important cause with you: {$campaign->title}\n\n{$campaign->description}\n\nYou can donate here: {$url}\n\nThank you for your support!"
                ]
            ],
            'embed_code' => $this->generateEmbedCode($campaign),
        ];
    }

    /**
     * Generate QR code for campaign URL
     */
    protected function generateQRCode(string $url)
    {
        // Using a simple QR code API
        return "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($url);
    }

    /**
     * Generate embed code for campaign
     */
    protected function generateEmbedCode(Campaign $campaign)
    {
        $url = $campaign->getPublicUrl();
        return <<<HTML
<div style="border: 2px solid #ddd; border-radius: 8px; padding: 20px; max-width: 400px; font-family: Arial, sans-serif;">
    <h3 style="margin-top: 0;">{$campaign->title}</h3>
    <p>{$campaign->description}</p>
    <div style="background: #f0f0f0; padding: 10px; border-radius: 4px; margin: 10px 0;">
        <strong>KES {$campaign->current_amount}</strong> raised of <strong>KES {$campaign->target_amount}</strong>
    </div>
    <a href="{$url}" target="_blank" style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
        Donate Now
    </a>
</div>
HTML;
    }

    /**
     * Get campaign performance metrics
     */
    public function getPerformanceMetrics(Campaign $campaign)
    {
        $totalViews = $campaign->views_count;
        $totalDonations = $campaign->donations_count;
        $avgDonation = $totalDonations > 0
            ? $campaign->current_amount / $totalDonations
            : 0;

        $viewsLast7Days = $campaign->analytics()
            ->where('event_type', 'view')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        $donationsLast7Days = $campaign->donations()
            ->where('status', 'completed')
            ->where('completed_at', '>=', now()->subDays(7))
            ->count();

        return [
            'conversion_rate' => $totalViews > 0 ? round(($totalDonations / $totalViews) * 100, 2) : 0,
            'average_donation' => round($avgDonation, 2),
            'momentum' => [
                'views_last_7_days' => $viewsLast7Days,
                'donations_last_7_days' => $donationsLast7Days,
                'trend' => $this->calculateTrend($campaign),
            ],
            'top_sources' => $this->getTopSources($campaign),
            'engagement_score' => $this->calculateEngagementScore($campaign),
        ];
    }

    protected function calculateTrend(Campaign $campaign)
    {
        $last7Days = $campaign->donations()
            ->where('status', 'completed')
            ->where('completed_at', '>=', now()->subDays(7))
            ->sum('amount');

        $previous7Days = $campaign->donations()
            ->where('status', 'completed')
            ->where('completed_at', '>=', now()->subDays(14))
            ->where('completed_at', '<', now()->subDays(7))
            ->sum('amount');

        if ($previous7Days == 0) {
            return $last7Days > 0 ? 'up' : 'flat';
        }

        $change = (($last7Days - $previous7Days) / $previous7Days) * 100;

        if ($change > 10) return 'up';
        if ($change < -10) return 'down';
        return 'flat';
    }

    protected function getTopSources(Campaign $campaign)
    {
        return $campaign->donations()
            ->completed()
            ->selectRaw('source, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('source')
            ->orderByDesc('total')
            ->limit(5)
            ->get();
    }

    protected function calculateEngagementScore(Campaign $campaign)
    {
        $views = $campaign->views_count;
        $shares = $campaign->shares_count;
        $donations = $campaign->donations_count;

        if ($views == 0) return 0;

        // Weighted engagement score
        $shareRate = ($shares / $views) * 100;
        $conversionRate = ($donations / $views) * 100;

        $score = ($shareRate * 0.3) + ($conversionRate * 0.7);

        return round(min(100, $score * 10), 1);
    }
}
