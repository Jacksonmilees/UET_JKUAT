<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RechargeContribution extends Model
{
    use HasFactory;

    protected $fillable = [
        'token_id',
        'donor_name',
        'donor_phone',
        'amount',
        'mpesa_receipt',
        'checkout_request_id',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    // Contribution statuses
    const STATUS_PENDING = 'pending';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';

    /**
     * Get the recharge token this contribution belongs to
     */
    public function token(): BelongsTo
    {
        return $this->belongsTo(AccountRechargeToken::class, 'token_id');
    }

    /**
     * Mark as completed
     */
    public function markCompleted(string $mpesaReceipt): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'mpesa_receipt' => $mpesaReceipt,
        ]);
        
        // Update token collected amount
        $this->token->addContribution($this->amount);
        
        // Add to user's account balance
        $user = $this->token->user;
        $user->increment('balance', $this->amount);
        
        // Create notification
        Notification::createPaymentNotification(
            $user->id,
            'Account Recharge Received',
            "You received KES {$this->amount} from {$this->donor_name} via your recharge link.",
            [
                'amount' => $this->amount,
                'donor_name' => $this->donor_name,
                'mpesa_receipt' => $mpesaReceipt,
            ]
        );
    }

    /**
     * Mark as failed
     */
    public function markFailed(): void
    {
        $this->update(['status' => self::STATUS_FAILED]);
    }
}
