<?php

// app/Http/Controllers/Api/BalanceCallbackController.php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Exception;

class BalanceCallbackController extends Controller
{
    public function handleCallback(Request $request)
    {
        try {
            $result = $request->json()->all();
            
            if (isset($result['Result']['ResultParameters']['ResultParameter'])) {
                $balances = [];
                
                foreach ($result['Result']['ResultParameters']['ResultParameter'] as $parameter) {
                    if ($parameter['Key'] === 'AccountBalance') {
                        $balanceInfo = explode('&', $parameter['Value']);
                        foreach ($balanceInfo as $balance) {
                            if (!empty($balance)) {
                                $parts = explode('|', $balance);
                                if (count($parts) >= 3) {
                                    $balances[] = [
                                        'account_type' => $parts[0],
                                        'amount' => $parts[1],
                                        'currency' => $parts[2]
                                    ];
                                }
                            }
                        }
                    }
                }
                
                Cache::put('mpesa_balance', [
                    'timestamp' => now(),
                    'balances' => $balances
                ], now()->addHours(1));
            }
            
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Success']);
            
        } catch (Exception $e) {
            Log::error('M-Pesa callback processing error', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);
            
            return response()->json(['ResultCode' => 1, 'ResultDesc' => 'Error processing callback']);
        }
    }
    
    public function handleTimeout(Request $request)
    {
        Log::warning('M-Pesa balance query timeout', [
            'request' => $request->all()
        ]);
        
        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Timeout received']);
    }
}