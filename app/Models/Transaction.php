<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
// app/Models/Transaction.php
class Transaction extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'account_id',
        'transaction_id',
        'amount',
        'type',
        'payment_method',
        'status',
        'reference',
        'phone_number',
        'payer_name',
        'metadata',
        'processed_at'
    ];

    protected $casts = [
        'metadata' => 'array',
        'processed_at' => 'datetime',
        'amount' => 'decimal:2'
    ];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }
}