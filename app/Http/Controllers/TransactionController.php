<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Transaction;
use App\Services\AccountService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class TransactionController extends Controller
{
    protected $accountService;

    public function __construct(AccountService $accountService)
    {
        $this->accountService = $accountService;
    }

    /**
     * Display a listing of the transactions with filters.
     */
    public function index(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'account_reference' => 'sometimes|string',
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date|after_or_equal:start_date',
                'type' => 'sometimes|in:credit,debit',
                'status' => 'sometimes|string',
                'sort_by' => 'sometimes|in:created_at,amount,status',
                'sort_direction' => 'sometimes|in:asc,desc'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid parameters',
                    'errors' => $validator->errors()
                ], 400);
            }

            $query = Transaction::query()
                ->with(['account:id,reference,name,type,status']);

            // Filter by account reference if provided
            if ($request->has('account_reference')) {
                $account = $this->resolveAccount($request->account_reference);
                if ($account) {
                    $query->where('account_id', $account->id);
                } else {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Account not found',
                        'reference' => $request->account_reference
                    ], 404);
                }
            }

            // Apply filters
            $this->applyFilters($query, $request);

            // Get all results
            $transactions = $query->get();

            return response()->json([
                'status' => 'success',
                'data' => $transactions->map(function ($transaction) {
                    return $this->transformTransaction($transaction);
                }),
                'total_count' => $transactions->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching transactions', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch transactions',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Display the specified transaction.
     */
    public function show($id)
    {
        try {
            $transaction = Transaction::with(['account:id,reference,name,type,status'])
                ->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'data' => $this->transformTransaction($transaction)
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaction not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error fetching transaction', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch transaction details',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get transactions for a specific account.
     */
    public function getAccountTransactions($accountReference, Request $request)
    {
        Log::info('Fetching transactions for account', ['reference' => $accountReference]);

        try {
            if (empty($accountReference)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Account reference is required'
                ], 400);
            }

            // Resolve account using multiple methods
            $account = $this->resolveAccount($accountReference);
            
            if (!$account) {
                Log::warning('Account not found', ['reference' => $accountReference]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Account not found',
                    'reference' => $accountReference
                ], 404);
            }

            // Build query
            $query = Transaction::where('account_id', $account->id);

            // Apply any additional filters
            if ($request->has('start_date')) {
                $query->whereDate('created_at', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->whereDate('created_at', '<=', $request->end_date);
            }
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortBy, $sortDirection);

            // Get all results
            $transactions = $query->get();
            $transactionCount = $transactions->count();

            Log::info('Transactions retrieved', [
                'account_id' => $account->id,
                'count' => $transactionCount
            ]);

            return response()->json([
                'status' => 'success',
                'account' => [
                    'id' => $account->id,
                    'reference' => $account->reference,
                    'name' => $account->name,
                    'type' => $account->type,
                    'balance' => $account->balance,
                    'status' => $account->status
                ],
                'data' => $transactions->map(function ($transaction) {
                    return $this->transformTransaction($transaction);
                }),
                'summary' => [
                    'total_transactions' => $transactionCount,
                    'total_credit' => $query->where('type', 'credit')->sum('amount'),
                    'total_debit' => $query->where('type', 'debit')->sum('amount')
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in getAccountTransactions', [
                'reference' => $accountReference,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Error fetching account transactions',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Resolve account using multiple lookup methods
     */
    protected function resolveAccount($reference)
    {
        // Method 1: Direct lookup
        $account = Account::where('reference', $reference)->first();
        if ($account) {
            Log::info('Account found by direct reference', ['id' => $account->id]);
            return $account;
        }

        // Method 2: Case-insensitive lookup
        $account = Account::whereRaw('LOWER(reference) = ?', [strtolower($reference)])->first();
        if ($account) {
            Log::info('Account found by case-insensitive reference', ['id' => $account->id]);
            return $account;
        }

        // Method 3: Use AccountService (includes fuzzy matching)
        try {
            $account = $this->accountService->findAccountByReference($reference);
            if ($account) {
                Log::info('Account found by AccountService', ['id' => $account->id]);
                return $account;
            }
        } catch (\Exception $e) {
            Log::warning('AccountService lookup failed', ['error' => $e->getMessage()]);
        }

        return null;
    }

    /**
     * Apply filters to the query
     */
    protected function applyFilters($query, Request $request)
    {
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);
    }

    /**
     * Transform a transaction for API response.
     */
    protected function transformTransaction($transaction)
    {
        return [
            'id' => $transaction->id,
            'account' => [
                'id' => $transaction->account->id,
                'reference' => $transaction->account->reference,
                'name' => $transaction->account->name,
                'type' => $transaction->account->type,
                'status' => $transaction->account->status
            ],
            'amount' => $transaction->amount,
            'type' => $transaction->type,
            'status' => $transaction->status,
            'reference' => $transaction->reference,
            'payment_method' => $transaction->payment_method,
            'payer_name' => $transaction->payer_name,
            'phone_number' => $transaction->phone_number,
            'metadata' => $transaction->metadata,
            'processed_at' => $transaction->processed_at,
            'created_at' => $transaction->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $transaction->updated_at->format('Y-m-d H:i:s')
        ];
    }
}