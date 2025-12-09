<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\MemberIdService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates the super admin user if it doesn't exist.
     */
    public function run(): void
    {
        $superAdminEmail = 'admin@uetjkuat.com';
        
        // Check if super admin already exists
        $existingAdmin = User::where('email', $superAdminEmail)->first();
        
        if ($existingAdmin) {
            // Update existing user to super_admin if they're not already
            if ($existingAdmin->role !== 'super_admin') {
                $existingAdmin->update([
                    'role' => 'super_admin',
                    'status' => 'active',
                    'permissions' => json_encode(['all']), // Full access
                ]);
                $this->command->info('Updated existing admin to super_admin role.');
            } else {
                $this->command->info('Super admin already exists with correct role.');
            }
            return;
        }
        
        // Create new super admin
        $memberId = MemberIdService::generate();
        
        User::create([
            'name' => 'Super Admin',
            'email' => $superAdminEmail,
            'password' => Hash::make('Admin@2024!'), // Default password - CHANGE IN PRODUCTION
            'member_id' => $memberId,
            'phone_number' => '254700000000',
            'role' => 'super_admin',
            'status' => 'active',
            'permissions' => json_encode(['all']),
            'role_assigned_at' => now(),
            'registration_completed_at' => now(),
        ]);
        
        $this->command->info('Super admin created successfully!');
        $this->command->info('Email: ' . $superAdminEmail);
        $this->command->info('Password: Admin@2024!');
        $this->command->warn('Please change the password immediately after first login!');
    }
}
