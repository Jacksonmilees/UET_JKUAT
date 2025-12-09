<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ListAdmins extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'admin:list {--all : Show all users, not just admins}';

    /**
     * The console command description.
     */
    protected $description = 'List all admin and super_admin users';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if ($this->option('all')) {
            $users = User::orderBy('role')->orderBy('created_at', 'desc')->get();
            $this->info("All users:");
        } else {
            $users = User::whereIn('role', ['admin', 'super_admin'])
                ->orderBy('role')
                ->orderBy('created_at', 'desc')
                ->get();
            $this->info("Admin users:");
        }

        if ($users->isEmpty()) {
            $this->warn("No users found.");
            return Command::SUCCESS;
        }

        $this->table(
            ['ID', 'Name', 'Email', 'Role', 'Status', 'Created At'],
            $users->map(fn($u) => [
                $u->id,
                $u->name,
                $u->email,
                $u->role,
                $u->status,
                $u->created_at->format('Y-m-d H:i'),
            ])->toArray()
        );

        $this->newLine();
        $this->line("Total: {$users->count()} user(s)");
        
        // Summary by role
        $summary = $users->groupBy('role')->map->count();
        foreach ($summary as $role => $count) {
            $this->line("  - {$role}: {$count}");
        }

        return Command::SUCCESS;
    }
}
