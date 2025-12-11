<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class WalletTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'balance_after',
        'source',
        'purpose',
        'reference_type',
        'reference_id',
        'metadata',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'metadata' => 'array',
    ];

    // Transaction types
    const TYPE_CREDIT = 'credit';
    const TYPE_DEBIT = 'debit';

    // Transaction statuses
    const STATUS_COMPLETED = 'completed';
    const STATUS_PENDING = 'pending';
    const STATUS_FAILED = 'failed';
    const STATUS_REVERSED = 'reversed';

    /**
     * Get the user that owns the wallet transaction
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the reference entity (polymorphic)
     */
    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope to get credit transactions
     */
    public function scopeCredits($query)
    {
        return $query->where('type', self::TYPE_CREDIT);
    }

    /**
     * Scope to get debit transactions
     */
    public function scopeDebits($query)
    {
        return $query->where('type', self::TYPE_DEBIT);
    }

    /**
     * Scope to get completed transactions
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope to get transactions for a specific user
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Get formatted transaction description
     */
    public function getDescription(): string
    {
        if ($this->type === self::TYPE_CREDIT) {
            return match($this->source) {
                'recharge' => 'Wallet recharge via M-Pesa',
                'settlement' => 'Funds settled from unsettled balance',
                'refund' => 'Refund from ' . ($this->purpose ?? 'transaction'),
                'contribution' => 'Contribution received',
                default => 'Wallet credited',
            };
        } else {
            return match($this->purpose) {
                'project' => 'Project contribution',
                'merchandise' => 'Merchandise purchase',
                'withdrawal' => 'Wallet withdrawal',
                'transfer' => 'Account transfer',
                default => 'Wallet payment',
            };
        }
    }

    /**
     * Check if transaction is a credit
     */
    public function isCredit(): bool
    {
        return $this->type === self::TYPE_CREDIT;
    }

    /**
     * Check if transaction is a debit
     */
    public function isDebit(): bool
    {
        return $this->type === self::TYPE_DEBIT;
    }
}
