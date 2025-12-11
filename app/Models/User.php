<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Traits\HasRoles;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'member_id',
        'phone_number',
        'year_of_study',
        'course',
        'college',
        'admission_number',
        'ministry_interest',
        'residence',
        'role',
        'status',
        'avatar',
        'registration_completed_at',
        'balance',
        'unsettled_balance',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'registration_completed_at' => 'datetime',
            'balance' => 'decimal:2',
            'unsettled_balance' => 'decimal:2',
        ];
    }

    /**
     * Relationships
     */
    public function campaigns()
    {
        return $this->hasMany(Campaign::class);
    }

    public function accounts()
    {
        return $this->hasMany(Account::class);
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function rechargeTokens()
    {
        return $this->hasMany(AccountRechargeToken::class);
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    /**
     * Wallet Methods
     */

    /**
     * Add funds to user wallet
     */
    public function addToWallet(float $amount, string $source = 'recharge', ?array $metadata = null): void
    {
        $this->increment('balance', $amount);

        // Log wallet transaction
        WalletTransaction::create([
            'user_id' => $this->id,
            'type' => 'credit',
            'amount' => $amount,
            'source' => $source,
            'balance_after' => $this->fresh()->balance,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Deduct funds from user wallet
     */
    public function deductFromWallet(float $amount, string $purpose = 'payment', ?array $metadata = null): bool
    {
        if ($this->balance < $amount) {
            return false;
        }

        $this->decrement('balance', $amount);

        // Log wallet transaction
        WalletTransaction::create([
            'user_id' => $this->id,
            'type' => 'debit',
            'amount' => $amount,
            'purpose' => $purpose,
            'balance_after' => $this->fresh()->balance,
            'metadata' => $metadata,
        ]);

        return true;
    }

    /**
     * Add unsettled funds (money in paybill but not allocated)
     */
    public function addUnsettledFunds(float $amount): void
    {
        $this->increment('unsettled_balance', $amount);
    }

    /**
     * Settle funds (move from unsettled to wallet)
     */
    public function settleFunds(float $amount): bool
    {
        if ($this->unsettled_balance < $amount) {
            return false;
        }

        $this->decrement('unsettled_balance', $amount);
        $this->increment('balance', $amount);

        // Log the settlement
        WalletTransaction::create([
            'user_id' => $this->id,
            'type' => 'credit',
            'amount' => $amount,
            'source' => 'settlement',
            'balance_after' => $this->fresh()->balance,
            'metadata' => ['settled_from_unsettled' => true],
        ]);

        return true;
    }

    /**
     * Check if user has sufficient wallet balance
     */
    public function hasSufficientBalance(float $amount): bool
    {
        return $this->balance >= $amount;
    }

    /**
     * Get total available funds (wallet + unsettled)
     */
    public function getTotalAvailableFunds(): float
    {
        return $this->balance + $this->unsettled_balance;
    }

    /**
     * Get user's full profile data
     *
     * @return array
     */
    public function getProfileData(): array
    {
        return [
            'id' => $this->id,
            'member_id' => $this->member_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'year_of_study' => $this->year_of_study,
            'course' => $this->course,
            'college' => $this->college,
            'admission_number' => $this->admission_number,
            'ministry_interest' => $this->ministry_interest,
            'residence' => $this->residence,
            'role' => $this->role ?? 'user',
            'roles' => $this->roles->pluck('name')->toArray(),
            'permissions' => $this->getAllPermissions(),
            'status' => $this->status ?? 'active',
            'avatar' => $this->avatar,
            'balance' => $this->balance ?? 0,
            'unsettled_balance' => $this->unsettled_balance ?? 0,
            'total_available_funds' => $this->getTotalAvailableFunds(),
            'registration_completed_at' => $this->registration_completed_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * Check if user is admin (maintains backward compatibility)
     * Now checks both old role field and new RBAC system
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        // Check new RBAC system first
        if ($this->hasAnyRole(['super-admin', 'admin', 'treasurer', 'project-manager'])) {
            return true;
        }
        // Fall back to old system for backward compatibility
        return in_array($this->role, ['admin', 'super_admin']) || $this->email === 'admin@uetjkuat.com';
    }

    /**
     * Check if user is active
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
