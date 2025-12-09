<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class AccountRechargeToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'token',
        'user_id',
        'target_amount',
        'collected_amount',
        'reason',
        'status',
        'expires_at',
    ];

    protected $casts = [
        'target_amount' => 'decimal:2',
        'collected_amount' => 'decimal:2',
        'expires_at' => 'datetime',
    ];

    // Token statuses
    const STATUS_ACTIVE = 'active';
    const STATUS_COMPLETED = 'completed';
    const STATUS_EXPIRED = 'expired';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->token)) {
                $model->token = Str::random(32);
            }
            if (empty($model->expires_at)) {
                $model->expires_at = now()->addDays(30);
            }
        });
    }

    /**
     * Get the user this token belongs to
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get contributions to this token
     */
    public function contributions(): HasMany
    {
        return $this->hasMany(RechargeContribution::class, 'token_id');
    }

    /**
     * Get the full recharge URL
     */
    public function getRechargeUrl(): string
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
        return "{$frontendUrl}/recharge/{$this->token}";
    }

    /**
     * Check if token is still valid
     */
    public function isValid(): bool
    {
        return $this->status === self::STATUS_ACTIVE 
            && $this->expires_at > now();
    }

    /**
     * Add a contribution amount
     */
    public function addContribution(float $amount): void
    {
        $this->increment('collected_amount', $amount);
        
        // Check if target reached
        if ($this->target_amount && $this->collected_amount >= $this->target_amount) {
            $this->update(['status' => self::STATUS_COMPLETED]);
        }
    }

    /**
     * Calculate remaining amount to target
     */
    public function getRemainingAmount(): float
    {
        if (!$this->target_amount) {
            return 0;
        }
        return max(0, $this->target_amount - $this->collected_amount);
    }

    /**
     * Get progress percentage
     */
    public function getProgressPercentage(): float
    {
        if (!$this->target_amount || $this->target_amount == 0) {
            return 0;
        }
        return min(100, round(($this->collected_amount / $this->target_amount) * 100, 1));
    }

    /**
     * Find by token
     */
    public static function findByToken(string $token): ?self
    {
        return self::where('token', $token)->first();
    }

    /**
     * Create a new recharge token for user
     */
    public static function createForUser(
        int $userId, 
        ?float $targetAmount = null, 
        ?string $reason = null,
        int $expiryDays = 30
    ): self {
        return self::create([
            'user_id' => $userId,
            'target_amount' => $targetAmount,
            'reason' => $reason,
            'expires_at' => now()->addDays($expiryDays),
        ]);
    }
}
