<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Log;

class Account extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'account_type_id',
        'account_subtype_id',
        'name',
        'account_number',
        'reference',
        'type',
        'balance',
        'parent_id',
        'receiver_name',
        'status',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
        'balance' => 'decimal:2'
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($account) {
            try {
                // Generate a unique account number if not set
                if (!$account->account_number) {
                    $account->account_number = static::generateUniqueAccountNumber();
                }

                // Ensure metadata is an array
                if (empty($account->metadata)) {
                    $account->metadata = [];
                }

                // Set default status if not set
                if (empty($account->status)) {
                    $account->status = 'active';
                }
            } catch (\Exception $e) {
                Log::error('Error in Account model boot method', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
        });
    }

    /**
     * Generate a unique account number
     */
    protected static function generateUniqueAccountNumber()
    {
        $prefix = 'ACC';
        $uniqueId = strtoupper(uniqid());
        $timestamp = time();
        return "{$prefix}-{$uniqueId}-{$timestamp}";
    }

    /**
     * Relationship with AccountType
     */
    public function accountType()
    {
        return $this->belongsTo(AccountType::class);
    }

    /**
     * Relationship with AccountSubtype
     */
    public function accountSubtype()
    {
        return $this->belongsTo(AccountSubtype::class);
    }

    /**
     * Relationship with Transactions
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Relationship with parent Account
     */
    public function parent()
    {
        return $this->belongsTo(Account::class, 'parent_id');
    }

    /**
     * Relationship with child Accounts
     */
    public function children()
    {
        return $this->hasMany(Account::class, 'parent_id');
    }

    /**
     * Check if account has sufficient balance for a transaction
     */
    public function hasSufficientBalance($amount)
    {
        return $this->balance >= $amount;
    }

    /**
     * Update account balance
     */
    public function updateBalance($amount, $type = 'credit')
    {
        $this->balance = $type === 'credit' 
            ? $this->balance + $amount 
            : $this->balance - $amount;
        
        return $this->save();
    }
}