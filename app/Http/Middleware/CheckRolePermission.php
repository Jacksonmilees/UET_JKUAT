<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRolePermission
{
    /**
     * Role permissions mapping
     */
    protected array $rolePermissions = [
        'admin' => [
            'users.view', 'users.create', 'users.update', 'users.delete',
            'transactions.view', 'transactions.create', 'transactions.approve', 'transactions.export',
            'withdrawals.view', 'withdrawals.create', 'withdrawals.approve', 'withdrawals.reject',
            'projects.view', 'projects.create', 'projects.update', 'projects.delete', 'projects.approve',
            'tickets.view', 'tickets.update', 'tickets.resolve',
            'semesters.view', 'semesters.create', 'semesters.update', 'semesters.activate',
            'notifications.broadcast',
            'settings.view', 'settings.update',
            'reports.view', 'reports.export',
        ],
        'treasurer' => [
            'users.view',
            'transactions.view', 'transactions.create', 'transactions.approve', 'transactions.export',
            'withdrawals.view', 'withdrawals.approve', 'withdrawals.reject',
            'projects.view',
            'semesters.view',
            'reports.view', 'reports.export',
        ],
        'auditor' => [
            'users.view',
            'transactions.view', 'transactions.export',
            'withdrawals.view',
            'projects.view',
            'semesters.view',
            'reports.view', 'reports.export',
        ],
        'welfare' => [
            'users.view',
            'transactions.view',
            'tickets.view', 'tickets.update', 'tickets.resolve',
            'projects.view',
        ],
        'member' => [
            'transactions.view.own',
            'projects.view',
            'tickets.create', 'tickets.view.own',
        ],
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        // If no permissions required, just check if user is authenticated
        if (empty($permissions)) {
            return $next($request);
        }

        // Check if user has at least one of the required permissions
        if ($this->hasAnyPermission($user, $permissions)) {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'You do not have permission to perform this action',
            'required_permissions' => $permissions,
        ], 403);
    }

    /**
     * Check if user has any of the given permissions
     */
    protected function hasAnyPermission($user, array $permissions): bool
    {
        $userRole = $user->role ?? 'member';
        $rolePerms = $this->rolePermissions[$userRole] ?? $this->rolePermissions['member'];
        
        // Check for custom user permissions (stored in JSON column)
        $customPerms = $user->permissions ?? [];
        $allUserPerms = array_merge($rolePerms, $customPerms);

        foreach ($permissions as $permission) {
            // Direct permission match
            if (in_array($permission, $allUserPerms)) {
                return true;
            }

            // Check for wildcard permissions (e.g., 'transactions.*' matches 'transactions.view')
            $parts = explode('.', $permission);
            if (count($parts) > 1) {
                $wildcard = $parts[0] . '.*';
                if (in_array($wildcard, $allUserPerms)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Get all permissions for a role
     */
    public static function getPermissionsForRole(string $role): array
    {
        $instance = new self();
        return $instance->rolePermissions[$role] ?? $instance->rolePermissions['member'];
    }

    /**
     * Get all available roles
     */
    public static function getAvailableRoles(): array
    {
        return ['admin', 'treasurer', 'auditor', 'welfare', 'member'];
    }

    /**
     * Get all available permissions
     */
    public static function getAllPermissions(): array
    {
        $instance = new self();
        $allPerms = [];
        
        foreach ($instance->rolePermissions as $perms) {
            $allPerms = array_merge($allPerms, $perms);
        }
        
        return array_unique($allPerms);
    }
}
