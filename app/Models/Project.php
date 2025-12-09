<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'title',
        'description',
        'target_amount',
        'current_amount',
        'account_number',
        'account_reference',
        'status',
        'end_date',
        'image_url'
    ];

    protected $casts = [
        'target_amount' => 'decimal:2',
        'current_amount' => 'decimal:2',
        'end_date' => 'datetime'
    ];

    /**
     * Get name attribute (fallback to title if name is not set)
     */
    public function getNameAttribute($value)
    {
        return $value ?: $this->title;
    }

    /**
     * Set name attribute (also set title)
     */
    public function setNameAttribute($value)
    {
        $this->attributes['name'] = $value;
        if (empty($this->attributes['title'])) {
            $this->attributes['title'] = $value;
        }
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function getProgressPercentageAttribute()
    {
        if ($this->target_amount == 0) return 0;
        return min(100, ($this->current_amount / $this->target_amount) * 100);
    }
}