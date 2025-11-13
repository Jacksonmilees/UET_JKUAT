<?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use App\Services\MpesaBalanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Exception;
class MpesaBalanceController extends Controller
{
    protected $balanceService;
    
    public function __construct(MpesaBalanceService $balanceService)
    {
        $this->balanceService = $balanceService;
    }
    
    public function query()
    {
        try {
            Cache::forget('mpesa_balance');
            
            $response = $this->balanceService->queryBalance();
            
            Cache::put('mpesa_query_' . $response['ConversationID'], true, now()->addMinutes(5));
            
            return $this->pollForResults($response['ConversationID']);
            
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
   private function pollForResults($conversationId, $attempts = 0)
{
    $maxAttempts = 15;
    
    $balance = Cache::get('mpesa_balance');
    
    if ($balance) {
        // Return all balances instead of just the first one
        return response()->json([
            'status' => 'success',
            'timestamp' => now()->toIso8601String(),
            'balances' => $balance['balances'], // Return the full array of balances
            'transaction_data' => $balance['transaction_data'] ?? null
        ]);
    }
    
    if ($attempts >= $maxAttempts) {
        return response()->json([
            'status' => 'timeout',
            'message' => 'Balance query timeout. Please check /api/mpesa/balance/status endpoint.'
        ], 408);
    }
    
    sleep(2);
    
    return $this->pollForResults($conversationId, $attempts + 1);
}

    public function handleResult(Request $request)
    {
        Log::info('MPesa balance result received', ['data' => $request->all()]);

        try {
            $this->balanceService->processResult($request->all());
            
            return response()->json(['status' => 'success']);
        } catch (Exception $e) {
            Log::error('Error handling MPesa result', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to process result'
            ], 500);
        }
    }

    public function handleTimeout(Request $request)
    {
        Log::warning('MPesa balance query timeout', ['data' => $request->all()]);
        
        return response()->json(['status' => 'received']);
    }
}