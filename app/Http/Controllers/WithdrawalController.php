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
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        try {
            $messageSent = $this->sendWhatsAppMessage($initiatorPhone, $otp);
            if (!$messageSent) {
                Log::error('Failed to send OTP via WhatsApp', ['phone_number' => $initiatorPhone]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to send OTP'
                ], 500);
            }

            $cacheKey = $initiatorPhone . '_otp';
            cache()->put($cacheKey, $otp, now()->addMinutes(10));

            Log::info('OTP Sent via WhatsApp', [
                'initiator_phone' => $initiatorPhone,
                'cache_key' => $cacheKey,
                'otp' => $otp
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'OTP sent successfully via WhatsApp'
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in sending OTP via WhatsApp', [
                'error' => $e->getMessage(),
                'phone_number' => $initiatorPhone,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to send OTP'
            ], 500);
        }
    }

    protected function verifyOTP($phoneNumber, $otp)
    {
        $cachedOTP = cache()->get($phoneNumber . '_otp');
        return $cachedOTP && (string)$cachedOTP === (string)$otp;
    }

    protected function sendWhatsAppMessage($to, $otp)
    {
        $phone_number_id = '707651015772272';
        $access_token = 'EAFdTYxYcXGkBPV6VKkZCs1zMOlbNAJFWi5GZCUZBZCYGv7yg9aSBDOVUrnYY3LOCtp6LPSeXawkwtRSrKJZAS2BVOAj2FUNfZBcrZANOLcqfZAczNVyZAZAz9MeFw9tTtwz4xRWC8vLDXScgvgyxHUyxxgzaKH0KgFS9VnMlaJUPdkpoZAieg7AoDtFgaie43yB';
        $api_url = "https://graph.facebook.com/v22.0/$phone_number_id/messages";

        // Format phone number for WhatsApp
        $formatted_to = preg_replace('/[^0-9]/', '', $to);
        if (!str_starts_with($formatted_to, '254')) {
            if (str_starts_with($formatted_to, '0')) {
                $formatted_to = '254' . substr($formatted_to, 1);
            } else if (str_starts_with($formatted_to, '7')) {
                $formatted_to = '254' . $formatted_to;
            }
        }

        // WhatsApp template data
        $postData = [
            'messaging_product' => 'whatsapp',
            'to' => $formatted_to,
            'type' => 'template',
            'template' => [
                'name' => 'otp_verification',
                'language' => [
                    'code' => 'en'
                ],
                'components' => [
                    [
                        'type' => 'body',
                        'parameters' => [
                            [
                                'type' => 'text',
                                'text' => (string)$otp
                            ]
                        ]
                    ],
                    [
                        'type' => 'button',
                        'sub_type' => 'url',
                        'index' => 0,
                        'parameters' => [
                            [
                                'type' => 'text',
                                'text' => (string)$otp
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $ch = curl_init($api_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $access_token
        ]);

        // Enable verbose output for debugging
        $debug_file = fopen('whatsapp_debug.log', 'a');
        curl_setopt($ch, CURLOPT_VERBOSE, true);
        curl_setopt($ch, CURLOPT_STDERR, $debug_file);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_error = curl_error($ch);
        curl_close($ch);
        fclose($debug_file);

        // Check if message was sent successfully
        $response_data = json_decode($response, true);
        $message_sent = false;
        $message_id = null;

        if ($http_code >= 200 && $http_code < 300 && isset($response_data['messages'][0]['id'])) {
            $message_sent = true;
            $message_id = $response_data['messages'][0]['id'];
        }

        // Log response for debugging
        $log_message = "Time: " . date('Y-m-d H:i:s') . "\n";
        $log_message .= "To: $formatted_to\n";
        $log_message .= "HTTP Code: $http_code\n";
        $log_message .= "Message Sent: " . ($message_sent ? 'YES' : 'NO') . "\n";
        if ($message_id) {
            $log_message .= "Message ID: $message_id\n";
        }
        $log_message .= "Response: " . ($response ?: 'No response') . "\n";
        if ($curl_error) {
            $log_message .= "cURL Error: $curl_error\n";
        }
        $log_message .= "Request Body: " . json_encode($postData) . "\n";
        $log_message .= "------------------------\n";
        error_log($log_message, 3, 'whatsapp_errors.log');

        return $message_sent;
    }

    protected function sendNotification($to, $message)
    {
        // Using SMS for notifications as per original script
        $this->sendSMS($to, $message);
    }

    protected function sendSMS($to, $message)
    {
        $apiUrl = 'https://blessedtexts.com/api/sms/v1/sendsms';
        $formattedTo = preg_replace('/[^\d]/', '', $to);

        $postData = [
            'api_key' => 'af09ec090e4c42498d52bb2673ff559b',
            'sender_id' => 'FERRITE',
            'message' => $message,
            'phone' => $formattedTo
        ];

        Http::post($apiUrl, $postData);
    }
}