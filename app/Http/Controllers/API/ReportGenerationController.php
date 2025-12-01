<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Account;
use App\Models\Project;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportGenerationController extends Controller
{
    /**
     * Generate financial report
     */
    public function generateFinancialReport(Request $request)
    {
        try {
            $startDate = $request->input('start_date', now()->startOfMonth());
            $endDate = $request->input('end_date', now()->endOfMonth());

            $report = [
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ],
                'transactions' => [
                    'total_count' => Transaction::whereBetween('created_at', [$startDate, $endDate])->count(),
                    'total_credit' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                        ->where('type', 'credit')
                        ->where('status', 'completed')
                        ->sum('amount'),
                    'total_debit' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                        ->where('type', 'debit')
                        ->where('status', 'completed')
                        ->sum('amount'),
                ],
                'withdrawals' => [
                    'total_count' => Withdrawal::whereBetween('created_at', [$startDate, $endDate])->count(),
                    'pending' => Withdrawal::whereBetween('created_at', [$startDate, $endDate])
                        ->where('status', 'pending')->count(),
                    'completed' => Withdrawal::whereBetween('created_at', [$startDate, $endDate])
                        ->where('status', 'completed')->count(),
                    'total_amount' => Withdrawal::whereBetween('created_at', [$startDate, $endDate])
                        ->where('status', 'completed')
                        ->sum('amount'),
                ],
                'accounts' => [
                    'total_balance' => Account::sum('balance'),
                    'active_accounts' => Account::where('status', 'active')->count(),
                ],
                'daily_breakdown' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                    ->selectRaw('DATE(created_at) as date, COUNT(*) as count, SUM(amount) as total')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get()
            ];

            return response()->json([
                'status' => 'success',
                'data' => $report
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate report: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate project report
     */
    public function generateProjectReport(Request $request, $projectId = null)
    {
        try {
            $query = Project::query();

            if ($projectId) {
                $query->where('id', $projectId);
            }

            $projects = $query->get()->map(function ($project) {
                // Find project account
                $account = Account::where('metadata->project_id', $project->id)->first();

                $projectData = [
                    'id' => $project->id,
                    'name' => $project->name,
                    'description' => $project->description,
                    'target_amount' => $project->target_amount,
                    'current_amount' => $project->current_amount,
                    'status' => $project->status,
                    'account_reference' => $project->account_reference ?? ($account->reference ?? null),
                ];

                if ($account) {
                    $transactions = Transaction::where('account_id', $account->id)
                        ->where('status', 'completed')
                        ->get();

                    $projectData['account_balance'] = $account->balance;
                    $projectData['total_received'] = $transactions->where('type', 'credit')->sum('amount');
                    $projectData['total_spent'] = $transactions->where('type', 'debit')->sum('amount');
                    $projectData['transaction_count'] = $transactions->count();
                    $projectData['completion_percentage'] = $project->target_amount > 0 
                        ? ($projectData['total_received'] / $project->target_amount) * 100 
                        : 0;
                }

                return $projectData;
            });

            return response()->json([
                'status' => 'success',
                'data' => $projects
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate project report: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate account statement
     */
    public function generateAccountStatement(Request $request, $accountReference)
    {
        try {
            $account = Account::where('reference', $accountReference)->first();

            if (!$account) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Account not found'
                ], 404);
            }

            $startDate = $request->input('start_date', now()->startOfMonth());
            $endDate = $request->input('end_date', now()->endOfMonth());

            $transactions = Transaction::where('account_id', $account->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->orderBy('created_at', 'desc')
                ->get();

            $statement = [
                'account' => [
                    'reference' => $account->reference,
                    'name' => $account->name,
                    'current_balance' => $account->balance,
                ],
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ],
                'summary' => [
                    'opening_balance' => $this->calculateOpeningBalance($account, $startDate),
                    'total_credit' => $transactions->where('type', 'credit')->sum('amount'),
                    'total_debit' => $transactions->where('type', 'debit')->sum('amount'),
                    'closing_balance' => $account->balance,
                    'transaction_count' => $transactions->count()
                ],
                'transactions' => $transactions
            ];

            return response()->json([
                'status' => 'success',
                'data' => $statement
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate statement: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate opening balance
     */
    private function calculateOpeningBalance($account, $startDate)
    {
        $previousTransactions = Transaction::where('account_id', $account->id)
            ->where('created_at', '<', $startDate)
            ->where('status', 'completed')
            ->get();

        $credit = $previousTransactions->where('type', 'credit')->sum('amount');
        $debit = $previousTransactions->where('type', 'debit')->sum('amount');

        return $credit - $debit;
    }

    /**
     * Generate monthly summary
     */
    public function generateMonthlySummary(Request $request)
    {
        try {
            $month = $request->input('month', now()->month);
            $year = $request->input('year', now()->year);

            $startDate = Carbon::create($year, $month, 1)->startOfMonth();
            $endDate = Carbon::create($year, $month, 1)->endOfMonth();

            $summary = [
                'month' => $month,
                'year' => $year,
                'transactions' => [
                    'total' => Transaction::whereBetween('created_at', [$startDate, $endDate])->count(),
                    'credit' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                        ->where('type', 'credit')->sum('amount'),
                    'debit' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                        ->where('type', 'debit')->sum('amount'),
                ],
                'by_payment_method' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                    ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
                    ->groupBy('payment_method')
                    ->get(),
                'by_status' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                    ->selectRaw('status, COUNT(*) as count, SUM(amount) as total')
                    ->groupBy('status')
                    ->get(),
                'top_accounts' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                    ->select('account_id', DB::raw('COUNT(*) as transaction_count'), DB::raw('SUM(amount) as total_amount'))
                    ->groupBy('account_id')
                    ->orderBy('total_amount', 'desc')
                    ->limit(10)
                    ->with('account:id,reference,name')
                    ->get()
            ];

            return response()->json([
                'status' => 'success',
                'data' => $summary
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate monthly summary: ' . $e->getMessage()
            ], 500);
        }
    }
}
