<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class WhatsappWebService
{
    protected $baseUrl;
    protected $timeout = 30;
    protected $retries = 3;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.whatsapp_web.base_url'), '/');
        
        if (empty($this->baseUrl)) {
            throw new Exception('WhatsApp Web Service base URL is not configured');
        }
    }

    public function startSession($sessionId)
    {
        try {
            Log::info('Starting WhatsApp session', ['sessionId' => $sessionId]);
            
            $response = Http::timeout($this->timeout)
                ->retry($this->retries, 100)
                ->get("{$this->baseUrl}/session/start/{$sessionId}");

            if (!$response->successful()) {
                Log::error('WhatsApp session start failed', [
                    'sessionId' => $sessionId,
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'url' => "{$this->baseUrl}/session/start/{$sessionId}"
                ]);
                throw new Exception("Failed to start session: " . $response->body());
            }

            return [
                'success' => true,
                'sessionId' => $sessionId,
                'status' => 'STARTING',
                'message' => 'Session initialization in progress'
            ];
        } catch (Exception $e) {
            Log::error('WhatsApp session start request failed', [
                'sessionId' => $sessionId,
                'error' => $e->getMessage(),
                'baseUrl' => $this->baseUrl
            ]);
            throw $e;
        }
    }

    public function getQR($sessionId, $asImage = false)
    {
        try {
            Log::info('Getting QR code', ['sessionId' => $sessionId, 'asImage' => $asImage]);
            
            $endpoint = $asImage ? 
                "session/qr-image/{$sessionId}" : 
                "session/qr/{$sessionId}";

            $response = Http::timeout($this->timeout)
                ->retry($this->retries, 100)
                ->get("{$this->baseUrl}/{$endpoint}");

            if (!$response->successful()) {
                Log::error('Failed to get QR code', [
                    'sessionId' => $sessionId,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                throw new Exception("Failed to get QR code: " . $response->body());
            }

            if ($asImage) {
                return $response->body();
            }

            return [
                'success' => true,
                'qrCode' => $response->json('qrCode'),
                'status' => $response->json('status', 'PENDING')
            ];
        } catch (Exception $e) {
            Log::error('QR code request failed', [
                'sessionId' => $sessionId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function getSessionStatus($sessionId)
    {
        try {
            Log::info('Checking session status', ['sessionId' => $sessionId]);
            
            $response = Http::timeout($this->timeout)
                ->retry($this->retries, 100)
                ->get("{$this->baseUrl}/session/status/{$sessionId}");

            if (!$response->successful()) {
                Log::error('Failed to get session status', [
                    'sessionId' => $sessionId,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                throw new Exception("Failed to get session status: " . $response->body());
            }

            return [
                'success' => true,
                'status' => $response->json('status'),
                'message' => $response->json('message', 'Session status retrieved successfully')
            ];
        } catch (Exception $e) {
            Log::error('Session status check failed', [
                'sessionId' => $sessionId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function sendSeen($sessionId, $to)
    {
        try {
            Log::info('Marking message as seen', ['sessionId' => $sessionId, 'to' => $to]);
            
            $response = Http::timeout($this->timeout)
                ->retry($this->retries, 100)
                ->post("{$this->baseUrl}/message/seen", [
                    'sessionId' => $sessionId,
                    'to' => $to
                ]);

            if (!$response->successful()) {
                Log::error('Failed to mark message as seen', [
                    'sessionId' => $sessionId,
                    'to' => $to,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                throw new Exception("Failed to mark message as seen: " . $response->body());
            }

            return [
                'success' => true,
                'message' => 'Message marked as seen'
            ];
        } catch (Exception $e) {
            Log::error('Send seen status failed', [
                'sessionId' => $sessionId,
                'to' => $to,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function sendMessage($sessionId, $to, $message)
    {
        try {
            Log::info('Sending message', [
                'sessionId' => $sessionId,
                'to' => $to,
                'messageLength' => strlen($message)
            ]);
            
            $response = Http::timeout($this->timeout)
                ->retry($this->retries, 100)
                ->post("{$this->baseUrl}/message/send", [
                    'sessionId' => $sessionId,
                    'to' => $to,
                    'message' => $message
                ]);

            if (!$response->successful()) {
                Log::error('Failed to send message', [
                    'sessionId' => $sessionId,
                    'to' => $to,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                throw new Exception("Failed to send message: " . $response->body());
            }

            return [
                'success' => true,
                'messageId' => $response->json('messageId'),
                'timestamp' => $response->json('timestamp', now()->toIso8601String()),
                'message' => 'Message sent successfully'
            ];
        } catch (Exception $e) {
            Log::error('Message send failed', [
                'sessionId' => $sessionId,
                'to' => $to,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
}