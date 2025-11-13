<?php
// app/Http/Controllers/API/MpesaTransactionController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Donation;
use App\Models\MpesaTransactionLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use App\Jobs\ProcessMpesaTransaction;
use Illuminate\Http\JsonResponse;

class MpesaTransactionController extends Controller
{
    private const TREASURER_WHATSAPP_NUMBERS = [
        '+254708405553',
        '+254706400432',
        '+254794711258'
    ];

    private $paymentsDB;
    private $notificationService;

    public function __construct()
    {
        $this->paymentsDB = DB::connection('payments_db');
        $this->notificationService = new NotificationService(self::TREASURER_WHATSAPP_NUMBERS);
    }
    /**
     * Process multiple M-Pesa transactions
     *
     * @param bool $isConsole Whether the method is being called from console
     * @return array|JsonResponse
     */


    public function processTransactions($isConsole = false)
    {
        try {
            // Log the attempt
            Log::info('Starting transaction processing');

            // Fetch transactions from callback URL
            $response = Http::timeout(30)->get('test.moutjkuatministry.cloud/api/get-latest-transactions');
            
            if (!$response->successful()) {
                throw new \Exception('Failed to fetch transactions: ' . $response->body());
            }

            $transactions = $response->json();

            if (!is_array($transactions)) {
                throw new \Exception('Invalid response format from callback URL');
            }

            $processedCount = 0;
            $failedCount = 0;

            foreach ($transactions as $transaction) {
                try {
                    // Validate transaction data
                    if (!isset($transaction['TransID'], $transaction['TransAmount'], $transaction['BillRefNumber'])) {
                        Log::warning('Invalid transaction data', ['transaction' => $transaction]);
                        $failedCount++;
                        continue;
                    }

                    // Check for duplicate transaction
                    if (MpesaTransactionLog::where('transaction_id', $transaction['TransID'])->exists()) {
                        Log::info('Duplicate transaction skipped', ['TransID' => $transaction['TransID']]);
                        continue;
                    }

                    // Dispatch job to process transaction
                    ProcessMpesaTransaction::dispatch($transaction);
                    $processedCount++;

                    // Log successful queue
                    Log::info('Transaction queued for processing', [
                        'TransID' => $transaction['TransID'],
                        'Amount' => $transaction['TransAmount']
                    ]);

                } catch (\Exception $e) {
                    $failedCount++;
                    Log::error('Error processing individual transaction', [
                        'TransID' => $transaction['TransID'] ?? 'unknown',
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Prepare response message
            $message = "Processed M-Pesa transactions: {$processedCount} queued";
            if ($failedCount > 0) {
                $message .= ", {$failedCount} failed";
            }

            // Return based on caller type
            if ($isConsole) {
                return [
                    'success' => true,
                    'message' => $message,
                    'data' => [
                        'processed' => $processedCount,
                        'failed' => $failedCount
                    ]
                ];
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'processed' => $processedCount,
                    'failed' => $failedCount
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in transaction processing:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $message = 'Error processing M-Pesa transactions: ' . $e->getMessage();

            if ($isConsole) {
                return [
                    'success' => false,
                    'message' => $message
                ];
            }

            return response()->json([
                'success' => false,
                'message' => $message
            ], 500);
        }
    }

    /**
     * Process a single M-Pesa transaction
     *
     * @param string $transactionId
     * @return JsonResponse
     */
    public function processTransaction(string $transactionId)
    {
        try {
            // Check if already processed
            if (MpesaTransactionLog::where('transaction_id', $transactionId)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction already processed'
                ]);
            }

            // Fetch transaction details
            $response = Http::get("test.moutjkuatministry.cloud/api/get-transaction/{$transactionId}");
            
            if (!$response->successful()) {
                throw new \Exception('Transaction not found or error fetching details');
            }

            $transaction = $response->json();

            // Validate transaction data
            if (!isset($transaction['TransID'], $transaction['TransAmount'], $transaction['BillRefNumber'])) {
                throw new \Exception('Invalid transaction data received');
            }

            // Queue the transaction for processing
            ProcessMpesaTransaction::dispatch($transaction);

            Log::info('Single transaction queued for processing', [
                'TransID' => $transactionId
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transaction queued for processing'
            ]);

        } catch (\Exception $e) {
            Log::error('Error processing single transaction:', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    private function sendNotifications($processedData, $transaction): void
    {
        $this->notificationService->sendTransactionNotifications($transaction, $processedData);
    }
}
