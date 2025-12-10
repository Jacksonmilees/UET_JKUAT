<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampaignAnalytic extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'event_type',
        'visitor_id',
        'ip_address',
        'user_agent',
        'referrer',
        'source',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array'
    ];

    /**
     * Relationships
     */
    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    /**
     * Static methods for tracking
     */
    public static function trackView($campaignId, $data = [])
    {
        return self::track($campaignId, 'view', $data);
    }

    public static function trackShare($campaignId, $source, $data = [])
    {
        $data['source'] = $source;
        return self::track($campaignId, 'share', $data);
    }

    public static function trackDonation($campaignId, $data = [])
    {
        return self::track($campaignId, 'donation', $data);
    }

    public static function trackConversion($campaignId, $data = [])
    {
        return self::track($campaignId, 'conversion', $data);
    }

    protected static function track($campaignId, $eventType, $data = [])
    {
        return self::create([
            'campaign_id' => $campaignId,
            'event_type' => $eventType,
            'visitor_id' => $data['visitor_id'] ?? self::getVisitorId(),
            'ip_address' => $data['ip_address'] ?? request()->ip(),
            'user_agent' => $data['user_agent'] ?? request()->userAgent(),
            'referrer' => $data['referrer'] ?? request()->header('referer'),
            'source' => $data['source'] ?? self::detectSource(),
            'metadata' => $data['metadata'] ?? []
        ]);
    }

    protected static function getVisitorId()
    {
        // Generate or retrieve visitor ID from session/cookie
        if (session()->has('visitor_id')) {
            return session('visitor_id');
        }
        $visitorId = \Illuminate\Support\Str::uuid()->toString();
        session(['visitor_id' => $visitorId]);
        return $visitorId;
    }

    protected static function detectSource()
    {
        $referrer = request()->header('referer');
        if (!$referrer) {
            return 'direct';
        }

        if (str_contains($referrer, 'facebook')) return 'facebook';
        if (str_contains($referrer, 'twitter')) return 'twitter';
        if (str_contains($referrer, 'whatsapp')) return 'whatsapp';
        if (str_contains($referrer, 'instagram')) return 'instagram';
        if (str_contains($referrer, 'linkedin')) return 'linkedin';

        return 'referral';
    }
}
