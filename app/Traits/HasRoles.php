<?php

namespace App\Traits;

use App\Models\Role;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

trait HasRoles
{
    /**
     * A user may have multiple roles.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user')
            ->withPivot('assigned_by', 'assigned_at')
            ->withTimestamps();
    }

    /**
     * Assign role to user
     */
    public function assignRole($role, $assignedBy = null)
    {
        if (is_string($role)) {
            $role = Role::where('slug', $role)->firstOrFail();
        }

        if (!$this->hasRole($role)) {
            $this->roles()->attach($role->id, [
                'assigned_by' => $assignedBy ?? auth()->id(),
                'assigned_at' => now()
            ]);
        }

        return $this;
    }

    /**
     * Remove role from user
     */
    public function removeRole($role)
    {
        if (is_string($role)) {
            $role = Role::where('slug', $role)->firstOrFail();
        }

        $this->roles()->detach($role->id);

        return $this;
    }

    /**
     * Sync roles
     */
    public function syncRoles($roles, $assignedBy = null)
    {
        $roleIds = [];
        foreach ($roles as $role) {
            if (is_string($role)) {
                $role = Role::where('slug', $role)->firstOrFail();
            }
            $roleIds[$role->id] = [
                'assigned_by' => $assignedBy ?? auth()->id(),
                'assigned_at' => now()
            ];
        }

        $this->roles()->sync($roleIds);

        return $this;
    }

    /**
     * Check if user has role
     */
    public function hasRole($role): bool
    {
        if (is_string($role)) {
            return $this->roles->contains('slug', $role);
        }

        return $this->roles->contains($role);
    }

    /**
     * Check if user has any of the given roles
     */
    public function hasAnyRole(array $roles): bool
    {
        foreach ($roles as $role) {
            if ($this->hasRole($role)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has all of the given roles
     */
    public function hasAllRoles(array $roles): bool
    {
        foreach ($roles as $role) {
            if (!$this->hasRole($role)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if user has permission
     */
    public function hasPermission($permission): bool
    {
        foreach ($this->roles as $role) {
            if ($role->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has any of the given permissions
     */
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has all of the given permissions
     */
    public function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->hasPermission($permission)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get all user permissions
     */
    public function getAllPermissions(): array
    {
        $permissions = [];
        foreach ($this->roles as $role) {
            $permissions = array_merge($permissions, $role->permissions ?? []);
        }

        return array_values(array_unique($permissions));
    }

    /**
     * Check if user is Super Admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super-admin') || $this->email === config('app.super_admin_email', 'admin@uetjkuat.com');
    }

    /**
     * Check if user is Treasurer
     */
    public function isTreasurer(): bool
    {
        return $this->hasRole('treasurer') || $this->isSuperAdmin();
    }

    /**
     * Check if user is Admin (any admin role)
     */
    public function isAdmin(): bool
    {
        return $this->hasAnyRole(['super-admin', 'admin', 'treasurer', 'project-manager']);
    }
}
