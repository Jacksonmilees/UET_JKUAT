<?php

namespace App\Traits;

use App\Models\AuditLog;

trait Auditable
{
    /**
     * Boot the auditable trait
     */
    protected static function bootAuditable()
    {
        static::created(function ($model) {
            $model->logAudit('created', null, $model->getAttributes());
        });

        static::updated(function ($model) {
            // Only log if there are actual changes
            if ($model->wasChanged()) {
                $model->logAudit('updated', $model->getOriginal(), $model->getChanges());
            }
        });

        static::deleted(function ($model) {
            $model->logAudit('deleted', $model->getAttributes(), null);
        });
    }

    /**
     * Log audit trail
     */
    protected function logAudit($event, $old = null, $new = null)
    {
        // Skip audit logging if disabled
        if (property_exists($this, 'auditingDisabled') && $this->auditingDisabled) {
            return;
        }

        // Get hidden attributes to exclude from audit log
        $hidden = $this->getHidden();

        // Remove sensitive data from old and new values
        if ($old) {
            $old = array_diff_key($old, array_flip($hidden));
        }
        if ($new) {
            $new = array_diff_key($new, array_flip($hidden));
        }

        AuditLog::create([
            'user_id' => auth()->id(),
            'event' => $event,
            'auditable_type' => get_class($this),
            'auditable_id' => $this->id,
            'old_values' => $old,
            'new_values' => $new,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'url' => request()->fullUrl(),
            'method' => request()->method(),
        ]);
    }

    /**
     * Get audit logs for this model
     */
    public function auditLogs()
    {
        return $this->morphMany(AuditLog::class, 'auditable')
            ->orderBy('created_at', 'desc');
    }

    /**
     * Disable auditing for next operation
     */
    public function withoutAuditing()
    {
        $this->auditingDisabled = true;
        return $this;
    }

    /**
     * Enable auditing
     */
    public function withAuditing()
    {
        $this->auditingDisabled = false;
        return $this;
    }
}
