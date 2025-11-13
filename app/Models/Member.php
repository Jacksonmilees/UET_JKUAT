<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    use HasFactory;

    protected $connection = 'member_db';
    protected $table = 'members';
    protected $primaryKey = 'MMID'; // Specify the primary key
    public $incrementing = false;   // MMID is likely not auto-incrementing
    protected $keyType = 'string';  // If MMID is a string

    protected $fillable = [
        'name', 'whatsapp', 'current_year_of_study', 'status', 'created_at',
        'manifest_jewel', 'MMID', 'email', 'course_of_study', 'campus',
        'image', 'date_of_issue', 'home_county', 'home_address', 'last_mmid_reminder'
    ];

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'member_mmid', 'MMID');
    }
}