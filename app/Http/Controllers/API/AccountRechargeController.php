<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AccountRechargeToken;
use App\Models\RechargeContribution;
use App\Models\User;
use App\Services\MpesaService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AccountRechargeController extends Controller
{
    protected MpesaService $mpesaService;

    public function __construct(MpesaService $mpesaService)
    {
        $this->mpesaService = $mpesaService;
    }

    /**
     * Create a new recharge token/link
     */
    public function createToken(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'target_amount' => 'nullable|numeric|min:1',
            'reason' => 'nullable|string|max:255',
            'expiry_days' => 'nullable|integer|min:1|max:365',
        ]);

        $token = AccountRechargeToken::createForUser(
            $user->id,
            $validated['target_amount'] ?? null,
            $validated['reason'] ?? null,
            $validated['expiry_days'] ?? 30
        );

        Log::info("Recharge token created", [
            'token_id' => $token->id,
            'user_id' => $user->id,
            'target_amount' => $token->target_amount,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Recharge link created successfully',
            'data' => [
                'token' => $token->token,
                'url' => $token->getRechargeUrl(),
                'target_amount' => $token->target_amount,
                'expires_at' => $token->expires_at->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Get user's recharge tokens
     */
    public function myTokens(): JsonResponse
    {
        $user = Auth::user();

        $tokens = AccountRechargeToken::where('user_id', $user->id)
            ->with('contributions:id,token_id,donor_name,amount,status,created_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($token) {
                return [
                    'id' => $token->id,
                    'token' => $token->token,
                    'url' => $token->getRechargeUrl(),
                    'target_amount' => $token->target_amount,
                    'collected_amount' => $token->collected_amount,
                    'remaining_amount' => $token->getRemainingAmount(),
                    'progress_percentage' => $token->getProgressPercentage(),
                    'reason' => $token->reason,
                    'status' => $token->status,
                    'is_valid' => $token->isValid(),
                    'expires_at' => $token->expires_at->toIso8601String(),
                    'contributions' => $token->contributions,
                    'created_at' => $token->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $tokens,
        ]);
    }

    /**
     * Get public recharge page info (no auth required)
     */
    public function getPublicTokenInfo(string $token): JsonResponse
    {
        $rechargeToken = AccountRechargeToken::findByToken($token);

        if (!$rechargeToken) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid recharge link',
            ], 404);
        }

        if (!$rechargeToken->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'This recharge link has expired or is no longer active',
                'data' => ['status' => $rechargeToken->status],
            ], 410);
        }

        $user = $rechargeToken->user;

        return response()->json([
            'success' => true,
            'data' => [
                'recipient_name' => $user->name,
                'reason' => $rechargeToken->reason,
                'target_amount' => $rechargeToken->target_amount,
                'collected_amount' => $rechargeToken->collected_amount,
                'remaining_amount' => $rechargeToken->getRemainingAmount(),
                'progress_percentage' => $rechargeToken->getProgressPercentage(),
                'expires_at' => $rechargeToken->expires_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Initiate payment to recharge link (no auth required)
     */
    public function initiatePayment(Request $request, string $token): JsonResponse
    {
        $rechargeToken = AccountRechargeToken::findByToken($token);

        if (!$rechargeToken) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid recharge link',
            ], 404);
        }

        if (!$rechargeToken->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'This recharge link has expired',
            ], 410);
        }

        $validated = $request->validate([
            'phone' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'donor_name' => 'required|string|max:100',
        ]);

        // Normalize phone number
        $phone = preg_replace('/[^0-9]/', '', $validated['phone']);
        if (strlen($phone) === 9) {
            $phone = '254' . $phone;
        } elseif (strlen($phone) === 10 && str_starts_with($phone, '0')) {
            $phone = '254' . substr($phone, 1);
        }

        // Create contribution record
        $contribution = RechargeContribution::create([
            'token_id' => $rechargeToken->id,
            'donor_name' => $validated['donor_name'],
            'donor_phone' => $phone,
            'amount' => $validated['amount'],
            'status' => 'pending',
        ]);

        // Initiate STK Push
        $recipientName = $rechargeToken->user->name;
        $reason = $rechargeToken->reason ?? 'account recharge';
        
        try {
            $response = $this->mpesaService->stkPush(
                $phone,
                $validated['amount'],
                "Recharge for {$recipientName}: {$reason}",
                'RechargeCallback',
                ['contribution_id' => $contribution->id]
            );

            if (isset($response['CheckoutRequestID'])) {
                $contribution->update([
                    'checkout_request_id' => $response['CheckoutRequestID'],
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment initiated. Please check your phone for M-Pesa prompt.',
                    'data' => [
                        'checkout_request_id' => $response['CheckoutRequestID'],
                        'contribution_id' => $contribution->id,
                    ],
                ]);
            }

            $contribution->markFailed();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate payment. Please try again.',
            ], 500);
        } catch (\Exception $e) {
            $contribution->markFailed();
            
            Log::error("Recharge STK Push failed", [
                'error' => $e->getMessage(),
                'contribution_id' => $contribution->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment service error. Please try again later.',
            ], 500);
        }
    }

    /**
     * Cancel a recharge token
     */
    public function cancelToken(int $id): JsonResponse
    {
        $user = Auth::user();
        $token = AccountRechargeToken::where('user_id', $user->id)->find($id);

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Recharge token not found',
            ], 404);
        }

        if ($token->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Token cannot be cancelled',
            ], 400);
        }

        $token->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Recharge link cancelled',
        ]);
    }

    /**
     * Get contribution history for a token
     */
    public function getContributions(int $id): JsonResponse
    {
        $user = Auth::user();
        $token = AccountRechargeToken::where('user_id', $user->id)->find($id);

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Recharge token not found',
            ], 404);
        }

        $contributions = $token->contributions()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $contributions,
        ]);
    }

    /**
     * Check contribution status (public - no auth required)
     */
    public function checkContributionStatus(int $contributionId): JsonResponse
    {
        try {
            $contribution = RechargeContribution::find($contributionId);

            if (!$contribution) {
                return response()->json([
                    'success' => false,
                    'message' => 'Contribution not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'contribution_id' => $contribution->id,
                    'status' => $contribution->status,
                    'amount' => $contribution->amount,
                    'mpesa_receipt' => $contribution->mpesa_receipt,
                    'created_at' => $contribution->created_at->toIso8601String(),
                    'updated_at' => $contribution->updated_at->toIso8601String(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking contribution status', [
                'contribution_id' => $contributionId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error checking contribution status',
            ], 500);
        }
    }
}
