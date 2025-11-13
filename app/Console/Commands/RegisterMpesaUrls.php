<?php

namespace App\Console\Commands;

use App\Services\DarajaApiService;
use Illuminate\Console\Command;

class RegisterMpesaUrls extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mpesa:register-urls';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Register confirmation and validation URLs with M-Pesa';

    /**
     * The Daraja API service instance.
     *
     * @var \App\Services\DarajaApiService
     */
    protected $darajaService;

    /**
     * Create a new command instance.
     *
     * @param \App\Services\DarajaApiService $darajaService
     * @return void
     */
    public function __construct(DarajaApiService $darajaService)
    {
        parent::__construct();
        $this->darajaService = $darajaService;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Registering M-Pesa URLs...');

        try {
            $response = $this->darajaService->registerUrls();
            
            if (isset($response['ResponseDescription'])) {
                $this->info('Success: ' . $response['ResponseDescription']);
                return Command::SUCCESS;
            }
            
            $this->info('URLs registered successfully!');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to register URLs: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}