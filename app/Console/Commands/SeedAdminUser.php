<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SeedAdminUser extends Command
{
    protected $signature = 'seed:admin {email} {password} {--name=Admin User}';
    protected $description = 'Create or update an admin user with given email and password';

    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');
        $name = $this->option('name');

        $user = User::firstOrNew(['email' => $email]);
        $user->name = $name;
        $user->password = Hash::make($password);
        // Optional fields if present
        if (!isset($user->status)) {
            // ignore if column does not exist
        }
        $user->save();

        $this->info("Admin user seeded: {$email}");
        return Command::SUCCESS;
    }
}



