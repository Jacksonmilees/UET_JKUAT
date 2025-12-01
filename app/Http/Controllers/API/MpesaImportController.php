<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Account;
use App\Services\AccountService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class MpesaImportController extends Controller
{
    protected $accountService;

    public function __construct(AccountService $accountService)
    {
        $this->accountService = $accountService;
    }

    /**
     * Fetch and import real M-Pesa transactions from external API
     */
    public function importRealTransactions(Request $request)
    {
        try {
            Log::info('Starting M-Pesa transaction import');

            // Fetch transactions from your M-Pesa callback storage
            $externalUrl = 'https://test.moutjkuatministry.cloud/api/get-latest-transactions';
            
            $response = Http::withOptions([
                'verify' => false, // Bypass SSL verification
            ])->timeout(30)->get($externalUrl);
            
            if (!$response->successful()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to fetch M-Pesa transactions',
                    'details' => $response->body()
                ], 500);
            }

            $mpesaTransactions = $response->json();

            if (!is_array($mpesaTransactions) || empty($mpesaTransactions)) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'No new M-Pesa transactions found',
                    'data' => [
                        'imported' => 0,
                        'skipped' => 0,
                        'failed' => 0
                    ]
                ]);
            }

            DB::beginTransaction();

            $imported = 0;
            $skipped = 0;
            $failed = 0;
            $importedTransactions = [];

            // Get or create main account
            $mainAccount = Account::first();
            if (!$mainAccount) {
                // Create account type and subtype if needed
                $accountType = DB::table('account_types')->where('code', 'GEN')->first();
                if (!$accountType) {
                    $accountTypeId = DB::table('account_types')->insertGetId([
                        'name' => 'General',
                        'code' => 'GEN',
                        'description' => 'General Account',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                } else {
                    $accountTypeId = $accountType->id;
                }

                $accountSubtype = DB::table('account_subtypes')->where('code', 'MAIN')->first();
                if (!$accountSubtype) {
                    $accountSubtypeId = DB::table('account_subtypes')->insertGetId([
                        'account_type_id' => $accountTypeId,
                        'name' => 'Main',
                        'code' => 'MAIN',
                        'description' => 'Main Account',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                } else {
                    $accountSubtypeId = $accountSubtype->id;
                }

                $mainAccount = Account::create([
                    'reference' => 'MPESA-MAIN',
                    'name' => 'M-Pesa Main Account',
                    'account_type_id' => $accountTypeId,
                    'account_subtype_id' => $accountSubtypeId,
                    'type' => 'general',
                    'balance' => 0,
                    'status' => 'active',
                    'metadata' => ['source' => 'mpesa_import']
                ]);
            }

            foreach ($mpesaTransactions as $mpesaData) {
                try {
                    // Check if transaction already exists
                    $transId = $mpesaData['TransID'] ?? null;
                    if (!$transId) {
                        $failed++;
                        continue;
                    }

                    $exists = Transaction::where('reference', $transId)->exists();
                    if ($exists) {
                        $skipped++;
                        Log::info('Skipping duplicate transaction', ['TransID' => $transId]);
                        continue;
                    }

                    // Extract transaction data
                    $amount = floatval($mpesaData['TransAmount'] ?? 0);
                    $phone = $mpesaData['MSISDN'] ?? $mpesaData['PhoneNumber'] ?? null;
                    $payerName = $mpesaData['FirstName'] ?? $mpesaData['BillRefNumber'] ?? 'Unknown';
                    $transTime = $mpesaData['TransTime'] ?? now();
                    $billRef = $mpesaData['BillRefNumber'] ?? 'General';

                    if ($amount <= 0) {
                        $failed++;
                        continue;
                    }

                    // Create transaction
                    $transaction = Transaction::create([
                        'account_id' => $mainAccount->id,
                        'transaction_id' => $transId,
                        'amount' => $amount,
                        'type' => 'credit',
                        'payment_method' => 'mpesa',
                        'status' => 'completed',
                        'reference' => $transId,
                        'phone_number' => $phone,
                        'payer_name' => $payerName,
                        'metadata' => [
                            'transaction_type' => $mpesaData['TransactionType'] ?? 'Payment',
                            'bill_reference' => $billRef,
                            'trans_time' => $transTime,
                            'business_shortcode' => $mpesaData['BusinessShortCode'] ?? null,
                            'imported_from' => 'external_api',
                            'imported_at' => now()->toDateTimeString(),
                            'raw_data' => $mpesaData
                        ],
                        'processed_at' => now()
                    ]);

                    // Update account balance
                    $mainAccount->balance += $amount;
                    $mainAccount->save();

                    $importedTransactions[] = $transaction;
                    $imported++;

                    Log::info('Imported M-Pesa transaction', [
                        'TransID' => $transId,
                        'Amount' => $amount,
                        'Payer' => $payerName
                    ]);

                } catch (\Exception $e) {
                    $failed++;
                    Log::error('Failed to import M-Pesa transaction', [
                        'TransID' => $transId ?? 'unknown',
                        'error' => $e->getMessage()
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => "M-Pesa import completed: {$imported} imported, {$skipped} skipped, {$failed} failed",
                'data' => [
                    'imported' => $imported,
                    'skipped' => $skipped,
                    'failed' => $failed,
                    'total_amount' => $mainAccount->balance,
                    'account' => [
                        'id' => $mainAccount->id,
                        'reference' => $mainAccount->reference,
                        'balance' => $mainAccount->balance
                    ],
                    'recent_transactions' => $importedTransactions
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('M-Pesa import failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to import M-Pesa transactions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get import statistics
     */
    public function getImportStats()
    {
        try {
            $stats = [
                'total_transactions' => Transaction::count(),
                'mpesa_transactions' => Transaction::where('payment_method', 'mpesa')->count(),
                'total_amount' => Transaction::where('status', 'completed')->sum('amount'),
                'imported_transactions' => Transaction::whereJsonContains('metadata->imported_from', 'external_api')->count(),
                'recent_imports' => Transaction::whereJsonContains('metadata->imported_from', 'external_api')
                    ->latest()
                    ->limit(10)
                    ->get()
            ];

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
