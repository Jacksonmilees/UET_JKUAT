<?php
// app/Services/MpesaBalanceService.php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Exception;

class MpesaBalanceService
{
    private $baseUrl;
    private $consumerKey;
    private $consumerSecret;
    
    public function __construct()
    {
        $this->baseUrl = config('mpesa.base_url');
        $this->consumerKey = config('mpesa.consumer_key');
        $this->consumerSecret = config('mpesa.consumer_secret');
    }
    
    private function generateAccessToken()
    {
        try {
            $credentials = base64_encode($this->consumerKey . ':' . $this->consumerSecret);
            
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . $credentials
            ])->get($this->baseUrl . '/oauth/v1/generate?grant_type=client_credentials');
            
            if ($response->successful()) {
                return $response->json()['access_token'];
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
    
    public function queryBalance()
    {
        try {
            $token = $this->generateAccessToken();
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json'
            ])->post($this->baseUrl . '/mpesa/accountbalance/v1/query', [
                'Initiator' => config('mpesa.initiator'),
                'SecurityCredential' => config('mpesa.security_credential'),
                'CommandID' => 'AccountBalance',
                'PartyA' => config('mpesa.party_a'),
                'IdentifierType' => '4',
                'Remarks' => 'Account Balance Query',
                'QueueTimeOutURL' => route('mpesa.balance.timeout'),
                'ResultURL' => route('mpesa.balance.result')
            ]);
            
            if ($response->successful()) {
                $result = $response->json();
                Log::info('Balance query initiated', ['response' => $result]);
                return $result;
            }
            
            Log::error('MPesa balance query failed', [
                'response' => $response->json()
            ]);
            
            throw new Exception('Balance query failed');
            
        } catch (Exception $e) {
            Log::error('MPesa balance query error', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

  public function processResult($result)
{
    try {
        Log::info('Processing MPesa balance result', ['result' => $result]);

        // Check if we have the Result key first
        if (!isset($result['Result'])) {
            throw new Exception('Invalid result format: Missing Result key');
        }

        $resultData = $result['Result'];
        
        // Verify ResultParameters exists and get ResultParameter
        if (!isset($resultData['ResultParameters']['ResultParameter'])) {
            throw new Exception('Invalid result format: Missing ResultParameter');
        }

        $parameters = $resultData['ResultParameters']['ResultParameter'];
        
        // Handle both single parameter and array of parameters
        if (!is_array($parameters)) {
            throw new Exception('Invalid parameter format');
        }

        // Find the AccountBalance parameter
        $balanceInfo = null;
        if (isset($parameters[0])) {
            // If it's an array of parameters
            foreach ($parameters as $param) {
                if ($param['Key'] === 'AccountBalance') {
                    $balanceInfo = $param;
                    break;
                }
            }
        } else {
            // If it's a single parameter
            if ($parameters['Key'] === 'AccountBalance') {
                $balanceInfo = $parameters;
            }
        }

        if (!$balanceInfo) {
            throw new Exception('Balance information not found in result');
        }

        // Parse the balance string
        $accounts = explode('&', $balanceInfo['Value']);
        $balances = [];

        foreach ($accounts as $account) {
            $parts = explode('|', trim($account));
            
            if (count($parts) >= 3) {
                $balances[] = [
                    'account_type' => trim($parts[0]),
                    'currency' => trim($parts[1]),
                    'amount' => floatval(trim($parts[2])),
                    'book_balance' => isset($parts[3]) ? floatval(trim($parts[3])) : null,
                    'available_balance' => isset($parts[4]) ? floatval(trim($parts[4])) : null,
                    'reserved_amount' => isset($parts[5]) ? floatval(trim($parts[5])) : null
                ];
            }
        }

        if (empty($balances)) {
            throw new Exception('No valid balance information found');
        }

        // Store all balances but also keep track of transaction data
        Cache::put('mpesa_balance', [
            'balances' => $balances,
            'transaction_data' => [
                'conversation_id' => $resultData['ConversationID'] ?? null,
                'originator_conversation_id' => $resultData['OriginatorConversationID'] ?? null,
                'result_desc' => $resultData['ResultDesc'] ?? null,
                'result_type' => $resultData['ResultType'] ?? null,
                'result_code' => $resultData['ResultCode'] ?? null,
                'transaction_id' => $resultData['TransactionID'] ?? null,
                'timestamp' => now()->toIso8601String()
            ]
        ], now()->addMinutes(5));

        Log::info('MPesa balance processed successfully', [
            'balance_count' => count($balances)
        ]);

    } catch (Exception $e) {
        Log::error('Error processing MPesa balance result', [
            'error' => $e->getMessage(),
            'result' => $result
        ]);
        throw $e;
    }
}
}