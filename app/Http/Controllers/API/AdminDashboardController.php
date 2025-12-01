<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Account;
use App\Models\Withdrawal;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class AdminDashboardController extends Controller
{
    private $consumerKey;
    private $consumerSecret;
    private $shortcode;
    private $env;

    public function __construct()
    {
        $this->consumerKey = config('services.mpesa.consumer_key');
        $this->consumerSecret = config('services.mpesa.consumer_secret');
        $this->shortcode = config('services.mpesa.shortcode');
        $this->env = config('services.mpesa.env');
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
     */
    public function getPayBillBalance()
    {
        try {
            $accessToken = $this->getAccessToken();
            
            if (!$accessToken) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to get M-Pesa access token'
                ], 500);
            }

            $url = $this->env === 'sandbox'
                ? 'https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query'
                : 'https://api.safaricom.co.ke/mpesa/accountbalance/v1/query';

            // Result and timeout URLs
            $resultUrl = config('app.url') . '/api/mpesa/balance/result';
            $timeoutUrl = config('app.url') . '/api/mpesa/balance/timeout';

            $response = Http::withToken($accessToken)->post($url, [
                'Initiator' => config('services.mpesa.initiator_name', 'apiuser'),
                'SecurityCredential' => $this->generateSecurityCredential(),
                'CommandID' => 'AccountBalance',
                'PartyA' => $this->shortcode,
                'IdentifierType' => '4', // 4 for PayBill
                'Remarks' => 'Account Balance Query',
                'QueueTimeOutURL' => $timeoutUrl,
                'ResultURL' => $resultUrl
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                return response()->json([
                    'status' => 'success',
                    'message' => 'Balance query initiated. Check result callback.',
                    'data' => $data
                ]);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to query M-Pesa balance',
                'details' => $response->body()
            ], 500);

        } catch (\Exception $e) {
            Log::error('PayBill balance query failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Error querying PayBill balance: ' . $e->getMessage()
            ], 500);
        }
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
