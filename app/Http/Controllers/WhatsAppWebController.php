<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\WhatsappWebService;
use App\Services\AirtimeService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Exception;

class WhatsAppWebController extends Controller
{
    protected $whatsappService;
    protected $airtimeService;
    protected $sessionId;
    protected $validAmounts = [20, 50, 100, 200, 500, 1000];

    public function __construct(WhatsappWebService $whatsappService, AirtimeService $airtimeService)
    {
        $this->whatsappService = $whatsappService;
        $this->airtimeService = $airtimeService;
        $this->sessionId = Cache::get('whatsapp_session_id');
    }

    public function startSession()
    {
        try {
            Log::info('Starting new WhatsApp session');
            
            // Clear old session ID and generate new one
            Cache::forget('whatsapp_session_id');
            $this->sessionId = 'airtime_bot_' . time() . '_' . uniqid();
            Cache::put('whatsapp_session_id', $this->sessionId, 3600);

            $response = $this->whatsappService->startSession($this->sessionId);
            
            if ($response['success']) {
                Cache::put("wa_session_status_{$this->sessionId}", $response, 3600);
                Log::info('Session started successfully', ['sessionId' => $this->sessionId]);
            }
            
            return response()->json([
                'success' => true,
                'sessionId' => $this->sessionId,
                'response' => $response
            ]);
        } catch (Exception $e) {
            Log::error('Session start failed', [
                'sessionId' => $this->sessionId,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to start session',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    public function getQR(Request $request)
    {
        try {
            Log::info('Getting QR code');
            
            $sessionId = Cache::get('whatsapp_session_id');
            if (!$sessionId) {
                Log::info('No session found, starting new session');
                $response = $this->startSession();
                $responseData = json_decode($response->getContent(), true);
                if (!$responseData['success']) {
                    throw new Exception('Failed to start new session');
                }
                $sessionId = $this->sessionId;
            }

            $asImage = $request->query('format') === 'image';
            $response = $this->whatsappService->getQR($sessionId, $asImage);

            Log::info('QR code generated successfully', ['asImage' => $asImage]);
            return $asImage ? $response : response()->json($response);
            
        } catch (Exception $e) {
            Log::error('QR code generation failed', [
                'sessionId' => $this->sessionId,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    public function getSessionStatus()
    {
        try {
            if (!$this->sessionId) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active session found'
                ], 404);
            }

            $status = $this->whatsappService->getSessionStatus($this->sessionId);
            Log::info('Session status checked', ['status' => $status]);
            return response()->json($status);

        } catch (Exception $e) {
            Log::error('Failed to get session status', [
                'sessionId' => $this->sessionId,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to get session status',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    public function handleWebhook(Request $request)
    {
        Log::info('Webhook received', ['payload' => $request->all()]);
        
        try {
            $messageData = $request->validate([
                'from' => 'required|string',
                'message' => 'required|string'
            ]);

            if (!$this->sessionId) {
                Log::error('No active session for webhook');
                return response()->json([
                    'success' => false,
                    'message' => 'No active session'
                ], 400);
            }

            // Mark message as seen
            $this->whatsappService->sendSeen($this->sessionId, $messageData['from']);

            // Process the message
            $response = $this->processMessage($messageData['from'], $messageData['message']);
            
            Log::info('Webhook processed successfully', ['response' => $response]);
            return response()->json(['success' => true, 'response' => $response]);

        } catch (Exception $e) {
            Log::error('Webhook handling failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Webhook processing failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function testWebhook()
    {
        try {
            if (!$this->sessionId) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active session'
                ]);
            }

            $testNumber = config('services.whatsapp_web.test_number');
            $response = $this->whatsappService->sendMessage(
                $this->sessionId,
                $testNumber,
                "Test message sent at " . now()
            );

            Log::info('Test message sent', ['response' => $response]);
            return response()->json([
                'success' => true,
                'message' => 'Test message sent',
                'response' => $response
            ]);
        } catch (Exception $e) {
            Log::error('Test webhook failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    protected function processMessage($from, $message)
    {
        Log::info('Processing message', ['from' => $from, 'message' => $message]);
        
        $sessionKey = "wa_session_{$from}";
        $session = Cache::get($sessionKey, [
            'state' => 'START',
            'data' => []
        ]);

        switch ($session['state']) {
            case 'START':
                $this->sendWelcomeMessage($from);
                $session['state'] = 'AWAITING_SELECTION';
                break;

            case 'AWAITING_SELECTION':
                if (strtolower($message) === '1') {
                    $this->whatsappService->sendMessage(
                        $this->sessionId, 
                        $from,
                        "Please enter the phone number to receive airtime (format: 254XXXXXXXXX):"
                    );
                    $session['state'] = 'AWAITING_PHONE';
                } else {
                    $this->sendWelcomeMessage($from);
                }
                break;

            case 'AWAITING_PHONE':
                if ($this->validatePhone($message)) {
                    $session['data']['recipient_phone'] = $message;
                    $this->sendAmountMenu($from);
                    $session['state'] = 'AWAITING_AMOUNT';
                } else {
                    $this->whatsappService->sendMessage(
                        $this->sessionId,
                        $from,
                        "Invalid phone number. Please enter a valid Kenyan phone number starting with 254."
                    );
                }
                break;

            case 'AWAITING_AMOUNT':
                $amount = intval($message);
                if (in_array($amount, $this->validAmounts)) {
                    $session['data']['amount'] = $amount;
                    $this->sendConfirmation($from, $session['data']);
                    $session['state'] = 'AWAITING_CONFIRMATION';
                } else {
                    $this->whatsappService->sendMessage(
                        $this->sessionId,
                        $from,
                        "Invalid amount. Please select from the provided options."
                    );
                    $this->sendAmountMenu($from);
                }
                break;

            case 'AWAITING_CONFIRMATION':
                if (strtolower($message) === 'yes' || strtolower($message) === 'y') {
                    try {
                        $result = $this->processAirtimePurchase($session['data']);
                        $this->sendSuccessMessage($from, $result);
                        $session['state'] = 'START';
                    } catch (Exception $e) {
                        $this->sendErrorMessage($from, $e->getMessage());
                        $session['state'] = 'START';
                    }
                } elseif (strtolower($message) === 'no' || strtolower($message) === 'n') {
                    $this->whatsappService->sendMessage(
                        $this->sessionId,
                        $from,
                        "Transaction cancelled. Type any message to start over."
                    );
                    $session['state'] = 'START';
                } else {
                    $this->whatsappService->sendMessage(
                        $this->sessionId,
                        $from,
                        "Please reply with 'yes' to confirm or 'no' to cancel."
                    );
                }
                break;

            default:
                $this->sendWelcomeMessage($from);
                $session['state'] = 'START';
                break;
        }

        Cache::put($sessionKey, $session, 1800); // 30 minutes expiry
        return $session;
    }

    protected function validatePhone($phone)
    {
        return preg_match('/^254[17][0-9]{8}$/', $phone);
    }

    protected function sendWelcomeMessage($to)
    {
        $message = "Welcome to our Airtime Service! 📱\n\n"
                . "Please select an option:\n"
                . "1. Buy Airtime\n\n"
                . "Reply with the number of your choice.";
        
        $this->whatsappService->sendMessage($this->sessionId, $to, $message);
    }

    protected function sendAmountMenu($to)
    {
        $message = "Please select airtime amount:\n\n"
                . "20 - KES 20\n"
                . "50 - KES 50\n"
                . "100 - KES 100\n"
                . "200 - KES 200\n"
                . "500 - KES 500\n"
                . "1000 - KES 1000\n\n"
                . "Reply with the amount you want to purchase.";
        
        $this->whatsappService->sendMessage($this->sessionId, $to, $message);
    }

    protected function sendConfirmation($to, $data)
    {
        $message = "Please confirm your airtime purchase:\n\n"
                . "Phone: {$data['recipient_phone']}\n"
                . "Amount: KES {$data['amount']}\n\n"
                . "Reply with 'yes' to confirm or 'no' to cancel.";
        
        $this->whatsappService->sendMessage($this->sessionId, $to, $message);
    }

    protected function processAirtimePurchase($data)
    {
        try {
            $result = $this->airtimeService->purchaseAirtime(
                $data['recipient_phone'],
                $data['amount']
            );

            if (!$result['success']) {
                throw new Exception($result['message'] ?? 'Transaction failed');
            }

            return $result;
        } catch (Exception $e) {
            Log::error('Airtime purchase failed', [
                'data' => $data,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    protected function sendSuccessMessage($to, $result)
    {
        $message = "✅ Airtime purchase successful!\n\n"
                . "Transaction ID: {$result['transaction_id']}\n"
                . "Amount: KES {$result['amount']}\n"
                . "Phone: {$result['phone']}\n"
                . "Time: {$result['timestamp']}\n\n"
                . "Thank you for using our service! Type any message to start over.";
        
        $this->whatsappService->sendMessage($this->sessionId, $to, $message);
    }

    protected function sendErrorMessage($to, $error)
    {
        $message = "❌ Transaction failed:\n{$error}\n\n"
                . "Please try again later. Type any message to start over.";
        
        $this->whatsappService->sendMessage($this->sessionId, $to, $message);
    }
}