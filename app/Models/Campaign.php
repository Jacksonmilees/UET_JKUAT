<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Campaign extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'project_id',
        'unique_code',
        'title',
        'description',
        'target_amount',
        'current_amount',
        'image_url',
        'slug',
        'status',
        'campaign_type',
        'end_date',
        'settings',
        'analytics_data',
        'views_count',
        'shares_count',
        'donations_count'
    ];

    protected $casts = [
        'target_amount' => 'decimal:2',
        'current_amount' => 'decimal:2',
        'end_date' => 'datetime',
        'settings' => 'array',
        'analytics_data' => 'array',
        'views_count' => 'integer',
        'shares_count' => 'integer',
        'donations_count' => 'integer'
    ];

    protected $appends = ['progress_percentage', 'is_active', 'days_remaining'];

    /**
     * Boot method to generate unique code and slug
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($campaign) {
            if (empty($campaign->unique_code)) {
                $campaign->unique_code = self::generateUniqueCode();
            }
            if (empty($campaign->slug)) {
                $campaign->slug = Str::slug($campaign->title) . '-' . Str::random(6);
            }
        });
    }

    /**
     * Generate unique campaign code
     */
    public static function generateUniqueCode()
    {
        do {
            $code = 'UET-' . strtoupper(Str::random(8));
        } while (self::where('unique_code', $code)->exists());

        return $code;
    }

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function donations()
    {
        return $this->hasMany(CampaignDonation::class);
    }

    public function analytics()
    {
        return $this->hasMany(CampaignAnalytic::class);
    }

    /**
     * Accessors
     */
    public function getProgressPercentageAttribute()
    {
        if (!$this->target_amount || $this->target_amount == 0) {
            return 0;
        }
        return min(100, ($this->current_amount / $this->target_amount) * 100);
    }

    public function getIsActiveAttribute()
    {
        if ($this->status !== 'active') {
            return false;
        }
        if ($this->end_date && $this->end_date->isPast()) {
            return false;
        }
        return true;
    }

    public function getDaysRemainingAttribute()
    {
        if (!$this->end_date) {
            return null;
        }
        return max(0, now()->diffInDays($this->end_date, false));
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where(function($q) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>', now());
            });
    }

    public function scopePublic($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Methods
     */
    public function incrementViews()
    {
        $this->increment('views_count');
    }

    public function incrementShares()
    {
        $this->increment('shares_count');
    }

    public function recordDonation($amount)
    {
        $this->increment('current_amount', $amount);
        $this->increment('donations_count');
    }

    public function getPublicUrl()
    {
        return url("/campaign/{$this->unique_code}");
    }

    public function getShareableText()
    {
        return "{$this->title} - Support this cause: {$this->getPublicUrl()}";
    }
}
