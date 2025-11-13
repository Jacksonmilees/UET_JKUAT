<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class DarajaApiService
{
    protected $baseUrl;
    protected $consumerKey;
    protected $consumerSecret;
    protected $passkey;
    protected $shortcode;
    protected $env;

    public function __construct()
    {
        $this->env = config('mpesa.env');
        $this->baseUrl = $this->env === 'production' 
            ? 'https://api.safaricom.co.ke' 
            : 'https://sandbox.safaricom.co.ke';
        $this->consumerKey = config('mpesa.consumer_key');
        $this->consumerSecret = config('mpesa.consumer_secret');
        $this->passkey = config('mpesa.passkey');
        $this->shortcode = config('mpesa.shortcode');
    }

    /**
     * Generate M-Pesa API access token
     *
     * @return string
     * @throws \Exception
     */
    public function generateAccessToken()
    {
        try {
            // Use file driver explicitly for token caching
            $token = Cache::store('file')->get('mpesa_access_token');
            
            if ($token) {
                return $token;
            }

            $credentials = base64_encode($this->consumerKey . ':' . $this->consumerSecret);
            
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . $credentials
            ])->get($this->baseUrl . '/oauth/v1/generate?grant_type=client_credentials');

            if ($response->successful()) {
                $token = $response->json('access_token');
                // Cache token for 50 minutes using file driver
                Cache::store('file')->put('mpesa_access_token', $token, now()->addMinutes(50));
                return $token;
            }

            throw new \Exception('Failed to generate access token: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('M-Pesa token generation failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Register URLs for C2B payments
     *
     * @return array
     * @throws \Exception
     */
    public function registerUrls()
    {
        try {
            $token = $this->generateAccessToken();

            Log::info('Attempting to register URLs with token', ['token' => $token]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token
            ])->post($this->baseUrl . '/mpesa/c2b/v2/registerurl', [
                'ShortCode' => $this->shortcode,
                'ResponseType' => 'Completed',
                'ConfirmationURL' => route('payments.confirmation'),
                'ValidationURL' => route('payments.validation'),
            ]);

            Log::info('M-Pesa URL registration response', ['response' => $response->json()]);

            if (!$response->successful()) {
                throw new \Exception('URL registration failed: ' . $response->body());
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('M-Pesa URL registration failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Simulate C2B payment (only available in sandbox environment)
     *
     * @param float $amount
     * @param string $phoneNumber
     * @param string $billRefNumber
     * @return array
     * @throws \Exception
     */
    public function simulateC2BPayment($amount, $phoneNumber, $billRefNumber)
    {
        if ($this->env === 'production') {
            throw new \Exception('C2B simulation is only available in sandbox environment');
        }

        try {
            $token = $this->generateAccessToken();

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token
            ])->post($this->baseUrl . '/mpesa/c2b/v1/simulate', [
                'ShortCode' => $this->shortcode,
                'CommandID' => 'CustomerPayBillOnline',
                'Amount' => $amount,
                'Msisdn' => $phoneNumber,
                'BillRefNumber' => $billRefNumber
            ]);

            Log::info('M-Pesa C2B simulation response', ['response' => $response->json()]);

            if (!$response->successful()) {
                throw new \Exception('C2B simulation failed: ' . $response->body());
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('M-Pesa C2B simulation failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Initiate STK Push payment
     *
     * @param float $amount
     * @param string $phoneNumber
     * @param string $accountReference
     * @param string $transactionDesc
     * @return array
     * @throws \Exception
     */
    public function initiateSTKPush($amount, $phoneNumber, $accountReference, $transactionDesc)
    {
        try {
            $token = $this->generateAccessToken();
            $timestamp = $this->generateTimestamp();
            $password = $this->generatePassword();

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token
            ])->post($this->baseUrl . '/mpesa/stkpush/v1/processrequest', [
                'BusinessShortCode' => $this->shortcode,
                'Password' => $password,
                'Timestamp' => $timestamp,
                'TransactionType' => 'CustomerPayBillOnline',
                'Amount' => $amount,
                'PartyA' => $phoneNumber,
                'PartyB' => $this->shortcode,
                'PhoneNumber' => $phoneNumber,
                'CallBackURL' => route('payments.stk.callback'),
                'AccountReference' => $accountReference,
                'TransactionDesc' => $transactionDesc
            ]);

            Log::info('M-Pesa STK push response', ['response' => $response->json()]);

            if (!$response->successful()) {
                throw new \Exception('STK push failed: ' . $response->body());
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('M-Pesa STK push failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Query STK Push transaction status
     *
     * @param string $checkoutRequestId
     * @return array
     * @throws \Exception
     */
    public function querySTKStatus($checkoutRequestId)
    {
        try {
            $token = $this->generateAccessToken();
            $timestamp = $this->generateTimestamp();
            $password = $this->generatePassword();

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token
            ])->post($this->baseUrl . '/mpesa/stkpushquery/v1/query', [
                'BusinessShortCode' => $this->shortcode,
                'Password' => $password,
                'Timestamp' => $timestamp,
                'CheckoutRequestID' => $checkoutRequestId
            ]);

            Log::info('M-Pesa STK query response', ['response' => $response->json()]);

            if (!$response->successful()) {
                throw new \Exception('STK query failed: ' . $response->body());
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('M-Pesa STK query failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate timestamp for M-Pesa API
     *
     * @return string
     */
    public function generateTimestamp()
    {
        return now()->format('YmdHis');
    }

    /**
     * Generate password for M-Pesa API
     *
     * @return string
     */
    public function generatePassword()
    {
        $timestamp = $this->generateTimestamp();
        return base64_encode($this->shortcode . $this->passkey . $timestamp);
    }

    /**
     * Validate callback data
     *
     * @param array $data
     * @return bool
     */
    public function validateCallback($data)
    {
        try {
            // Validate required fields
            $requiredFields = ['TransID', 'TransAmount', 'BusinessShortCode', 'BillRefNumber', 'MSISDN'];
            
            foreach ($requiredFields as $field) {
                if (!isset($data[$field])) {
                    Log::error('M-Pesa callback validation failed: Missing required field', ['field' => $field]);
                    return false;
                }
            }

            // Validate transaction amount (if needed)
            if (!is_numeric($data['TransAmount'])) {
                Log::error('M-Pesa callback validation failed: Invalid transaction amount');
                return false;
            }

            // Validate business shortcode
            if ($data['BusinessShortCode'] !== $this->shortcode) {
                Log::error('M-Pesa callback validation failed: Invalid business shortcode');
                return false;
            }

            // Add any other custom validation rules here

            return true;
        } catch (\Exception $e) {
            Log::error('M-Pesa callback validation failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Process callback data
     *
     * @param array $data
     * @return array
     */
    public function processCallback($data)
    {
        try {
            // Validate the callback data
            if (!$this->validateCallback($data)) {
                throw new \Exception('Invalid callback data');
            }

            // Process the transaction
            // You can add your business logic here
            // For example, updating order status, sending notifications, etc.

            return [
                'ResultCode' => 0,
                'ResultDesc' => 'Callback processed successfully'
            ];
        } catch (\Exception $e) {
            Log::error('M-Pesa callback processing failed: ' . $e->getMessage());
            
            return [
                'ResultCode' => 1,
                'ResultDesc' => 'Callback processing failed'
            ];
        }
    }
}