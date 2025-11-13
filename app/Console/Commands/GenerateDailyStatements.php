<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\AccountStatementService;

class GenerateDailyStatements extends Command
{
    protected $signature = 'statements:daily';
    protected $description = 'Generate and send daily account statements';

    protected $statementService;

    public function __construct(AccountStatementService $statementService)
    {
        parent::__construct();
        $this->statementService = $statementService;
    }

    public function handle()
    {
        $this->info('Starting daily statement generation...');

        try {
            $this->statementService->generateAndSendDailyStatements();
            $this->info('Daily statements generated and sent successfully!');
        } catch (\Exception $e) {
            $this->error('Failed to generate statements: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
