<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Account;
use App\Models\Withdrawal;
use App\Models\User;
use App\Services\MpesaBalanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class AdminDashboardController extends Controller
{
    private $consumerKey;
    private $consumerSecret;
    private $shortcode;
    private $env;
    private $balanceService;

    public function __construct(MpesaBalanceService $balanceService)
    {
        $this->consumerKey = config('services.mpesa.consumer_key');
        $this->consumerSecret = config('services.mpesa.consumer_secret');
        $this->shortcode = config('services.mpesa.shortcode');
        $this->env = config('services.mpesa.env');
        $this->balanceService = $balanceService;
    }

    /**
     * Get M-Pesa access token
     */
    private function getAccessToken()
    {
        $url = $this->env === 'sandbox' 
            ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
            : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

        $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)->get($url);

        if ($response->successful()) {
            return $response->json()['access_token'] ?? null;
        }

        return null;
    }

    /**
     * Get real PayBill balance from M-Pesa
     * First checks cache, then queries live if needed
     */
    public function getPayBillBalance(Request $request)
    {
        try {
            // Check if we should force a fresh query
            $forceRefresh = $request->boolean('refresh', false);
            
            // First check if we have a cached balance
            $cachedBalance = Cache::get('mpesa_balance');
            
            if ($cachedBalance && !$forceRefresh) {
                // Return the cached balance
                $balances = $cachedBalance['balances'] ?? [];
                $transactionData = $cachedBalance['transaction_data'] ?? null;
                
                // Calculate total balance across all accounts
                $totalBalance = 0;
                $allBalances = [];
                
                foreach ($balances as $balance) {
                    $allBalances[] = $balance;
                    // Sum up all available balances
                    $totalBalance += floatval($balance['amount'] ?? 0);
                }
                
                return response()->json([
                    'status' => 'success',
                    'balance' => $totalBalance,
                    'all_balances' => $allBalances,
                    'last_updated' => $transactionData['timestamp'] ?? null,
                    'source' => 'cache'
                ]);
            }
            
            // No cached balance or refresh requested - query M-Pesa
            try {
                $response = $this->balanceService->queryBalance();
                
                // Poll for results (with timeout)
                $balance = $this->pollForBalance($response['ConversationID'] ?? null);
                
                if ($balance) {
                    return response()->json([
                        'status' => 'success',
                        'balance' => $balance['working_balance'],
                        'all_balances' => $balance['all_balances'],
                        'last_updated' => now()->toIso8601String(),
                        'source' => 'live'
                    ]);
                }
                
                // If polling times out, return what we have or 0
                return response()->json([
                    'status' => 'pending',
                    'message' => 'Balance query initiated. Please refresh in a few seconds.',
                    'balance' => 0,
                    'source' => 'pending'
                ]);
                
            } catch (\Exception $e) {
                Log::warning('Live balance query failed, returning cached or zero', [
                    'error' => $e->getMessage()
                ]);
                
                // Return cached balance if available, otherwise 0
                if ($cachedBalance) {
                    $balances = $cachedBalance['balances'] ?? [];
                    $workingBalance = !empty($balances) ? ($balances[0]['amount'] ?? 0) : 0;
                    
                    return response()->json([
                        'status' => 'success',
                        'balance' => $workingBalance,
                        'all_balances' => $balances,
                        'last_updated' => $cachedBalance['transaction_data']['timestamp'] ?? null,
                        'source' => 'cache_fallback'
                    ]);
                }
                
                return response()->json([
                    'status' => 'error',
                    'balance' => 0,
                    'message' => 'Unable to fetch balance: ' . $e->getMessage()
                ]);
            }

        } catch (\Exception $e) {
            Log::error('PayBill balance query failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'balance' => 0,
                'message' => 'Error querying PayBill balance: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Poll for balance result with timeout
     */
    private function pollForBalance($conversationId, $attempts = 0)
    {
        $maxAttempts = 10; // 20 seconds max
        
        $cachedBalance = Cache::get('mpesa_balance');
        
        if ($cachedBalance) {
            $balances = $cachedBalance['balances'] ?? [];
            $totalBalance = 0;
            
            foreach ($balances as $balance) {
                // Sum up all available balances
                $totalBalance += floatval($balance['amount'] ?? 0);
            }
            
            return [
                'working_balance' => $totalBalance,
                'all_balances' => $balances
            ];
        }
        
        if ($attempts >= $maxAttempts) {
            return null;
        }
        
        sleep(2);
        
        return $this->pollForBalance($conversationId, $attempts + 1);
    }

    /**
     * Generate security credential (simplified - you'll need your certificate)
     */
    private function generateSecurityCredential()
    {
        // This is a placeholder - you need to encrypt your initiator password
        // with Safaricom's public certificate
        return config('services.mpesa.security_credential', '');
    }

    /**
     * Get admin dashboard statistics
     */
    public function getDashboardStats()
    {
        try {
            // Get database statistics
            $stats = [
                'transactions' => [
                    'total_count' => Transaction::count(),
                    'completed_count' => Transaction::where('status', 'completed')->count(),
                    'total_amount' => Transaction::where('status', 'completed')->sum('amount'),
                    'today_count' => Transaction::whereDate('created_at', today())->count(),
                    'today_amount' => Transaction::whereDate('created_at', today())->sum('amount'),
                    'this_month_count' => Transaction::whereMonth('created_at', now()->month)->count(),
                    'this_month_amount' => Transaction::whereMonth('created_at', now()->month)->sum('amount'),
                ],
                'withdrawals' => [
                    'total_count' => Withdrawal::count(),
                    'pending_count' => Withdrawal::where('status', 'pending')->count(),
                    'completed_count' => Withdrawal::where('status', 'completed')->count(),
                    'total_amount' => Withdrawal::where('status', 'completed')->sum('amount'),
                ],
                'accounts' => [
                    'total_count' => Account::count(),
                    'total_balance' => Account::sum('balance'),
                    'active_count' => Account::where('status', 'active')->count(),
                ],
                'users' => [
                    'total_count' => User::count(),
                    'active_count' => User::whereNotNull('email_verified_at')->count(),
                ],
                'recent_transactions' => Transaction::with('account:id,reference,name')
                    ->latest()
                    ->limit(10)
                    ->get(),
                'mpesa_stats' => [
                    'total_mpesa_transactions' => Transaction::where('payment_method', 'mpesa')->count(),
                    'total_mpesa_amount' => Transaction::where('payment_method', 'mpesa')
                        ->where('status', 'completed')
                        ->sum('amount'),
                ]
            ];

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Dashboard stats error', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch dashboard statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get transaction summary by date range
     */
    public function getTransactionSummary(Request $request)
    {
        try {
            $startDate = $request->input('start_date', now()->subDays(30));
            $endDate = $request->input('end_date', now());

            $summary = Transaction::whereBetween('created_at', [$startDate, $endDate])
                ->selectRaw('
                    DATE(created_at) as date,
                    COUNT(*) as count,
                    SUM(amount) as total_amount,
                    AVG(amount) as average_amount
                ')
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'summary' => $summary,
                    'total_transactions' => $summary->sum('count'),
                    'total_amount' => $summary->sum('total_amount'),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch transaction summary: ' . $e->getMessage()
            ], 500);
        }
    }
}
