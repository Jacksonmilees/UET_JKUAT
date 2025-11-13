<?php
// app/Console/Commands/CreateSystemAccounts.php
namespace App\Console\Commands;

use App\Services\AccountService;
use App\Models\AccountType;
use Illuminate\Console\Command;

class CreateSystemAccounts extends Command
{
    protected $signature = 'accounts:create-system';
    protected $description = 'Create default system accounts';

    protected $accountService;

    public function __construct(AccountService $accountService)
    {
        parent::__construct();
        $this->accountService = $accountService;
    }

    public function handle()
    {
        $this->info('Creating system accounts...');

        // Create main ministry accounts
        $ministryType = AccountType::where('code', 'MIN')->first();
        $mainMinistry = $this->accountService->createAccount([
            'account_type_id' => $ministryType->id,
            'name' => 'Main Ministry Account',
            'metadata' => ['description' => 'Main ministry collection account']
        ]);

        foreach ($ministryType->subtypes as $subtype) {
            $this->accountService->createAccount([
                'account_type_id' => $ministryType->id,
                'account_subtype_id' => $subtype->id,
                'name' => $subtype->name . ' Account',
                'parent_id' => $mainMinistry->id,
                'metadata' => ['description' => $subtype->name . ' collection account']
            ]);
        }

        // Create activity accounts
        $activityType = AccountType::where('code', 'ACT')->first();
        foreach ($activityType->subtypes as $subtype) {
            $this->accountService->createAccount([
                'account_type_id' => $activityType->id,
                'account_subtype_id' => $subtype->id,
                'name' => $subtype->name . ' Account',
                'metadata' => ['description' => $subtype->name . ' activity account']
            ]);
        }

        $this->info('System accounts created successfully!');
    }
}
