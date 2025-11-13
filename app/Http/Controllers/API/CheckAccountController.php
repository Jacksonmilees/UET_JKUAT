<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\AccountService;
use Illuminate\Http\Request;
use App\Http\Resources\AccountResource;
use Illuminate\Http\Response;

class CheckAccountController extends Controller
{
    protected $accountService;

    public function __construct(AccountService $accountService)
    {
        $this->accountService = $accountService;
    }

    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'reference' => 'required|string',
            'account_number' => 'sometimes|string'
        ]);

        try {
            $account = $this->accountService->findAccount($validated);
            
            if (!$account) {
                return response()->json([
                    'success' => true,
                    'message' => 'Account not found',
                    'exists' => false,
                    'data' => null
                ], Response::HTTP_OK);  // Changed to HTTP 200
            }

            return response()->json([
                'success' => true,
                'message' => 'Account found',
                'exists' => true,
                'data' => new AccountResource($account)
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            \Log::error('Account check failed', [
                'error' => $e->getMessage(),
                'data' => $validated
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to check account',
                'error' => $e->getMessage(),
                'data' => null
            ], Response::HTTP_BAD_REQUEST);
        }
    }
}