<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\API\MpesaTransactionController;
use Illuminate\Support\Facades\Log;

class ProcessMpesaTransactions extends Command
{
    /**
     * The name and signature of the console command
     *
     * @var string
     */
    protected $signature = 'mpesa:process-transactions';

    /**
     * The console command description
     *
     * @var string
     */
    protected $description = 'Process pending M-Pesa transactions from callback URL';

    /**
     * Execute the console command
     *
     * @return int
     */
    public function handle()
    {
        try {
            $this->info('Starting M-Pesa transaction processing...');

            $controller = app(MpesaTransactionController::class);
            $result = $controller->processTransactions(true);

            if ($result['success']) {
                $this->info($result['message']);

                // Check for verbosity using Symfony's built-in flags
                if ($this->output->isVerbose() && isset($result['data'])) {
                    $this->table(
                        ['Metric', 'Count'],
                        [
                            ['Processed', $result['data']['processed']],
                            ['Failed', $result['data']['failed']]
                        ]
                    );
                }

                return Command::SUCCESS;
            } else {
                $this->error($result['message']);
                return Command::FAILURE;
            }

        } catch (\Exception $e) {
            Log::error('Command execution failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $this->error('Command failed: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
