<?php
// app/Services/Payments/MpesaB2CService.php
namespace App\Services\Payments;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Exceptions\TransactionFailedException;

class MpesaB2CService
{
    protected string $baseUrl;
    protected string $consumerKey;
    protected string $consumerSecret;
    protected string $initiatorName;
    protected string $securityCredential;
    protected string $shortcode;

    public function __construct()
    {
        $this->baseUrl = config('mpesa.b2c.url');
        $this->consumerKey = config('mpesa.b2c.consumer_key');
        $this->consumerSecret = config('mpesa.b2c.consumer_secret');
        $this->initiatorName = config('mpesa.b2c.initiator_name');
        $this->securityCredential = config('mpesa.b2c.security_credential');
        $this->shortcode = config('mpesa.b2c.shortcode');
    }

    public function initiate(array $data): array
    {
        try {
            $token = $this->getAccessToken();
            
            $response = Http::withToken($token)
                ->timeout(30)
                ->post($this->baseUrl, [
                    'InitiatorName' => $this->initiatorName,
                    'SecurityCredential' => $this->securityCredential,
                    'CommandID' => $data['reason'],
                    'Amount' => $data['amount'],
                    'PartyA' => $this->shortcode,
                    'PartyB' => $data['phone'],
                    'Remarks' => $data['remarks'],
                    'QueueTimeOutURL' => route('api.mpesa.b2c.timeout'),
                    'ResultURL' => route('api.mpesa.b2c.result'),
                    'Occasion' => $data['reference']
                ]);

            if (!$response->successful()) {
                throw new TransactionFailedException(
                    'Failed to initiate B2C request: ' . $response->body()
                );
            }

            return $response->json();

        } catch (\Exception $e) {
            Log::error('B2C request failed', [
                'error' => $e->getMessage(),
                'data' => array_merge($data, ['phone' => '****' . substr($data['phone'], -4)])
            ]);
            throw new TransactionFailedException(
                'Failed to process B2C request: ' . $e->getMessage()
            );
        }
    }

    protected function getAccessToken(): string
    {
        $credentials = base64_encode(
            $this->consumerKey . ':' . $this->consumerSecret
        );
        
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . $credentials
            ])->get(config('mpesa.b2c.token_url'));

            if (!$response->successful()) {
                throw new TransactionFailedException(
                    'Failed to get access token: ' . $response->status()
                );
            }

            $data = $response->json();
            if (!isset($data['access_token'])) {
                throw new TransactionFailedException('Invalid token response format');
            }

            return $data['access_token'];

        } catch (\Exception $e) {
            Log::error('Failed to get M-Pesa access token', [
                'error' => $e->getMessage()
            ]);
            throw new TransactionFailedException(
                'Failed to get access token: ' . $e->getMessage()
            );
        }
    }
}