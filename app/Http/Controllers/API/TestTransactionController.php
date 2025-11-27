<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TestTransactionController extends Controller
{
    /**
     * Create test transactions for debugging
     */
    public function createTestTransactions(Request $request)
    {
        try {
            DB::beginTransaction();

            // Create a test account if none exists
            $account = Account::first();
            
            if (!$account) {
                $account = Account::create([
                    'reference' => 'MAIN-ACCOUNT',
                    'name' => 'Main Account',
                    'type' => 'general',
                    'balance' => 0,
                    'status' => 'active',
                    'metadata' => ['created_for' => 'testing']
                ]);
                
                Log::info('Created test account', ['account_id' => $account->id]);
            }

            // Create sample transactions
            $transactions = [];
            $sampleData = [
                [
                    'amount' => 100,
                    'type' => 'credit',
                    'description' => 'Registration Fee',
                    'phone' => '254708405553',
                    'payer' => 'Test User 1'
                ],
                [
                    'amount' => 500,
                    'type' => 'credit',
                    'description' => 'Donation',
                    'phone' => '254706400432',
                    'payer' => 'Test User 2'
                ],
                [
                    'amount' => 200,
                    'type' => 'credit',
                    'description' => 'Event Ticket',
                    'phone' => '254794711258',
                    'payer' => 'Test User 3'
                ]
            ];

            foreach ($sampleData as $data) {
                $transaction = Transaction::create([
                    'account_id' => $account->id,
                    'transaction_id' => 'TEST-' . uniqid(),
                    'amount' => $data['amount'],
                    'type' => $data['type'],
                    'payment_method' => 'mpesa',
                    'status' => 'completed',
                    'reference' => 'MPESA-' . uniqid(),
                    'phone_number' => $data['phone'],
                    'payer_name' => $data['payer'],
                    'metadata' => [
                        'description' => $data['description'],
                        'test_transaction' => true,
                        'created_at' => now()->toDateTimeString()
                    ],
                    'processed_at' => now()
                ]);

                // Update account balance
                $account->balance += $data['amount'];
                $account->save();

                $transactions[] = $transaction;
                
                Log::info('Created test transaction', [
                    'transaction_id' => $transaction->id,
                    'amount' => $data['amount']
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Test transactions created successfully',
                'data' => [
                    'account' => $account,
                    'transactions' => $transactions,
                    'total_amount' => $account->balance
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to create test transactions', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create test transactions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear all test transactions
     */
    public function clearTestTransactions()
    {
        try {
            DB::beginTransaction();

            // Delete test transactions
            $deleted = Transaction::whereJsonContains('metadata->test_transaction', true)->delete();
            
            // Reset account balances
            Account::query()->update(['balance' => 0]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => "Cleared {$deleted} test transactions"
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to clear test transactions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get callback statistics
     */
    public function getCallbackStats()
    {
        try {
            $stats = [
                'total_transactions' => Transaction::count(),
                'completed_transactions' => Transaction::where('status', 'completed')->count(),
                'total_amount' => Transaction::where('status', 'completed')->sum('amount'),
                'total_accounts' => Account::count(),
                'accounts_with_balance' => Account::where('balance', '>', 0)->count(),
                'recent_transactions' => Transaction::with('account:id,reference,name')
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
