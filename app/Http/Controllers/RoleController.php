<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    /**
     * Get all roles
     */
    public function index(Request $request)
    {
        try {
            // Check permission
            if (!$request->user()->hasPermission('view-roles')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            $roles = Role::withCount('users')->orderBy('level', 'desc')->get();

            return response()->json([
                'success' => true,
                'roles' => $roles,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch roles',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new role
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name',
            'description' => 'nullable|string',
            'permissions' => 'required|array',
            'permissions.*' => 'string',
            'level' => 'nullable|integer|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Check permission
            if (!$request->user()->hasPermission('create-roles')) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to create roles',
                ], 403);
            }

            $role = Role::create([
                'name' => $request->name,
                'slug' => Str::slug($request->name),
                'description' => $request->description,
                'permissions' => $request->permissions,
                'level' => $request->level ?? 0,
                'is_system' => false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Role created successfully',
                'role' => $role,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get specific role
     */
    public function show(Request $request, Role $role)
    {
        try {
            // Check permission
            if (!$request->user()->hasPermission('view-roles')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            $role->load('users');

            return response()->json([
                'success' => true,
                'role' => $role,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update role
     */
    public function update(Request $request, Role $role)
    {
        // Prevent editing system roles
        if ($role->is_system) {
            return response()->json([
                'success' => false,
                'message' => 'System roles cannot be modified',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:roles,name,' . $role->id,
            'description' => 'nullable|string',
            'permissions' => 'sometimes|required|array',
            'permissions.*' => 'string',
            'level' => 'nullable|integer|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Check permission
            if (!$request->user()->hasPermission('edit-roles')) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to edit roles',
                ], 403);
            }

            $role->update(array_filter([
                'name' => $request->name,
                'slug' => $request->name ? Str::slug($request->name) : null,
                'description' => $request->description,
                'permissions' => $request->permissions,
                'level' => $request->level,
            ], fn($value) => $value !== null));

            return response()->json([
                'success' => true,
                'message' => 'Role updated successfully',
                'role' => $role->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete role
     */
    public function destroy(Request $request, Role $role)
    {
        // Prevent deleting system roles
        if ($role->is_system) {
            return response()->json([
                'success' => false,
                'message' => 'System roles cannot be deleted',
            ], 403);
        }

        try {
            // Check permission
            if (!$request->user()->hasPermission('delete-roles')) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to delete roles',
                ], 403);
            }

            // Check if role has users
            if ($role->users()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete role with assigned users. Please reassign users first.',
                ], 400);
            }

            $role->delete();

            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Assign role to user
     */
    public function assignToUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Check permission
            if (!$request->user()->hasPermission('assign-roles')) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to assign roles',
                ], 403);
            }

            $user = User::findOrFail($request->user_id);
            $role = Role::findOrFail($request->role_id);

            $user->assignRole($role, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Role assigned successfully',
                'user' => $user->fresh()->load('roles'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove role from user
     */
    public function removeFromUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Check permission
            if (!$request->user()->hasPermission('assign-roles')) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to remove roles',
                ], 403);
            }

            $user = User::findOrFail($request->user_id);
            $role = Role::findOrFail($request->role_id);

            $user->removeRole($role);

            return response()->json([
                'success' => true,
                'message' => 'Role removed successfully',
                'user' => $user->fresh()->load('roles'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all available permissions
     */
    public function permissions(Request $request)
    {
        try {
            // Check permission
            if (!$request->user()->hasPermission('view-roles')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            $permissions = [
                // User Management
                ['slug' => 'view-users', 'name' => 'View Users', 'category' => 'User Management'],
                ['slug' => 'create-users', 'name' => 'Create Users', 'category' => 'User Management'],
                ['slug' => 'edit-users', 'name' => 'Edit Users', 'category' => 'User Management'],
                ['slug' => 'delete-users', 'name' => 'Delete Users', 'category' => 'User Management'],

                // Role Management
                ['slug' => 'view-roles', 'name' => 'View Roles', 'category' => 'Role Management'],
                ['slug' => 'create-roles', 'name' => 'Create Roles', 'category' => 'Role Management'],
                ['slug' => 'edit-roles', 'name' => 'Edit Roles', 'category' => 'Role Management'],
                ['slug' => 'delete-roles', 'name' => 'Delete Roles', 'category' => 'Role Management'],
                ['slug' => 'assign-roles', 'name' => 'Assign Roles to Users', 'category' => 'Role Management'],

                // Campaign Management
                ['slug' => 'view-campaigns', 'name' => 'View Campaigns', 'category' => 'Campaign Management'],
                ['slug' => 'create-campaigns', 'name' => 'Create Campaigns', 'category' => 'Campaign Management'],
                ['slug' => 'edit-campaigns', 'name' => 'Edit Campaigns', 'category' => 'Campaign Management'],
                ['slug' => 'delete-campaigns', 'name' => 'Delete Campaigns', 'category' => 'Campaign Management'],
                ['slug' => 'view-campaign-analytics', 'name' => 'View Campaign Analytics', 'category' => 'Campaign Management'],

                // Project Management
                ['slug' => 'view-projects', 'name' => 'View Projects', 'category' => 'Project Management'],
                ['slug' => 'create-projects', 'name' => 'Create Projects', 'category' => 'Project Management'],
                ['slug' => 'edit-projects', 'name' => 'Edit Projects', 'category' => 'Project Management'],
                ['slug' => 'delete-projects', 'name' => 'Delete Projects', 'category' => 'Project Management'],
                ['slug' => 'approve-projects', 'name' => 'Approve Projects', 'category' => 'Project Management'],

                // Financial Management
                ['slug' => 'view-transactions', 'name' => 'View All Transactions', 'category' => 'Financial Management'],
                ['slug' => 'create-withdrawals', 'name' => 'Create Withdrawals', 'category' => 'Financial Management'],
                ['slug' => 'approve-withdrawals', 'name' => 'Approve Withdrawals', 'category' => 'Financial Management'],
                ['slug' => 'reject-withdrawals', 'name' => 'Reject Withdrawals', 'category' => 'Financial Management'],
                ['slug' => 'view-reports', 'name' => 'View Financial Reports', 'category' => 'Financial Management'],
                ['slug' => 'export-reports', 'name' => 'Export Reports', 'category' => 'Financial Management'],
                ['slug' => 'pull-mpesa-transactions', 'name' => 'Pull M-Pesa Transactions', 'category' => 'Financial Management'],
                ['slug' => 'direct-withdrawals', 'name' => 'Direct Withdrawals (Bypass Approval)', 'category' => 'Financial Management'],

                // Audit & Compliance
                ['slug' => 'view-audit-logs', 'name' => 'View Audit Logs', 'category' => 'Audit & Compliance'],
                ['slug' => 'export-audit-logs', 'name' => 'Export Audit Logs', 'category' => 'Audit & Compliance'],

                // System Administration
                ['slug' => 'manage-settings', 'name' => 'Manage System Settings', 'category' => 'System Administration'],
                ['slug' => 'manage-announcements', 'name' => 'Manage Announcements', 'category' => 'System Administration'],
                ['slug' => 'manage-merchandise', 'name' => 'Manage Merchandise', 'category' => 'System Administration'],

                // Ticket Management
                ['slug' => 'create-tickets', 'name' => 'Create Tickets', 'category' => 'Ticket Management'],
                ['slug' => 'view-all-tickets', 'name' => 'View All Tickets', 'category' => 'Ticket Management'],
                ['slug' => 'validate-tickets', 'name' => 'Validate Tickets', 'category' => 'Ticket Management'],
            ];

            return response()->json([
                'success' => true,
                'permissions' => $permissions,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch permissions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get users with a specific role
     */
    public function roleUsers(Request $request, Role $role)
    {
        try {
            // Check permission
            if (!$request->user()->hasPermission('view-roles')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            $users = $role->users()
                ->select('users.id', 'users.name', 'users.email', 'users.phone')
                ->withPivot('assigned_at', 'assigned_by')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'users' => $users,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
