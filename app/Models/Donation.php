<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Donation extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'amount',
        'transaction_id',
        'phone_number',
        'donor_name',
        'status'
    ];

    protected $casts = [
        'amount' => 'decimal:2'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}