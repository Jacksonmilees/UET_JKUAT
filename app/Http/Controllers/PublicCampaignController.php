<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Services\CampaignService;
use App\Services\MpesaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PublicCampaignController extends Controller
{
    protected $campaignService;
    protected $mpesaService;

    public function __construct(CampaignService $campaignService, MpesaService $mpesaService)
    {
        $this->campaignService = $campaignService;
        $this->mpesaService = $mpesaService;
    }

    /**
     * Get public campaign details by unique code
     */
    public function show(Request $request, string $code)
    {
        try {
            $campaign = $this->campaignService->getCampaignByCode($code);

            // Check if campaign is accessible
            if (!$campaign->is_active && $campaign->status !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'This campaign is not available',
                ], 404);
            }

            // Track view
            $this->campaignService->trackView($campaign, [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'referrer' => $request->header('referer'),
            ]);

            // Get recent public donations
            $recentDonations = $campaign->donations()
                ->completed()
                ->public()
                ->latest('completed_at')
                ->take(10)
                ->get()
                ->map(function ($donation) {
                    return [
                        'donor_name' => $donation->getDisplayName(),
                        'amount' => $donation->amount,
                        'message' => $donation->message,
                        'donated_at' => $donation->completed_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'campaign' => [
                    'unique_code' => $campaign->unique_code,
                    'title' => $campaign->title,
                    'description' => $campaign->description,
                    'target_amount' => $campaign->target_amount,
                    'current_amount' => $campaign->current_amount,
                    'progress_percentage' => $campaign->progress_percentage,
                    'image_url' => $campaign->image_url,
                    'campaign_type' => $campaign->campaign_type,
                    'end_date' => $campaign->end_date,
                    'days_remaining' => $campaign->days_remaining,
                    'is_active' => $campaign->is_active,
                    'donations_count' => $campaign->donations_count,
                    'shares_count' => $campaign->shares_count,
                    'project' => $campaign->project ? [
                        'id' => $campaign->project->id,
                        'name' => $campaign->project->name,
                        'category' => $campaign->project->category,
                    ] : null,
                    'creator' => [
                        'name' => $campaign->user->name,
                        'organization' => $campaign->user->organization ?? 'UET JKUAT',
                    ],
                ],
                'recent_donations' => $recentDonations,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Campaign not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Initiate donation without authentication (guest donation)
     */
    public function donate(Request $request, string $code)
    {
        $validator = Validator::make($request->all(), [
            'donor_name' => 'required|string|max:255',
            'donor_email' => 'nullable|email|max:255',
            'donor_phone' => 'required|regex:/^254[0-9]{9}$/',
            'amount' => 'required|numeric|min:10',
            'is_anonymous' => 'boolean',
            'message' => 'nullable|string|max:500',
            'source' => 'nullable|in:link,qr,direct,social',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $campaign = $this->campaignService->getCampaignByCode($code);

            // Check if campaign accepts donations
            if (!$campaign->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'This campaign is not accepting donations',
                ], 400);
            }

            // Create pending donation
            $donation = $this->campaignService->processDonation($campaign, array_merge(
                $request->all(),
                ['visitor_id' => session('visitor_id')]
            ));

            // Initiate M-Pesa STK Push
            $mpesaResponse = $this->mpesaService->stkPush(
                $request->donor_phone,
                $request->amount,
                "Donation to: {$campaign->title}",
                "CAMPAIGN-{$campaign->id}-{$donation->id}"
            );

            if ($mpesaResponse['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'Payment request sent. Please check your phone to complete the donation.',
                    'donation_id' => $donation->id,
                    'checkout_request_id' => $mpesaResponse['CheckoutRequestID'] ?? null,
                ], 200);
            } else {
                // Mark donation as failed
                $donation->update(['status' => 'failed']);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to initiate payment',
                    'error' => $mpesaResponse['message'] ?? 'M-Pesa service unavailable',
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process donation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Track share from public page
     */
    public function trackShare(Request $request, string $code)
    {
        $validator = Validator::make($request->all(), [
            'source' => 'required|in:facebook,twitter,whatsapp,instagram,linkedin,email,copy',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $campaign = $this->campaignService->getCampaignByCode($code);
            $this->campaignService->trackShare($campaign, $request->source);

            return response()->json([
                'success' => true,
                'message' => 'Share tracked successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track share',
            ], 500);
        }
    }

    /**
     * Get campaign statistics (public)
     */
    public function stats(string $code)
    {
        try {
            $campaign = Campaign::where('unique_code', $code)->firstOrFail();

            return response()->json([
                'success' => true,
                'stats' => [
                    'total_raised' => $campaign->current_amount,
                    'target_amount' => $campaign->target_amount,
                    'progress_percentage' => $campaign->progress_percentage,
                    'donations_count' => $campaign->donations_count,
                    'donors_count' => $campaign->donations()->completed()->distinct('donor_phone')->count('donor_phone'),
                    'days_remaining' => $campaign->days_remaining,
                    'average_donation' => $campaign->donations_count > 0
                        ? round($campaign->current_amount / $campaign->donations_count, 2)
                        : 0,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Campaign not found',
            ], 404);
        }
    }

    /**
     * Verify donation status (for guest donors to check their donation)
     */
    public function verifyDonation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'donation_id' => 'required|exists:campaign_donations,id',
            'donor_phone' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $donation = \App\Models\CampaignDonation::where('id', $request->donation_id)
                ->where('donor_phone', $request->donor_phone)
                ->firstOrFail();

            return response()->json([
                'success' => true,
                'donation' => [
                    'id' => $donation->id,
                    'amount' => $donation->amount,
                    'status' => $donation->status,
                    'mpesa_receipt' => $donation->mpesa_receipt,
                    'completed_at' => $donation->completed_at,
                    'campaign' => [
                        'title' => $donation->campaign->title,
                        'unique_code' => $donation->campaign->unique_code,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Donation not found',
            ], 404);
        }
    }

    /**
     * Get public campaigns list (active campaigns)
     */
    public function index(Request $request)
    {
        try {
            $campaigns = Campaign::active()
                ->public()
                ->with(['user', 'project'])
                ->orderBy('created_at', 'desc')
                ->paginate(12);

            return response()->json([
                'success' => true,
                'campaigns' => $campaigns,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch campaigns',
            ], 500);
        }
    }
}
