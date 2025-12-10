<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use Illuminate\Support\Str;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define all available permissions
        $allPermissions = [
            // User Management
            'view-users',
            'create-users',
            'edit-users',
            'delete-users',

            // Role Management
            'view-roles',
            'create-roles',
            'edit-roles',
            'delete-roles',
            'assign-roles',

            // Campaign Management
            'view-campaigns',
            'create-campaigns',
            'edit-campaigns',
            'delete-campaigns',
            'view-campaign-analytics',

            // Project Management
            'view-projects',
            'create-projects',
            'edit-projects',
            'delete-projects',
            'approve-projects',

            // Financial Management
            'view-transactions',
            'create-withdrawals',
            'approve-withdrawals',
            'reject-withdrawals',
            'view-reports',
            'export-reports',
            'pull-mpesa-transactions',
            'direct-withdrawals',

            // Audit & Compliance
            'view-audit-logs',
            'export-audit-logs',

            // System Administration
            'manage-settings',
            'manage-announcements',
            'manage-merchandise',

            // Ticket Management
            'create-tickets',
            'view-all-tickets',
            'validate-tickets',
        ];

        // Define roles with their permissions
        $roles = [
            [
                'name' => 'Super Admin',
                'slug' => 'super-admin',
                'description' => 'Full system access with all permissions. Can manage roles, users, and all financial operations.',
                'permissions' => $allPermissions, // All permissions
                'is_system' => true,
                'level' => 100,
            ],
            [
                'name' => 'Treasurer',
                'slug' => 'treasurer',
                'description' => 'Financial manager with approval authority. Can approve/reject withdrawals, view all transactions, and generate reports.',
                'permissions' => [
                    'view-users',
                    'view-roles',
                    'view-campaigns',
                    'view-campaign-analytics',
                    'view-projects',
                    'view-transactions',
                    'approve-withdrawals',
                    'reject-withdrawals',
                    'view-reports',
                    'export-reports',
                    'view-audit-logs',
                    'export-audit-logs',
                    'pull-mpesa-transactions',
                ],
                'is_system' => true,
                'level' => 90,
            ],
            [
                'name' => 'Project Manager',
                'slug' => 'project-manager',
                'description' => 'Can create and manage projects, create campaigns, and oversee project fundraising activities.',
                'permissions' => [
                    'view-users',
                    'view-campaigns',
                    'create-campaigns',
                    'edit-campaigns',
                    'view-campaign-analytics',
                    'view-projects',
                    'create-projects',
                    'edit-projects',
                    'approve-projects',
                    'view-transactions',
                    'create-withdrawals',
                    'view-reports',
                    'create-tickets',
                    'view-all-tickets',
                ],
                'is_system' => true,
                'level' => 70,
            ],
            [
                'name' => 'Account Manager',
                'slug' => 'account-manager',
                'description' => 'Can manage user accounts, create campaigns, and handle basic fundraising operations.',
                'permissions' => [
                    'view-users',
                    'edit-users',
                    'view-campaigns',
                    'create-campaigns',
                    'edit-campaigns',
                    'view-campaign-analytics',
                    'view-projects',
                    'view-transactions',
                    'create-withdrawals',
                    'view-reports',
                    'create-tickets',
                ],
                'is_system' => true,
                'level' => 60,
            ],
            [
                'name' => 'Auditor',
                'slug' => 'auditor',
                'description' => 'Read-only access to audit logs, transactions, and reports for compliance monitoring.',
                'permissions' => [
                    'view-users',
                    'view-roles',
                    'view-campaigns',
                    'view-campaign-analytics',
                    'view-projects',
                    'view-transactions',
                    'view-reports',
                    'export-reports',
                    'view-audit-logs',
                    'export-audit-logs',
                ],
                'is_system' => true,
                'level' => 50,
            ],
            [
                'name' => 'Member',
                'slug' => 'member',
                'description' => 'Basic member with ability to create campaigns, view their own projects, and manage tickets.',
                'permissions' => [
                    'view-campaigns',
                    'create-campaigns',
                    'edit-campaigns',
                    'view-campaign-analytics',
                    'view-projects',
                    'create-projects',
                    'edit-projects',
                    'create-withdrawals',
                    'create-tickets',
                ],
                'is_system' => true,
                'level' => 10,
            ],
        ];

        // Create or update roles
        foreach ($roles as $roleData) {
            $role = Role::updateOrCreate(
                ['slug' => $roleData['slug']],
                [
                    'name' => $roleData['name'],
                    'description' => $roleData['description'],
                    'permissions' => $roleData['permissions'],
                    'is_system' => $roleData['is_system'],
                    'level' => $roleData['level'],
                ]
            );

            $this->command->info("Created/Updated role: {$role->name}");
        }

        $this->command->info('Roles and permissions seeded successfully!');
    }
}
