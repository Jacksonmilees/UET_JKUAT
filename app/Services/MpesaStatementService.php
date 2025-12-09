<?php
// app/Services/MpesaStatementService.php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Exception;

class MpesaStatementService
{
    private $baseUrl;
    private $consumerKey;
    private $consumerSecret;
    private $shortcode;
    private $initiatorName;
    private $securityCredential;
    
    public function __construct()
    {
        $this->baseUrl = config('mpesa.base_url');
        $this->consumerKey = config('mpesa.consumer_key');
        $this->consumerSecret = config('mpesa.consumer_secret');
        $this->shortcode = config('mpesa.shortcode');
        $this->initiatorName = config('mpesa.initiator');
        $this->securityCredential = config('mpesa.security_credential');
    }
    
    private function generateAccessToken()
    {
        $cacheKey = 'mpesa_access_token';
        
        // Check if we have a cached token
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }
        
        try {
            $credentials = base64_encode($this->consumerKey . ':' . $this->consumerSecret);
            
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . $credentials
            ])->get($this->baseUrl . '/oauth/v1/generate?grant_type=client_credentials');
            
            if ($response->successful()) {
                $token = $response->json()['access_token'];
                // Cache token for 50 minutes (expires in 60)
                Cache::put($cacheKey, $token, 3000);
                return $token;
            }
            
            Log::error('MPesa token generation failed', [
                'response' => $response->json()
            ]);
            
            throw new Exception('Token generation failed');
            
        } catch (Exception $e) {
            Log::error('MPesa token error', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
    
    /**
     * Query Transaction Status to verify a specific transaction
     */
    public function queryTransactionStatus($transactionId)
    {
        try {
            $accessToken = $this->generateAccessToken();
            $callbackUrl = config('app.url') . '/api/mpesa/transaction-status/result';
            $timeoutUrl = config('app.url') . '/api/mpesa/transaction-status/timeout';
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/json'
            ])->post($this->baseUrl . '/mpesa/transactionstatus/v1/query', [
                'Initiator' => $this->initiatorName,
                'SecurityCredential' => $this->securityCredential,
                'CommandID' => 'TransactionStatusQuery',
                'TransactionID' => $transactionId,
                'PartyA' => $this->shortcode,
                'IdentifierType' => '4', // 4 for Paybill
                'ResultURL' => $callbackUrl,
                'QueueTimeOutURL' => $timeoutUrl,
                'Remarks' => 'Transaction Status Query',
                'Occasion' => 'Status Check'
            ]);
            
            Log::info('Transaction status query response', [
                'status' => $response->status(),
                'body' => $response->json()
            ]);
            
            if ($response->successful()) {
                return $response->json();
            }
            
            throw new Exception('Transaction status query failed: ' . $response->body());
            
        } catch (Exception $e) {
            Log::error('Transaction status query error', [
                'error' => $e->getMessage(),
                'transactionId' => $transactionId
            ]);
            throw $e;
        }
    }
    
    /**
     * Request Account Statement (Mini Statement)
     * Note: This requires special permissions from Safaricom
     */
    public function requestMiniStatement()
    {
        try {
            $accessToken = $this->generateAccessToken();
            $callbackUrl = config('app.url') . '/api/mpesa/statement/result';
            $timeoutUrl = config('app.url') . '/api/mpesa/statement/timeout';
            
            // Note: This API requires additional approval from Safaricom
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/json'
            ])->post($this->baseUrl . '/mpesa/accountbalance/v1/query', [
                'Initiator' => $this->initiatorName,
                'SecurityCredential' => $this->securityCredential,
                'CommandID' => 'AccountBalance',
                'PartyA' => $this->shortcode,
                'IdentifierType' => '4',
                'Remarks' => 'Account Balance Query',
                'QueueTimeOutURL' => $timeoutUrl,
                'ResultURL' => $callbackUrl
            ]);
            
            if ($response->successful()) {
                return $response->json();
            }
            
            throw new Exception('Mini statement request failed: ' . $response->body());
            
        } catch (Exception $e) {
            Log::error('Mini statement request error', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
}
