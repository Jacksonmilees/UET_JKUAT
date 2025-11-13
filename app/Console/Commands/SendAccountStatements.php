<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\AccountStatementService;
use Carbon\Carbon;

class SendAccountStatements extends Command
{
    protected $signature = 'statements:send 
        {--start=: Start date for statements (Y-m-d)}
        {--end=: End date for statements (Y-m-d)}';

    protected $description = 'Send account statements for all accounts';

    public function handle(AccountStatementService $accountStatementService)
    {
        $startDate = $this->option('start') 
            ? Carbon::parse($this->option('start'))->startOfDay() 
            : null;
        
        $endDate = $this->option('end') 
            ? Carbon::parse($this->option('end'))->endOfDay() 
            : null;

        try {
            $results = $accountStatementService->generateAccountStatements($startDate, $endDate);
            
            $this->info("Account Statements Processing Complete:");
            $this->table(
                ['Metric', 'Count'],
                [
                    ['Processed Accounts', $results['processed']],
                    ['Failed Accounts', $results['failed']],
                    ['Statements Sent', $results['sent']]
                ]
            );
        } catch (\Exception $e) {
            $this->error('Failed to send account statements: ' . $e->getMessage());
        }
    }
}