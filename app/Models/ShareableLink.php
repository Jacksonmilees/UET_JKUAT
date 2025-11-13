<?php
// app/Models/ShareableLink.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ShareableLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'unique_id',
        'event_name',
        'description',
        'ticket_price',
        'total_tickets',
        'tickets_sold',
        'expiry_date',
        'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }
}