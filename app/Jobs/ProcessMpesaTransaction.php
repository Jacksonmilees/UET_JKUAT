<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Project;
use App\Models\Donation;
use App\Models\MpesaTransactionLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ProcessMpesaTransaction implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $transaction;

    public function __construct(array $transaction)
    {
        $this->transaction = $transaction;
    }

    public function handle()
    {
        DB::beginTransaction();
        
        try {
            // Check if transaction already processed
            if (Donation::where('transaction_id', $this->transaction['TransID'])->exists()) {
                return;
            }

            // Find project by account number
            $project = Project::where('account_number', $this->transaction['BillRefNumber'])->first();

            if (!$project) {
                Log::warning('Project not found for account:', [
                    'account' => $this->transaction['BillRefNumber'],
                    'transaction' => $this->transaction['TransID']
                ]);
                return;
            }

            // Create donation record
            $donation = Donation::create([
                'project_id' => $project->id,
                'amount' => floatval($this->transaction['TransAmount']),
                'transaction_id' => $this->transaction['TransID'],
                'phone_number' => $this->transaction['MSISDN'],
                'donor_name' => trim($this->transaction['FirstName'] . ' ' . 
                                ($this->transaction['MiddleName'] ?? '') . ' ' . 
                                ($this->transaction['LastName'] ?? '')),
                'status' => 'completed'
            ]);

            // Update project current amount
            $project->increment('current_amount', $donation->amount);

            // Log transaction
            MpesaTransactionLog::create([
                'transaction_id' => $this->transaction['TransID'],
                'status' => 'processed',
                'details' => json_encode($this->transaction)
            ]);

            // Mark as processed in callback system
            $markProcessed = Http::post('test.moutjkuatministry.cloud/api/mark-processed', [
                'transaction_id' => $this->transaction['TransID']
            ]);

            if (!$markProcessed->successful()) {
                throw new \Exception('Failed to mark transaction as processed');
            }

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error processing transaction:', [
                'transaction_id' => $this->transaction['TransID'] ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
}