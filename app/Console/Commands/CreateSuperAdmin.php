<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\MemberIdService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateSuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'admin:create-super 
                            {--email=admin@uetjkuat.com : The super admin email}
                            {--password=Admin@2024! : The super admin password}
                            {--force : Force update existing user to super_admin}
                            {--delete-first : Delete existing super admin first}';

    /**
     * The console command description.
     */
    protected $description = 'Create or update the super admin user';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->option('email');
        $password = $this->option('password');
        $force = $this->option('force');
        $deleteFirst = $this->option('delete-first');

        $this->info("Creating/updating super admin with email: {$email}");

        // Check if user exists
        $existingUser = User::where('email', $email)->first();

        if ($existingUser && $deleteFirst) {
            $existingUser->delete();
            $this->warn("Deleted existing user with email: {$email}");
            $existingUser = null;
        }

        if ($existingUser) {
            if ($existingUser->role === 'super_admin' && !$force) {
                $this->info("Super admin already exists with correct role.");
                $this->table(
                    ['ID', 'Name', 'Email', 'Role', 'Status'],
                    [[$existingUser->id, $existingUser->name, $existingUser->email, $existingUser->role, $existingUser->status]]
                );
                return Command::SUCCESS;
            }

            // Update to super_admin
            $existingUser->update([
                'role' => 'super_admin',
                'status' => 'active',
                'permissions' => json_encode(['all']),
                'password' => Hash::make($password),
            ]);

            $this->info("Updated existing user to super_admin role.");
            $this->table(
                ['ID', 'Name', 'Email', 'Role', 'Status'],
                [[$existingUser->id, $existingUser->name, $existingUser->email, $existingUser->role, $existingUser->status]]
            );
            return Command::SUCCESS;
        }

        // Create new super admin
        try {
            $memberId = MemberIdService::generate();
        } catch (\Exception $e) {
            $memberId = 'SA-' . date('Ymd') . '-' . rand(1000, 9999);
        }

        $user = User::create([
            'name' => 'Super Admin',
            'email' => $email,
            'password' => Hash::make($password),
            'member_id' => $memberId,
            'phone_number' => '254700000000',
            'role' => 'super_admin',
            'status' => 'active',
            'permissions' => json_encode(['all']),
            'role_assigned_at' => now(),
        ]);

        $this->info("Super admin created successfully!");
        $this->table(
            ['ID', 'Name', 'Email', 'Role', 'Status', 'Member ID'],
            [[$user->id, $user->name, $user->email, $user->role, $user->status, $user->member_id]]
        );

        $this->newLine();
        $this->warn("Default credentials:");
        $this->line("  Email: {$email}");
        $this->line("  Password: {$password}");
        $this->warn("Please change the password after first login!");

        return Command::SUCCESS;
    }
}
