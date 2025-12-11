<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'user_id',
        'ticket_id',
        'amount',
        'payment_method',
        'checkout_request_id',
        'mpesa_receipt_number',
        'payment_status',
        'payment_error',
        'phone_number',
        'account_number',
    ];
}
