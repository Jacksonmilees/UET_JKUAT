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

            // Fetch transactions from your own backend (stored M-Pesa callbacks)
            // Use the same Heroku backend to fetch stored transactions
            $externalUrl = 'https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/transactions';
            
            $response = Http::timeout(30)->get($externalUrl);
            
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

    /**
     * Get all M-Pesa transactions with pagination and filters
     */
    public function getAllMpesaTransactions(Request $request)
    {
        try {
            $query = Transaction::query()
                ->where('payment_method', 'mpesa')
                ->orderBy('created_at', 'desc');
            
            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            if ($request->has('from_date')) {
                $query->whereDate('created_at', '>=', $request->from_date);
            }
            
            if ($request->has('to_date')) {
                $query->whereDate('created_at', '<=', $request->to_date);
            }
            
            if ($request->has('phone')) {
                $query->where('phone_number', 'like', '%' . $request->phone . '%');
            }
            
            if ($request->has('min_amount')) {
                $query->where('amount', '>=', $request->min_amount);
            }
            
            if ($request->has('max_amount')) {
                $query->where('amount', '<=', $request->max_amount);
            }
            
            // Get totals
            $totals = [
                'count' => (clone $query)->count(),
                'total_amount' => (clone $query)->sum('amount'),
                'completed_amount' => (clone $query)->where('status', 'completed')->sum('amount'),
            ];
            
            // Paginate
            $perPage = $request->get('per_page', 50);
            $transactions = $query->paginate($perPage);
            
            return response()->json([
                'success' => true,
                'data' => $transactions->items(),
                'totals' => $totals,
                'pagination' => [
                    'current_page' => $transactions->currentPage(),
                    'last_page' => $transactions->lastPage(),
                    'per_page' => $transactions->perPage(),
                    'total' => $transactions->total(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get M-Pesa transactions', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Manually add a transaction (for importing from Org Portal statements)
     */
    public function addManualTransaction(Request $request)
    {
        $request->validate([
            'trans_id' => 'required|string|unique:transactions,reference',
            'amount' => 'required|numeric|min:1',
            'phone_number' => 'required|string',
            'payer_name' => 'nullable|string',
            'trans_time' => 'nullable|date',
            'bill_ref' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Get or create main account
            $mainAccount = Account::first();
            if (!$mainAccount) {
                $accountType = DB::table('account_types')->where('code', 'GEN')->first();
                $accountTypeId = $accountType ? $accountType->id : DB::table('account_types')->insertGetId([
                    'name' => 'General',
                    'code' => 'GEN',
                    'description' => 'General Account',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                $accountSubtype = DB::table('account_subtypes')->where('code', 'MAIN')->first();
                $accountSubtypeId = $accountSubtype ? $accountSubtype->id : DB::table('account_subtypes')->insertGetId([
                    'account_type_id' => $accountTypeId,
                    'name' => 'Main',
                    'code' => 'MAIN',
                    'description' => 'Main Account',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

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

            $transaction = Transaction::create([
                'account_id' => $mainAccount->id,
                'transaction_id' => $request->trans_id,
                'amount' => $request->amount,
                'type' => 'credit',
                'payment_method' => 'mpesa',
                'status' => 'completed',
                'reference' => $request->trans_id,
                'phone_number' => $request->phone_number,
                'payer_name' => $request->payer_name ?? 'Manual Import',
                'metadata' => [
                    'transaction_type' => 'Pay Bill',
                    'bill_reference' => $request->bill_ref ?? 'General',
                    'imported_from' => 'manual',
                    'imported_at' => now()->toIso8601String(),
                    'imported_by' => auth()->user()->name ?? 'Admin'
                ],
                'processed_at' => $request->trans_time ? \Carbon\Carbon::parse($request->trans_time) : now(),
            ]);

            // Update account balance
            $mainAccount->increment('balance', $request->amount);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transaction added successfully',
                'data' => $transaction
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to add manual transaction', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk import transactions from Org Portal CSV/JSON data
     */
    public function syncFromOrgPortal(Request $request)
    {
        $request->validate([
            'transactions' => 'required|array',
            'transactions.*.trans_id' => 'required|string',
            'transactions.*.amount' => 'required|numeric|min:0',
            'transactions.*.phone_number' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            // Get or create main account
            $mainAccount = Account::first();
            if (!$mainAccount) {
                return response()->json([
                    'success' => false,
                    'message' => 'No main account found. Please create an account first.'
                ], 400);
            }

            $imported = 0;
            $skipped = 0;
            $failed = 0;
            $totalAmount = 0;
            $importedTransactions = [];

            foreach ($request->transactions as $txn) {
                try {
                    // Check if already exists
                    if (Transaction::where('reference', $txn['trans_id'])->exists()) {
                        $skipped++;
                        continue;
                    }

                    $amount = floatval($txn['amount']);
                    if ($amount <= 0) {
                        $failed++;
                        continue;
                    }

                    $transaction = Transaction::create([
                        'account_id' => $mainAccount->id,
                        'transaction_id' => $txn['trans_id'],
                        'amount' => $amount,
                        'type' => 'credit',
                        'payment_method' => 'mpesa',
                        'status' => 'completed',
                        'reference' => $txn['trans_id'],
                        'phone_number' => $txn['phone_number'],
                        'payer_name' => $txn['payer_name'] ?? 'Org Portal Import',
                        'metadata' => [
                            'transaction_type' => $txn['type'] ?? 'Pay Bill',
                            'bill_reference' => $txn['bill_ref'] ?? 'General',
                            'imported_from' => 'org_portal',
                            'imported_at' => now()->toIso8601String(),
                        ],
                        'processed_at' => isset($txn['trans_time']) ? \Carbon\Carbon::parse($txn['trans_time']) : now(),
                    ]);

                    $imported++;
                    $totalAmount += $amount;
                    $importedTransactions[] = $transaction;

                } catch (\Exception $e) {
                    $failed++;
                    Log::warning('Failed to import transaction', [
                        'trans_id' => $txn['trans_id'] ?? 'unknown',
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Update account balance
            if ($totalAmount > 0) {
                $mainAccount->increment('balance', $totalAmount);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Import completed: {$imported} imported, {$skipped} skipped (duplicates), {$failed} failed",
                'data' => [
                    'imported' => $imported,
                    'skipped' => $skipped,
                    'failed' => $failed,
                    'total_amount' => $totalAmount,
                    'new_balance' => $mainAccount->fresh()->balance,
                    'recent_imports' => array_slice($importedTransactions, 0, 10)
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Org Portal sync failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Sync failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
