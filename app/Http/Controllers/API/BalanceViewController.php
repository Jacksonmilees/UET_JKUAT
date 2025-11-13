<?php
// app/Http/Controllers/Api/BalanceViewController.php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;

class BalanceViewController extends Controller
{
    public function getLatestBalance()
    {
        $balance = Cache::get('mpesa_balance');
        
        if (!$balance) {
            return response()->json([
                'status' => 'error',
                'message' => 'No balance information available'
            ], 404);
        }
        
        // Filter for Working Account (Main Account) balance
        $mainBalance = collect($balance['balances'])
            ->firstWhere('account_type', 'Working Account');
            
        return response()->json([
            'status' => 'success',
            'timestamp' => $balance['timestamp'],
            'balance' => $mainBalance ?? null
        ]);
    }
}