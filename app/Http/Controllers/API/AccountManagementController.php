<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AccountManagementController extends Controller
{
    /**
     * Create a new account
     */
    public function createAccount(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'type' => 'required|string',
                'description' => 'nullable|string',
                'project_id' => 'nullable|exists:projects,id',
            ]);

            DB::beginTransaction();

            // Get or create account type
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

            // Get or create account subtype
            $accountSubtype = DB::table('account_subtypes')->where('code', 'PROJ')->first();
            if (!$accountSubtype) {
                $accountSubtypeId = DB::table('account_subtypes')->insertGetId([
                    'account_type_id' => $accountTypeId,
                    'name' => 'Project',
                    'code' => 'PROJ',
                    'description' => 'Project Account',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            } else {
                $accountSubtypeId = $accountSubtype->id;
            }

            // Generate unique account reference
            $reference = $this->generateAccountReference($validated['name']);

            // Create account
            $account = Account::create([
                'reference' => $reference,
                'name' => $validated['name'],
                'account_type_id' => $accountTypeId,
                'account_subtype_id' => $accountSubtypeId,
                'type' => $validated['type'],
                'balance' => 0,
                'status' => 'active',
                'metadata' => [
                    'description' => $validated['description'] ?? '',
                    'project_id' => $validated['project_id'] ?? null,
                    'created_by' => 'admin',
                    'created_at' => now()->toDateTimeString()
                ]
            ]);

            DB::commit();

            Log::info('Account created', [
                'account_id' => $account->id,
                'reference' => $reference
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Account created successfully',
                'data' => $account
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Account creation failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create account: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate unique account reference
     */
    private function generateAccountReference($name)
    {
        // Create reference from name (e.g., "Water Project" -> "WATER-PROJ-XXXX")
        $prefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $name), 0, 5));
        $unique = strtoupper(Str::random(4));
        $reference = "{$prefix}-{$unique}";

        // Ensure uniqueness
        while (Account::where('reference', $reference)->exists()) {
            $unique = strtoupper(Str::random(4));
            $reference = "{$prefix}-{$unique}";
        }

        return $reference;
    }

    /**
     * Get account with monthly totals
     */
    public function getAccountMonthlyTotal(Request $request, $accountReference)
    {
        try {
            $account = Account::where('reference', $accountReference)->first();

            if (!$account) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Account not found'
                ], 404);
            }

            $month = $request->input('month', now()->month);
            $year = $request->input('year', now()->year);

            // Get monthly transactions
            $monthlyTransactions = Transaction::where('account_id', $account->id)
                ->whereMonth('created_at', $month)
                ->whereYear('created_at', $year)
                ->where('status', 'completed')
                ->get();

            $totalCredit = $monthlyTransactions->where('type', 'credit')->sum('amount');
            $totalDebit = $monthlyTransactions->where('type', 'debit')->sum('amount');
            $netAmount = $totalCredit - $totalDebit;

            return response()->json([
                'status' => 'success',
                'data' => [
                    'account' => $account,
                    'month' => $month,
                    'year' => $year,
                    'total_credit' => $totalCredit,
                    'total_debit' => $totalDebit,
                    'net_amount' => $netAmount,
                    'transaction_count' => $monthlyTransactions->count(),
                    'transactions' => $monthlyTransactions
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch account monthly total: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all accounts with their balances
     */
    public function getAllAccounts()
    {
        try {
            $accounts = Account::with(['accountType', 'accountSubtype'])
                ->withCount('transactions')
                ->get()
                ->map(function ($account) {
                    return [
                        'id' => $account->id,
                        'reference' => $account->reference,
                        'name' => $account->name,
                        'type' => $account->type,
                        'balance' => $account->balance,
                        'status' => $account->status,
                        'transaction_count' => $account->transactions_count,
                        'metadata' => $account->metadata,
                        'created_at' => $account->created_at
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data' => $accounts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch accounts: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update account
     */
    public function updateAccount(Request $request, $id)
    {
        try {
            $account = Account::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'status' => 'sometimes|in:active,inactive,suspended',
                'description' => 'sometimes|string',
            ]);

            if (isset($validated['name'])) {
                $account->name = $validated['name'];
            }

            if (isset($validated['status'])) {
                $account->status = $validated['status'];
            }

            if (isset($validated['description'])) {
                $metadata = $account->metadata ?? [];
                $metadata['description'] = $validated['description'];
                $account->metadata = $metadata;
            }

            $account->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Account updated successfully',
                'data' => $account
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update account: ' . $e->getMessage()
            ], 500);
        }
    }
}
