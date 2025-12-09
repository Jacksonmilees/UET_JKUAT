<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Semester extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'mandatory_amount',
        'status',
        'created_by',
        'settings',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'mandatory_amount' => 'decimal:2',
        'settings' => 'array',
    ];

    /**
     * Get the user who created this semester
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get users in this semester
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'current_semester_id');
    }

    /**
     * Get transactions in this semester
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get the currently active semester
     */
    public static function getActive(): ?self
    {
        return self::where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();
    }

    /**
     * Get the latest semester (even if not currently in date range)
     */
    public static function getLatest(): ?self
    {
        return self::where('status', 'active')
            ->orderBy('start_date', 'desc')
            ->first();
    }

    /**
     * Check if this semester is currently active
     */
    public function isActive(): bool
    {
        return $this->status === 'active' 
            && $this->start_date <= now() 
            && $this->end_date >= now();
    }

    /**
     * Get payment statistics for this semester
     */
    public function getStats(): array
    {
        $totalUsers = User::where('current_semester_id', $this->id)->count();
        $paidUsers = User::where('current_semester_id', $this->id)
            ->where('mandatory_paid_current_semester', true)
            ->count();
        
        $totalCollected = Transaction::where('semester_id', $this->id)
            ->where('status', 'completed')
            ->where('type', 'mandatory')
            ->sum('amount');

        return [
            'total_users' => $totalUsers,
            'paid_users' => $paidUsers,
            'unpaid_users' => $totalUsers - $paidUsers,
            'payment_rate' => $totalUsers > 0 ? round(($paidUsers / $totalUsers) * 100, 1) : 0,
            'total_collected' => (float) $totalCollected,
            'target_amount' => $totalUsers * $this->mandatory_amount,
        ];
    }

    /**
     * Archive this semester
     */
    public function archive(): void
    {
        $this->update(['status' => 'archived']);
    }

    /**
     * Reset all users' payment status for new semester
     */
    public function assignToAllActiveUsers(): int
    {
        return User::where('is_active', true)->update([
            'current_semester_id' => $this->id,
            'mandatory_paid_current_semester' => false,
            'mandatory_paid_at' => null,
        ]);
    }
}
