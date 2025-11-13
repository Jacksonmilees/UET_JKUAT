<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class MpesaService
{
    protected $consumerKey;
    protected $consumerSecret;
    protected $shortcode;
    protected $passkey;
    protected $env;
    protected $callbackUrl;

    public function __construct()
    {
        $this->consumerKey = env('MPESA_CONSUMER_KEY');
        $this->consumerSecret = env('MPESA_CONSUMER_SECRET');
        $this->shortcode = env('MPESA_SHORTCODE');
        $this->passkey = env('MPESA_PASSKEY');
        $this->env = env('MPESA_ENV');
        $this->callbackUrl = env('MPESA_CALLBACK_URL');
    }

    public function getAccessToken()
    {
        $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
            ->get("https://{$this->env}.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials");

        return $response->json()['access_token'];
    }

    public function stkPush($amount, $phone, $accountReference, $transactionDesc)
    {
        $timestamp = date('YmdHis');
        $password = base64_encode($this->shortcode . $this->passkey . $timestamp);

        $response = Http::withToken($this->getAccessToken())
            ->post("https://{$this->env}.safaricom.co.ke/mpesa/stkpush/v1/processrequest", [
                'BusinessShortCode' => $this->shortcode,
                'Password' => $password,
                'Timestamp' => $timestamp,
                'TransactionType' => 'CustomerPayBillOnline',
                'Amount' => $amount,
                'PartyA' => $phone,
                'PartyB' => $this->shortcode,
                'PhoneNumber' => $phone,
                'CallBackURL' => $this->callbackUrl,
                'AccountReference' => $accountReference,
                'TransactionDesc' => $transactionDesc,
            ]);

        return $response->json();
    }
}