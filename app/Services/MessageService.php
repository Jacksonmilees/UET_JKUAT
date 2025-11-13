<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Exception;

class MessageService
{
    /**
     * Send WhatsApp message
     */
    public static function sendWhatsApp(string $to, string $recipientName, string $message): bool
    {
        try {
            $api_url = Config::get('services.whatsapp.api_url');
            $formatted_to = preg_replace('/[^\d]/', '', $to);
            
            $response = Http::timeout(30)
                ->post($api_url, [
                    'chatId' => $formatted_to . '@c.us',
                    'contentType' => 'string',
                    'content' => $message
                ]);
            
            if (!$response->successful()) {
                Log::error("WhatsApp send failed", [
                    'to' => $to,
                    'recipient' => $recipientName,
                    'response' => $response->json()
                ]);
                return false;
            }

            return true;
        } catch (Exception $e) {
            Log::error("WhatsApp send error", [
                'to' => $to,
                'recipient' => $recipientName,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send SMS message
     */
    public static function sendSMS(string $to, string $message): bool
    {
        try {
            $api_url = Config::get('services.sms.api_url');
            $api_key = Config::get('services.sms.api_key');
            $sender_id = Config::get('services.sms.sender_id');
            
            $formatted_to = preg_replace('/[^\d]/', '', $to);
            
            $response = Http::timeout(30)
                ->post($api_url, [
                    'api_key' => $api_key,
                    'sender_id' => $sender_id,
                    'message' => $message,
                    'phone' => $formatted_to
                ]);

            if (!$response->successful()) {
                Log::error("SMS send failed", [
                    'to' => $to,
                    'response' => $response->json()
                ]);
                return false;
            }

            return true;
        } catch (Exception $e) {
            Log::error("SMS send error", [
                'to' => $to,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Decode phone number hash
     */
    public static function decodePhoneNumber(string $hash): ?string
    {
        try {
            $api_url = Config::get('services.decode_hash.api_url');
            $api_key = Config::get('services.decode_hash.api_key');

            $response = Http::timeout(30)
                ->withHeaders(['Authorization' => "Bearer {$api_key}"])
                ->post($api_url, ['hash' => $hash]);

            if (!$response->successful()) {
                Log::error("Phone number decode failed", [
                    'hash' => $hash,
                    'response' => $response->json()
                ]);
                return null;
            }

            $data = $response->json();
            return $data['phone_number'] ?? null;
        } catch (Exception $e) {
            Log::error("Phone number decode error", [
                'hash' => $hash,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
}