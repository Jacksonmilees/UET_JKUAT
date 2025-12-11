<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\Project;
use App\Models\Merchandise;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WalletController extends Controller
{
    /**
     * Get user's wallet balance and info
     */
    public function getBalance(): JsonResponse
    {
        $user = Auth::user();

        return response()->json([
            'success' => true,
            'data' => [
                'balance' => $user->balance,
                'unsettled_balance' => $user->unsettled_balance,
                'total_available_funds' => $user->getTotalAvailableFunds(),
                'currency' => 'KES',
            ],
        ]);
    }

    /**
     * Get wallet transaction history
     */
    public function getTransactions(Request $request): JsonResponse
    {
        $user = Auth::user();

        $query = WalletTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        // Filter by type
        if ($request->has('type') && in_array($request->type, ['credit', 'debit'])) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Pagination
        $perPage = $request->get('per_page', 50);
        $transactions = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $transactions->items(),
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    /**
     * Get wallet statistics
     */
    public function getStatistics(): JsonResponse
    {
        $user = Auth::user();

        $stats = [
            'total_credits' => WalletTransaction::where('user_id', $user->id)
                ->where('type', 'credit')
                ->where('status', 'completed')
                ->sum('amount'),

            'total_debits' => WalletTransaction::where('user_id', $user->id)
                ->where('type', 'debit')
                ->where('status', 'completed')
                ->sum('amount'),

            'transaction_count' => WalletTransaction::where('user_id', $user->id)
                ->where('status', 'completed')
                ->count(),

            'current_balance' => $user->balance,
            'unsettled_balance' => $user->unsettled_balance,

            // Recent activity (last 30 days)
            'recent_credits' => WalletTransaction::where('user_id', $user->id)
                ->where('type', 'credit')
                ->where('status', 'completed')
                ->where('created_at', '>=', now()->subDays(30))
                ->sum('amount'),

            'recent_debits' => WalletTransaction::where('user_id', $user->id)
                ->where('type', 'debit')
                ->where('status', 'completed')
                ->where('created_at', '>=', now()->subDays(30))
                ->sum('amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Settle unsettled funds into wallet
     */
    public function settleFunds(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        $amount = $validated['amount'];

        if ($user->unsettled_balance < $amount) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient unsettled funds',
                'data' => [
                    'unsettled_balance' => $user->unsettled_balance,
                    'requested_amount' => $amount,
                ],
            ], 400);
        }

        try {
            DB::beginTransaction();

            $success = $user->settleFunds($amount);

            if (!$success) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to settle funds',
                ], 500);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Funds settled successfully',
                'data' => [
                    'settled_amount' => $amount,
                    'new_balance' => $user->fresh()->balance,
                    'remaining_unsettled' => $user->fresh()->unsettled_balance,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error settling funds', [
                'user_id' => $user->id,
                'amount' => $amount,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while settling funds',
            ], 500);
        }
    }

    /**
     * Pay for project using wallet
     */
    public function payForProject(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'amount' => 'required|numeric|min:1',
        ]);

        $project = Project::findOrFail($validated['project_id']);
        $amount = $validated['amount'];

        if (!$user->hasSufficientBalance($amount)) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient wallet balance',
                'data' => [
                    'balance' => $user->balance,
                    'required' => $amount,
                ],
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Deduct from wallet
            $success = $user->deductFromWallet($amount, 'project', [
                'project_id' => $project->id,
                'project_title' => $project->title,
            ]);

            if (!$success) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to process payment',
                ], 500);
            }

            // Update project funding
            $project->increment('current_amount', $amount);

            // Create transaction record
            // ... (create project transaction)

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Project payment successful',
                'data' => [
                    'amount' => $amount,
                    'project' => $project->title,
                    'new_balance' => $user->fresh()->balance,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error paying for project with wallet', [
                'user_id' => $user->id,
                'project_id' => $project->id,
                'amount' => $amount,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing payment',
            ], 500);
        }
    }

    /**
     * Get all users with wallet balances (Admin only)
     */
    public function getAllWallets(): JsonResponse
    {
        $user = Auth::user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $users = User::select('id', 'name', 'email', 'phone_number', 'balance', 'unsettled_balance')
            ->where(function($query) {
                $query->where('balance', '>', 0)
                      ->orWhere('unsettled_balance', '>', 0);
            })
            ->orderBy('balance', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone_number' => $user->phone_number,
                    'balance' => $user->balance,
                    'unsettled_balance' => $user->unsettled_balance,
                    'total' => $user->balance + $user->unsettled_balance,
                ];
            });

        $summary = [
            'total_users_with_funds' => $users->count(),
            'total_wallet_balance' => $users->sum('balance'),
            'total_unsettled_balance' => $users->sum('unsettled_balance'),
            'grand_total' => $users->sum('total'),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'users' => $users,
                'summary' => $summary,
            ],
        ]);
    }
}
