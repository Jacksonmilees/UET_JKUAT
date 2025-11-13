<?php
// app/Services/Notifications/PaymentNotificationService.php
namespace App\Services\Notifications;

use App\Models\Transaction;
use Illuminate\Support\Facades\{Http, Log};

class PaymentNotificationService
{
    protected string $walletNotificationUrl;

    public function __construct()
    {
        $this->walletNotificationUrl = config('services.wallet.notification_url');
    }

    public function sendPaymentNotifications(
        Transaction $transaction,
        string $phoneNumber,
        string $payerName
    ): void {
        try {
            // Implement your notification logic here
            // This could be SMS, email, push notifications, etc.
            Log::info('Payment notification sent', [
                'transaction_id' => $transaction->id,
                'phone' => '****' . substr($phoneNumber, -4),
                'amount' => $transaction->amount
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send payment notification', [
                'error' => $e->getMessage(),
                'transaction_id' => $transaction->id
            ]);
        }
    }

    public function sendWalletTransactionNotification(
        array $transactionData,
        string $accountReference
    ): bool {
        try {
            if (!$this->walletNotificationUrl) {
                Log::warning('Wallet notification URL not configured');
                return false;
            }

            $response = Http::post($this->walletNotificationUrl, [
                'account_reference' => $accountReference,
                'transaction_data' => $transactionData
            ]);

            if (!$response->successful()) {
                throw new \Exception(
                    'Failed to send wallet notification: ' . $response->body()
                );
            }

            Log::info('Wallet notification sent', [
                'account_reference' => $accountReference,
                'transaction_id' => $transactionData['id'] ?? null
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to send wallet notification', [
                'error' => $e->getMessage(),
                'account_reference' => $accountReference
            ]);
            return false;
        }
    }
}