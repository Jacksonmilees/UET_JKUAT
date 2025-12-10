<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampaignDonation extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'transaction_id',
        'donor_name',
        'donor_email',
        'donor_phone',
        'amount',
        'is_anonymous',
        'message',
        'source',
        'status',
        'mpesa_receipt',
        'completed_at'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_anonymous' => 'boolean',
        'completed_at' => 'datetime'
    ];

    /**
     * Relationships
     */
    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Scopes
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePublic($query)
    {
        return $query->where('is_anonymous', false);
    }

    /**
     * Methods
     */
    public function markAsCompleted($mpesaReceipt = null)
    {
        $this->update([
            'status' => 'completed',
            'mpesa_receipt' => $mpesaReceipt,
            'completed_at' => now()
        ]);

        // Update campaign totals
        $this->campaign->recordDonation($this->amount);
    }

    public function getDisplayName()
    {
        return $this->is_anonymous ? 'Anonymous Donor' : $this->donor_name;
    }
}
