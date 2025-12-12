<?php

namespace App\Http\Controllers;

use App\Models\Withdrawal;
use Illuminate\Http\Request;
use App\Services\AccountService;
use App\Services\PaymentNotificationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class WithdrawalController extends Controller
{
    protected $accountService;
    protected $paymentNotificationService;

    public function __construct(AccountService $accountService, PaymentNotificationService $paymentNotificationService)
    {
        $this->accountService = $accountService;
        $this->paymentNotificationService = $paymentNotificationService;
    }

    public function initiateWithdrawal(Request $request)
    {
        Log::info('Initiate Withdrawal Request', [
            'headers' => $request->headers->all(),
            'data' => $request->all()
        ]);

        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'amount' => 'required|numeric|gt:0',
            'phone_number' => 'required|string|regex:/^254[17][0-9]{8}$/', // Withdrawal recipient
            'withdrawal_reason' => 'required|string|in:BusinessPayment,SalaryPayment,PromotionPayment',
            'remarks' => 'nullable|string|max:255',
            'initiated_by_name' => 'required|string',
            'otp' => 'required|string|size:6',
            'initiator_phone' => 'required|string|regex:/^254[17][0-9]{8}$/', // Initiator's phone for OTP and notifications
        ]);

        $initiatorPhone = $validated['initiator_phone'];

        Log::info('OTP Verification Debug', [
            'initiator_phone' => $initiatorPhone,
            'submitted_otp' => $validated['otp'],
            'cached_otp' => cache()->get($initiatorPhone . '_otp'),
            'cache_key' => $initiatorPhone . '_otp',
            'match' => ((string)cache()->get($initiatorPhone . '_otp') === (string)$validated['otp'])
        ]);

        if (!$this->verifyOTP($initiatorPhone, $validated['otp'])) {
            return response()->json(['status' => 'error', 'message' => 'Invalid OTP'], 400);
        }

        try {
            $withdrawal = Withdrawal::create([
                'account_id' => $validated['account_id'],
                'amount' => $validated['amount'],
                'phone_number' => $validated['phone_number'],
                'withdrawal_reason' => $validated['withdrawal_reason'],
                'remarks' => $validated['remarks'],
                'initiated_by_name' => $validated['initiated_by_name'],
                'status' => 'initiated',
                'metadata' => [
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'request_source' => $request->header('X-Request-Source', 'api'),
                    'initiator_phone' => $initiatorPhone
                ]
            ]);

            $result = $this->accountService->processB2CWithdrawal(array_merge(
                $validated,
                ['withdrawal_id' => $withdrawal->id]
            ));

            $updatedMetadata = array_merge($withdrawal->metadata, [
                'mpesa_request_details' => $result,
                'reference' => $result['reference'] ?? null
            ]);

            $withdrawal->update([
                'status' => 'pending',
                'mpesa_conversation_id' => $result['conversation_id'] ?? null,
                'mpesa_transaction_id' => $result['transaction_id'] ?? null,
                'metadata' => $updatedMetadata
            ]);

            // Notify the recipient
            $this->sendNotification($validated['phone_number'], "A transaction request of Ksh {$validated['amount']} has been initiated to your phone from MOUT JKUAT.");
            
            // Notify the initiator
            $this->sendNotification($initiatorPhone, "Withdrawal request #{$withdrawal->id} of Ksh {$validated['amount']} to {$validated['phone_number']} has been successfully COMPLETED by {$validated['initiated_by_name']}. MOUT JKUAT MINISTRY");

            // Notify treasurers about successful withdrawal initiation
            $this->paymentNotificationService->notifyTreasurersAboutWithdrawal($withdrawal, 'initiated');

            return response()->json([
                'status' => 'success',
                'message' => 'Withdrawal request initiated successfully',
                'data' => [
                    'withdrawal_id' => $withdrawal->id,
                    'status' => $withdrawal->status,
                    'reference' => $result['reference'] ?? null
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Withdrawal initiation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $validated
            ]);

            if (isset($withdrawal)) {
                $withdrawal->update([
                    'status' => 'failed',
                    'metadata' => array_merge($withdrawal->metadata ?? [], ['error' => $e->getMessage()])
                ]);

                // Notify treasurers about failed withdrawal
                $this->paymentNotificationService->notifyTreasurersAboutWithdrawal($withdrawal, 'failed', $e->getMessage());
            }

            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    public function getWithdrawals(Request $request)
    {
        $query = Withdrawal::with(['account', 'transaction'])
            ->when($request->status, function($q, $status) {
                return $q->where('status', $status);
            })
            ->when($request->account_id, function($q, $accountId) {
                return $q->where('account_id', $accountId);
            })
            ->when($request->from_date, function($q, $fromDate) {
                return $q->where('created_at', '>=', $fromDate);
            })
            ->when($request->to_date, function($q, $toDate) {
                return $q->where('created_at', '<=', $toDate);
            });

        $withdrawals = $query->latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => $withdrawals
        ]);
    }

    /**
     * Get withdrawals requested by the authenticated user.
     */
    public function getMyWithdrawals(Request $request)
    {
        $user = $this->getUserFromBearer($request);
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 401);
        }

        $withdrawals = Withdrawal::with(['account', 'transaction'])
            ->where(function ($q) use ($user) {
                $q->where('initiated_by', $user->id)
                  ->orWhere('metadata->user_id', $user->id)
                  ->orWhere('phone_number', $user->phone_number)
                  ->orWhere('metadata->initiator_phone', $user->phone_number);
            })
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $withdrawals
        ]);
    }

    public function getWithdrawal($id)
    {
        $withdrawal = Withdrawal::with(['account', 'transaction'])
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $withdrawal
        ]);
    }

    public function handleB2CCallback(Request $request)
    {
        Log::info('B2C Callback received', ['data' => $request->all()]);

        try {
            $result = $request->input('Result');
            $conversationId = $result['ConversationID'] ?? null;
            $resultCode = $result['ResultCode'] ?? null;
            $resultDesc = $result['ResultDesc'] ?? null;

            if (!$conversationId) {
                Log::error('B2C callback missing conversation ID');
                return response()->json(['status' => 'error'], 400);
            }

            $withdrawal = Withdrawal::where('mpesa_conversation_id', $conversationId)->first();

            if (!$withdrawal) {
                Log::error('Withdrawal not found for conversation ID', ['conversation_id' => $conversationId]);
                return response()->json(['status' => 'error'], 404);
            }

            if ($resultCode == 0) {
                // Success
                $withdrawal->update([
                    'status' => 'completed',
                    'metadata' => array_merge($withdrawal->metadata ?? [], [
                        'mpesa_callback' => $result,
                        'completed_at' => now()
                    ])
                ]);

                Log::info('Withdrawal completed successfully', ['withdrawal_id' => $withdrawal->id]);

                // Notify treasurers about successful withdrawal completion
                $this->paymentNotificationService->notifyTreasurersAboutWithdrawal($withdrawal, 'completed');

            } else {
                // Failure
                $withdrawal->update([
                    'status' => 'failed',
                    'metadata' => array_merge($withdrawal->metadata ?? [], [
                        'mpesa_callback' => $result,
                        'failure_reason' => $resultDesc,
                        'failed_at' => now()
                    ])
                ]);

                Log::error('Withdrawal failed', [
                    'withdrawal_id' => $withdrawal->id,
                    'result_code' => $resultCode,
                    'result_desc' => $resultDesc
                ]);

                // Notify treasurers about failed withdrawal
                $this->paymentNotificationService->notifyTreasurersAboutWithdrawal($withdrawal, 'failed', $resultDesc);
            }

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            Log::error('B2C callback processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['status' => 'error'], 500);
        }
    }

    public function handleB2CTimeout(Request $request)
    {
        Log::warning('B2C Timeout received', ['data' => $request->all()]);

        try {
            $result = $request->input('Result');
            $conversationId = $result['ConversationID'] ?? null;
            $resultDesc = $result['ResultDesc'] ?? 'Transaction timeout';

            if (!$conversationId) {
                Log::error('B2C timeout callback missing conversation ID');
                return response()->json(['status' => 'error'], 400);
            }

            $withdrawal = Withdrawal::where('mpesa_conversation_id', $conversationId)->first();

            if (!$withdrawal) {
                Log::error('Withdrawal not found for timeout conversation ID', ['conversation_id' => $conversationId]);
                return response()->json(['status' => 'error'], 404);
            }

            // Update withdrawal status to timeout
            $withdrawal->update([
                'status' => 'timeout',
                'metadata' => array_merge($withdrawal->metadata ?? [], [
                    'mpesa_timeout' => $result,
                    'timeout_reason' => $resultDesc,
                    'timeout_at' => now()
                ])
            ]);

            Log::warning('Withdrawal timed out', [
                'withdrawal_id' => $withdrawal->id,
                'result_desc' => $resultDesc
            ]);

            // Notify treasurers about withdrawal timeout
            $this->paymentNotificationService->notifyTreasurersAboutWithdrawal($withdrawal, 'timeout', $resultDesc);

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            Log::error('B2C timeout processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['status' => 'error'], 500);
        }
    }

    public function sendOTP(Request $request)
    {
        $validated = $request->validate([
            'phone_number' => 'required|string|regex:/^254[17][0-9]{8}$/',
        ]);

        $initiatorPhone = $validated['phone_number'];
        $otpServiceUrl = config('services.whatsapp_web.base_url', env('OTP_SERVICE_URL', 'http://localhost:5001'));

        try {
            // Call WhatsApp OTP service with retry logic (same as OTPAuthController)
            $maxRetries = 3;
            $response = null;
            $lastException = null;

            for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
                try {
                    Log::info("Withdrawal OTP Request attempt {$attempt} to {$otpServiceUrl}/send-otp");

                    $response = Http::timeout(30)
                        ->retry(2, 1000)
                        ->post("{$otpServiceUrl}/send-otp", [
                            'phone' => $initiatorPhone,
                            'customMessage' => "Your UET JKUAT withdrawal verification code is: {otp}\n\nValid for 10 minutes.\n\n_UET JKUAT Ministry Platform_"
                        ]);

                    if ($response->successful()) {
                        break;
                    }
                } catch (\Exception $e) {
                    $lastException = $e;
                    Log::warning("Withdrawal OTP attempt {$attempt} failed: " . $e->getMessage());
                    if ($attempt < $maxRetries) {
                        sleep(1);
                    }
                }
            }

            if (!$response || !$response->successful()) {
                Log::error('Failed to send OTP via WhatsApp service', [
                    'phone_number' => $initiatorPhone,
                    'error' => $lastException ? $lastException->getMessage() : 'No response'
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to send OTP. Please try again.'
                ], 500);
            }

            $data = $response->json();

            Log::info('OTP Sent via WhatsApp service', [
                'initiator_phone' => $initiatorPhone,
                'provider' => $data['provider'] ?? 'WhatsApp'
            ]);

            return response()->json([
                'status' => 'success',
                'success' => true,
                'message' => 'OTP sent successfully via WhatsApp',
                'expiresIn' => '10 minutes'
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in sending OTP via WhatsApp', [
                'error' => $e->getMessage(),
                'phone_number' => $initiatorPhone,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'success' => false,
                'message' => 'OTP service temporarily unavailable. Please try again.'
            ], 503);
        }
    }

    protected function verifyOTP($phoneNumber, $otp)
    {
        $otpServiceUrl = config('services.whatsapp_web.base_url', env('OTP_SERVICE_URL', 'http://localhost:5001'));

        try {
            // Verify OTP with WhatsApp OTP service
            $response = Http::timeout(10)->post("{$otpServiceUrl}/verify-otp", [
                'phone' => $phoneNumber,
                'otp' => $otp
            ]);

            if ($response->successful()) {
                $data = $response->json();

                Log::info('OTP Verification Result', [
                    'phone' => $phoneNumber,
                    'success' => $data['success'] ?? false
                ]);

                return $data['success'] ?? false;
            }

            Log::error('OTP Verification Failed', [
                'phone' => $phoneNumber,
                'status' => $response->status()
            ]);

            return false;

        } catch (\Exception $e) {
            Log::error('OTP Verification Exception', [
                'phone' => $phoneNumber,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    protected function sendNotification($to, $message)
    {
        // Using SMS for notifications as per original script
        $this->sendSMS($to, $message);
    }

    protected function sendSMS($to, $message)
    {
        $apiUrl = config('services.sms.api_url', 'https://blessedtexts.com/api/sms/v1/sendsms');
        $formattedTo = preg_replace('/[^\d]/', '', $to);

        $postData = [
            'api_key' => config('services.sms.api_key'),
            'sender_id' => config('services.sms.sender_id', 'FERRITE'),
            'message' => $message,
            'phone' => $formattedTo
        ];

        Http::post($apiUrl, $postData);
    }
}