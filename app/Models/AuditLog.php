<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event',
        'auditable_type',
        'auditable_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'url',
        'method',
        'metadata'
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'metadata' => 'array'
    ];

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function auditable()
    {
        return $this->morphTo();
    }

    /**
     * Static method to create audit log
     */
    public static function log($event, $auditableType = null, $auditableId = null, $oldValues = null, $newValues = null, $metadata = [])
    {
        return self::create([
            'user_id' => auth()->id(),
            'event' => $event,
            'auditable_type' => $auditableType,
            'auditable_id' => $auditableId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'url' => request()->fullUrl(),
            'method' => request()->method(),
            'metadata' => $metadata
        ]);
    }

    /**
     * Get human-readable event description
     */
    public function getEventDescription()
    {
        $userName = $this->user ? $this->user->name : 'System';
        $modelName = $this->auditable_type ? class_basename($this->auditable_type) : 'record';

        switch ($this->event) {
            case 'created':
                return "{$userName} created a new {$modelName}";
            case 'updated':
                return "{$userName} updated {$modelName} #{$this->auditable_id}";
            case 'deleted':
                return "{$userName} deleted {$modelName} #{$this->auditable_id}";
            case 'accessed':
                return "{$userName} accessed {$modelName} #{$this->auditable_id}";
            case 'login':
                return "{$userName} logged in";
            case 'logout':
                return "{$userName} logged out";
            default:
                return "{$userName} performed {$this->event}";
        }
    }

    /**
     * Get changed fields
     */
    public function getChangedFields()
    {
        if (!$this->new_values || !$this->old_values) {
            return [];
        }

        $changed = [];
        foreach ($this->new_values as $key => $newValue) {
            $oldValue = $this->old_values[$key] ?? null;
            if ($oldValue !== $newValue) {
                $changed[$key] = [
                    'old' => $oldValue,
                    'new' => $newValue
                ];
            }
        }
        return $changed;
    }

    /**
     * Scopes
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByEvent($query, $event)
    {
        return $query->where('event', $event);
    }

    public function scopeForModel($query, $modelType, $modelId = null)
    {
        $query->where('auditable_type', $modelType);
        if ($modelId) {
            $query->where('auditable_id', $modelId);
        }
        return $query;
    }
}
