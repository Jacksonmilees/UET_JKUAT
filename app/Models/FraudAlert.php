<?php
// app/Models/FraudAlert.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FraudAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'risk_level',
        'risk_score',
        'anomaly_score',
        'fraud_flags',
        'anomaly_types',
        'recommendations',
        'status',
        'reviewer_notes',
        'reviewed_by',
        'reviewed_at',
        'metadata'
    ];

    protected $casts = [
        'fraud_flags' => 'array',
        'anomaly_types' => 'array',
        'recommendations' => 'array',
        'metadata' => 'array',
        'risk_score' => 'decimal:4',
        'anomaly_score' => 'decimal:4',
        'reviewed_at' => 'datetime'
    ];

    // Relationships
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Scopes
    public function scopePendingReview($query)
    {
        return $query->where('status', 'pending_review');
    }

    public function scopeHighRisk($query)
    {
        return $query->whereIn('risk_level', ['high', 'critical']);
    }

    public function scopeCritical($query)
    {
        return $query->where('risk_level', 'critical');
    }

    // Helper methods
    public function isHighRisk(): bool
    {
        return in_array($this->risk_level, ['high', 'critical']);
    }

    public function isCritical(): bool
    {
        return $this->risk_level === 'critical';
    }

    public function isPendingReview(): bool
    {
        return $this->status === 'pending_review';
    }

    public function markAsReviewed(int $reviewerId, string $status, ?string $notes = null): void
    {
        $this->update([
            'status' => $status,
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'reviewer_notes' => $notes
        ]);
    }
}