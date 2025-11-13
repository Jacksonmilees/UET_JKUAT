<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MsisdnDecoderService
{
    protected $apiUrl = 'https://decodehash.com/app/api/v1/decode-hash/freemium/';
    
    public function decode($hash)
    {
        try {
            $response = Http::withToken(env('DECODE_HASH_TOKEN'))
                           ->get($this->apiUrl . $hash);
            
            if ($response->successful()) {
                $data = $response->json();
                return $data['msisdn'] ?? null;
            }
            
            Log::error('MSISDN decode failed', [
                'hash' => $hash,
                'response' => $response->body()
            ]);
            
            return null;
        } catch (\Exception $e) {
            Log::error('MSISDN decode error', [
                'hash' => $hash,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
}