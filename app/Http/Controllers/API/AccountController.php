<?php
// app/Http/Controllers/API/AccountController.php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\AccountService;
use Illuminate\Http\Request;
use App\Models\Account;
use App\Http\Resources\AccountResource;
use App\Http\Resources\TransactionResource;

class AccountController extends Controller
{
    protected $accountService;

    public function __construct(AccountService $accountService)
    {
        $this->accountService = $accountService;
    }

    public function index(Request $request)
    {
        $accounts = Account::with(['accountType', 'accountSubtype', 'parent'])
            ->when($request->type, function($query, $type) {
                return $query->whereHas('accountType', function($q) use ($type) {
                    $q->where('code', $type);
                });
            })
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => AccountResource::collection($accounts)
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_type_id' => 'required|exists:account_types,id',
            'account_subtype_id' => 'nullable|exists:account_subtypes,id',
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:accounts,id',
            'metadata' => 'nullable|array'
        ]);

        try {
            $account = $this->accountService->createAccount($validated);
            return new AccountResource($account);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create account: ' . $e->getMessage()
            ], 400);
        }
    }

    public function show(Account $account)
    {
        $account->load(['accountType', 'accountSubtype', 'parent']);
        return new AccountResource($account);
    }

    public function update(Request $request, Account $account)
    {
        $validated = $request->validate([
            'account_type_id' => 'required|exists:account_types,id',
            'account_subtype_id' => 'nullable|exists:account_subtypes,id',
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:accounts,id',
            'metadata' => 'nullable|array'
        ]);

        try {
            $account = $this->accountService->updateAccount($account, $validated);
            return new AccountResource($account);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update account: ' . $e->getMessage()
            ], 400);
        }
    }

    public function destroy(Account $account)
    {
        try {
            // Prevent deletion if account has transactions or is a parent
            if ($account->transactions()->exists()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot delete account with existing transactions'
                ], 400);
            }
            if ($account->children()->exists()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot delete account with child accounts'
                ], 400);
            }

            $this->accountService->deleteAccount($account);
            return response()->json([
                'status' => 'success',
                'message' => 'Account deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete account: ' . $e->getMessage()
            ], 400);
        }
    }

    public function transactions(Account $account)
    {
        $transactions = $account->transactions()
            ->orderBy('processed_at', 'desc')
            ->paginate();
        return TransactionResource::collection($transactions);
    }

    public function transfer(Request $request)
    {
        $validated = $request->validate([
            'source_account_id' => 'required|exists:accounts,id',
            'destination_account_id' => 'required|exists:accounts,id|different:source_account_id',
            'amount' => 'required|numeric|gt:0',
            'description' => 'nullable|string|max:255'
        ]);

        try {
            $result = $this->accountService->transferBetweenAccounts(array_merge(
                $validated,
                ['initiated_by' => auth()->id()]
            ));

            return response()->json([
                'status' => 'success',
                'message' => 'Transfer completed successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * ✅ FIXED: Search accounts - now properly passes criteria as an array
     */
    public function search(Request $request)
    {
        $validated = $request->validate([
            'query' => 'nullable|string|min:1',
            'reference' => 'nullable|string',
            'name' => 'nullable|string',
            'type' => 'nullable|string',
            'account_type_id' => 'nullable|integer',
            'account_subtype_id' => 'nullable|integer',
            'status' => 'nullable|string',
            'min_balance' => 'nullable|numeric',
            'max_balance' => 'nullable|numeric',
            'created_from' => 'nullable|date',
            'created_to' => 'nullable|date',
            'per_page' => 'nullable|integer|min:1|max:100'
        ]);

        try {
            // ✅ Build criteria array from request
            $criteria = [];

            // If 'query' is provided, search in both reference and name
            if (!empty($validated['query'])) {
                $criteria['reference'] = $validated['query'];
                $criteria['name'] = $validated['query'];
            }

            // Add specific search criteria if provided
            if (isset($validated['reference'])) {
                $criteria['reference'] = $validated['reference'];
            }
            if (isset($validated['name'])) {
                $criteria['name'] = $validated['name'];
            }
            if (isset($validated['type'])) {
                $criteria['type'] = $validated['type'];
            }
            if (isset($validated['account_type_id'])) {
                $criteria['account_type_id'] = $validated['account_type_id'];
            }
            if (isset($validated['account_subtype_id'])) {
                $criteria['account_subtype_id'] = $validated['account_subtype_id'];
            }
            if (isset($validated['status'])) {
                $criteria['status'] = $validated['status'];
            }
            if (isset($validated['min_balance'])) {
                $criteria['min_balance'] = $validated['min_balance'];
            }
            if (isset($validated['max_balance'])) {
                $criteria['max_balance'] = $validated['max_balance'];
            }
            if (isset($validated['created_from'])) {
                $criteria['created_from'] = $validated['created_from'];
            }
            if (isset($validated['created_to'])) {
                $criteria['created_to'] = $validated['created_to'];
            }

            // Get pagination parameter
            $perPage = $validated['per_page'] ?? 15;

            // Specify relationships to eager load
            $with = ['accountType', 'accountSubtype'];

            // ✅ FIXED: Pass criteria as an array (not a string)
            $accounts = $this->accountService->searchAccounts($criteria, $perPage, $with);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'accounts' => $accounts->items(),
                    'pagination' => [
                        'total' => $accounts->total(),
                        'per_page' => $accounts->perPage(),
                        'current_page' => $accounts->currentPage(),
                        'last_page' => $accounts->lastPage(),
                        'from' => $accounts->firstItem(),
                        'to' => $accounts->lastItem()
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to search accounts: ' . $e->getMessage()
            ], 400);
        }
    }

    public function getAccountTypes()
    {
        try {
            $accountTypes = \App\Models\AccountType::all();
            return response()->json([
                'status' => 'success',
                'data' => $accountTypes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch account types: ' . $e->getMessage()
            ], 400);
        }
    }

    public function getAccountSubtypes(Request $request)
    {
        $validated = $request->validate([
            'account_type_id' => 'required|exists:account_types,id'
        ]);

        try {
            $subtypes = \App\Models\AccountSubtype::where('account_type_id', $validated['account_type_id'])->get();
            return response()->json([
                'status' => 'success',
                'data' => $subtypes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch account subtypes: ' . $e->getMessage()
            ], 400);
        }
    }

    public function validateTransferAccounts(Request $request)
    {
        $validated = $request->validate([
            'source_reference' => 'required|string',
            'destination_reference' => 'required|string|different:source_reference',
            'amount' => 'required|numeric|gt:0'
        ]);

        try {
            $sourceAccount = Account::where('reference', $validated['source_reference'])
                ->where('status', 'active')
                ->first();
            
            if (!$sourceAccount) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Source account not found or inactive'
                ], 404);
            }

            if ($sourceAccount->balance < $validated['amount']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient balance in source account'
                ], 400);
            }

            $destinationAccount = Account::where('reference', $validated['destination_reference'])
                ->where('status', 'active')
                ->first();

            if (!$destinationAccount) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Destination account not found or inactive'
                ], 404);
            }

            if (!$this->validateAccountTypesForTransfer($sourceAccount, $destinationAccount)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid account types for this transfer'
                ], 400);
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'source_account' => [
                        'id' => $sourceAccount->id,
                        'name' => $sourceAccount->name,
                        'reference' => $sourceAccount->reference,
                        'balance' => $sourceAccount->balance,
                        'type' => $sourceAccount->accountType->name
                    ],
                    'destination_account' => [
                        'id' => $destinationAccount->id,
                        'name' => $destinationAccount->name,
                        'reference' => $destinationAccount->reference,
                        'type' => $destinationAccount->accountType->name
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to validate accounts: ' . $e->getMessage()
            ], 400);
        }
    }

    private function validateAccountTypesForTransfer($sourceAccount, $destinationAccount)
    {
        return true; // Implement specific validation rules if needed
    }

    public function withdraw(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'amount' => 'required|numeric|gt:0',
            'phone_number' => 'required|string|regex:/^254[17][0-9]{8}$/',
            'withdrawal_reason' => 'required|string|in:SalaryPayment,BusinessPayment,PromotionPayment',
            'remarks' => 'nullable|string|max:255'
        ]);

        try {
            $result = $this->accountService->processB2CWithdrawal(array_merge(
                $validated,
                ['initiated_by' => auth()->id()]
            ));

            return response()->json([
                'status' => 'success',
                'message' => 'Withdrawal request processed successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}