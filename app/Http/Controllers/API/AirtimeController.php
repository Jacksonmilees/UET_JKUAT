<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\AirtimeService;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AirtimeController extends Controller
{
    protected $airtimeService;

    public function __construct(AirtimeService $airtimeService)
    {
        $this->airtimeService = $airtimeService;
    }

   public function purchase(Request $request)
{
    $validated = $request->validate([
        'account_id' => 'required|exists:accounts,id',
        'phone_number' => 'required|string|regex:/^254[17][0-9]{8}$/',
        'amount' => 'required|numeric|min:5|max:70000'
    ]);

    try {
        $account = Account::findOrFail($validated['account_id']);
        
        // Remove the inner DB transaction and return response directly
        $result = $this->airtimeService->purchaseAirtime(
            $account,
            $validated['phone_number'],
            $validated['amount']
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Airtime purchased successfully',
            'data' => $result
        ]);

    } catch (\Exception $e) {
        Log::error('Airtime purchase failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 400);
    }
}

    public function balance()
    {
        try {
            $response = $this->airtimeService->checkBalance();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'balance' => $response['UnitBalance'],
                    'error_code' => $response['ErrorCode'],
                    'error_description' => $response['ErrorDescription']
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Balance check failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
