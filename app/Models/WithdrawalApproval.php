<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WithdrawalApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'withdrawal_id',
        'approver_id',
        'status',
        'notes',
        'rejection_reason',
        'otp_code',
        'otp_expires_at',
        'otp_verified_at',
        'approved_at',
        'rejected_at'
    ];

    protected $casts = [
        'otp_expires_at' => 'datetime',
        'otp_verified_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime'
    ];

    protected $hidden = [
        'otp_code'
    ];

    /**
     * Relationships
     */
    public function withdrawal()
    {
        return $this->belongsTo(Withdrawal::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    /**
     * Generate OTP
     */
    public function generateOTP()
    {
        $this->otp_code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $this->otp_expires_at = now()->addMinutes(10);
        $this->save();

        return $this->otp_code;
    }

    /**
     * Verify OTP
     */
    public function verifyOTP($code)
    {
        if ($this->otp_code !== $code) {
            return false;
        }

        if ($this->otp_expires_at && $this->otp_expires_at->isPast()) {
            return false;
        }

        $this->otp_verified_at = now();
        $this->save();

        return true;
    }

    /**
     * Check if OTP is valid
     */
    public function isOTPValid()
    {
        return $this->otp_code
            && $this->otp_expires_at
            && !$this->otp_expires_at->isPast()
            && !$this->otp_verified_at;
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}
