<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AirtimeService
{
    protected $apiUrl;
    protected $apiKey;
    protected $clientId;
    protected $partnerId;
    protected $httpClient;
    protected $accountService;
    protected $paymentNotificationService;

    public function __construct(AccountService $accountService, PaymentNotificationService $paymentNotificationService)
    {
        $this->apiUrl = config('services.credofaster.url');
        $this->apiKey = config('services.credofaster.api_key');
        $this->clientId = config('services.credofaster.client_id');
        $this->partnerId = config('services.credofaster.partner_id');

        $this->httpClient = new Client([
            'base_uri' => $this->apiUrl,
            'verify' => false,
            'timeout' => 30 // Increased timeout
        ]);

        $this->accountService = $accountService;
        $this->paymentNotificationService = $paymentNotificationService;
    }

    public function purchaseAirtime(Account $account, string $phoneNumber, float $amount, $airtimeAccountId = null)
    {
        if ($airtimeAccountId === null) {
            $airtimeAccountId = config('services.airtime.default_account_id', 82);
        }

        $airtimeAccount = is_object($airtimeAccountId)
            ? $airtimeAccountId
            : Account::findOrFail($airtimeAccountId);

        try {
            return DB::transaction(function () use ($account, $airtimeAccount, $phoneNumber, $amount) {
                if ($account->balance < $amount) {
                    throw new \Exception('Insufficient balance');
                }

                $requestData = [
                    'initiator' => [
                        'type' => 'PARTNER',
                        'id' => $this->partnerId
                    ],
                    'parameters' => [
                        [
                            'reference_id' => (string) Str::uuid(),
                            'country' => 'KE',
                            'account_no' => $phoneNumber,
                            'denomination' => [
                                'name' => 'KE',
                                'value' => (int) $amount
                            ],
                            'other' => [
                                'account_id' => $account->id
                            ]
                        ]
                    ]
                ];

                // Enhanced API request with comprehensive logging
                Log::info('Airtime Purchase Request', [
                    'url' => '/airtime/request',
                    'headers' => [
                        'ApiKey' => substr($this->apiKey, 0, 5) . '...',
                        'ClientId' => substr($this->clientId, 0, 5) . '...'
                    ],
                    'payload' => $requestData
                ]);

                $response = $this->httpClient->post('/airtime/request', [
                    'headers' => [
                        'ApiKey' => $this->apiKey,
                        'ClientId' => $this->clientId
                    ],
                    'json' => $requestData
                ]);

                $responseBody = $response->getBody()->getContents();
                $result = json_decode($responseBody, true);

                // Detailed API response logging
                Log::info('Airtime Purchase API Response', [
                    'status_code' => $response->getStatusCode(),
                    'raw_body' => $responseBody,
                    'parsed_result' => $result
                ]);

                // Flexible error checking
                if (!$result || !is_array($result)) {
                    throw new \Exception('Invalid API response format');
                }

                // Customize error checking based on actual API response structure
                $apiResponse = $result[0] ?? $result;
                if (!isset($apiResponse['RequestId']) || 
                    (isset($apiResponse['ErrorCode']) && $apiResponse['ErrorCode'] !== 0)) {
                    throw new \Exception('Airtime purchase failed: ' . 
                        ($apiResponse['ErrorDescription'] ?? 'Unknown error'));
                }

                $requestId = $apiResponse['RequestId'];

                // Create user's debit transaction
                $userTransaction = Transaction::create([
                    'account_id' => $account->id,
                    'amount' => $amount,
                    'type' => 'debit',
                    'reference' => $requestId,
                    'status' => 'completed',
                    'phone_number' => $phoneNumber,
                    'metadata' => [
                        'transaction_type' => 'Airtime Purchase',
                        'narrative' => 'Airtime purchased for ' . $phoneNumber,
                        'airtime_provider' => 'Credofaster',
                        'airtime_amount' => $amount,
                        'airtime_phone_number' => $phoneNumber,
                        'airtime_request_id' => $requestId
                    ]
                ]);

                // Create airtime account credit transaction
                $airtimeTransaction = Transaction::create([
                    'account_id' => $airtimeAccount->id,
                    'amount' => $amount,
                    'type' => 'credit',
                    'reference' => $requestId,
                    'status' => 'completed',
                    'phone_number' => $phoneNumber,
                    'metadata' => [
                        'transaction_type' => 'Airtime Sales',
                        'narrative' => 'Airtime sale from ' . $account->name,
                        'airtime_provider' => 'Credofaster',
                        'airtime_amount' => $amount,
                        'airtime_phone_number' => $phoneNumber,
                        'airtime_request_id' => $requestId
                    ]
                ]);

                // Update account balances
                $account->balance -= $amount;
                $account->save();

                $airtimeAccount->balance += $amount;
                $airtimeAccount->save();

                // Send notifications
                $this->paymentNotificationService->sendWalletTransactionNotification(
                    $userTransaction->toArray(),
                    $account->reference
                );

                $this->paymentNotificationService->sendAirtimePurchaseNotification(
                    $phoneNumber,
                    $amount,
                    $requestId
                );

                return [
                    'success' => true,
                    'reference' => $requestId,
                    'amount' => $amount,
                    'phone_number' => $phoneNumber,
                    'user_transaction_id' => $userTransaction->id,
                    'airtime_transaction_id' => $airtimeTransaction->id
                ];
            });
        } catch (\Exception $e) {
            Log::error('Airtime Purchase Failed', [
                'error' => $e->getMessage(), 
                'trace' => $e->getTraceAsString(),
                'account_id' => $account->id,
                'phone_number' => $phoneNumber,
                'amount' => $amount
            ]);
            throw new \Exception('Airtime purchase failed: ' . $e->getMessage());
        }
    }

    public function checkBalance()
    {
        try {
            $response = $this->httpClient->post('/airtime/balance', [
                'headers' => [
                    'ApiKey' => $this->apiKey,
                    'ClientId' => $this->clientId
                ]
            ]);

            $result = json_decode($response->getBody(), true);

            // More flexible error checking
            if (!$result || !isset($result['ErrorCode'])) {
                throw new \Exception('Invalid balance response');
            }

            if ($result['ErrorCode'] !== 0) {
                throw new \Exception('Balance check failed: ' . ($result['ErrorDescription'] ?? 'Unknown error'));
            }

            return $result;

        } catch (\Exception $e) {
            Log::error('Balance Check Failed', [
                'error' => $e->getMessage(), 
                'trace' => $e->getTraceAsString()
            ]);
            throw new \Exception('Balance check failed: ' . $e->getMessage());
        }
    }
}