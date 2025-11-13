<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_number',
        'member_mmid',
        'phone_number',
        'buyer_name',
        'buyer_contact',
        'amount',
        'payment_status',
        'checkout_request_id',
        'payment_error',
        'status'
    ];

    public function member()
    {
        return $this->belongsTo(Member::class, 'member_mmid', 'MMID');
    }
}