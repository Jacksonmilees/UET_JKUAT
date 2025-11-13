<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Withdrawal extends Model
{
    protected $fillable = [
        'account_id',
        'transaction_id',
        'amount',
        'phone_number',
        'withdrawal_reason',
        'remarks',
        'status',
        'mpesa_conversation_id',
        'mpesa_transaction_id',
        'mpesa_result_code',
        'mpesa_result_desc',
        'completed_at',
        'metadata',
        'initiated_by_name',
        'receiver_name',
        'reference',
        'initiated_by'
    ];

    protected $casts = [
        'metadata' => 'array',
        'amount' => 'decimal:2',
        'completed_at' => 'datetime'
    ];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }
}