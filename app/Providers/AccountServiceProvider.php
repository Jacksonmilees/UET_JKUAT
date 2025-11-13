<?php

namespace App\Providers;

use App\Models\Account;
use App\Models\Transaction;
use App\Services\AccountService;
use App\Services\PaymentNotificationService;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AccountServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        // Register PaymentNotificationService
        $this->app->singleton(PaymentNotificationService::class, function ($app) {
            return new PaymentNotificationService();
        });

        // Register AccountService with its dependencies
        $this->app->singleton(AccountService::class, function ($app) {
            return new AccountService(
                $app->make(PaymentNotificationService::class)
            );
        });
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }

    /**
     * Process a payment transaction
     *
     * @param array $paymentData
     * @return object
     * @throws \Exception
     */
    protected function processPayment(array $paymentData)
    {
        return DB::transaction(function () use ($paymentData) {
            try {
                // Validate required payment data
                if (!isset($paymentData['account_reference']) || !isset($paymentData['amount'])) {
                    throw new \Exception('Missing required payment data');
                }

                $account = $this->resolveAccount($paymentData['account_reference']);
                
                // Validate payment amount
                $amount = floatval($paymentData['amount']);
                if ($amount <= 0) {
                    throw new \Exception('Invalid payment amount');
                }

                // Check for duplicate transaction
                if (isset($paymentData['transaction_id'])) {
                    $existingTransaction = Transaction::where('reference', $paymentData['transaction_id'])->first();
                    if ($existingTransaction) {
                        return (object)[
                            'status' => 'error',
                            'message' => 'Duplicate transaction',
                            'transaction_id' => $paymentData['transaction_id']
                        ];
                    }
                }

                // Update account balance
                $account->balance += $amount;
                $account->save();

                // Create transaction record
                $transaction = $this->createTransaction($account, $paymentData);

                // Send notifications
                if ($this->app->bound(PaymentNotificationService::class)) {
                    $notificationService = $this->app->make(PaymentNotificationService::class);
                    
                    $notificationService->sendPaymentNotifications(
                        $transaction,
                        $paymentData['phone_number'] ?? null,
                        $paymentData['payer_name'] ?? null
                    );

                    if ($account->type === 'standard') {
                        $notificationService->sendWalletTransactionNotification(
                            $transaction->toArray(),
                            $account->reference
                        );
                    }
                }

                Log::info('Payment processed successfully', [
                    'account_id' => $account->id,
                    'reference' => $account->reference,
                    'amount' => $amount,
                    'new_balance' => $account->balance,
                    'transaction_id' => $transaction->id
                ]);

                return (object)[
                    'status' => 'success',
                    'account_id' => $account->id,
                    'transaction_id' => $transaction->id,
                    'balance' => $account->balance,
                    'reference' => $account->reference
                ];

            } catch (\Exception $e) {
                Log::error('Error processing payment', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'payment_data' => $paymentData
                ]);
                throw $e;
            }
        });
    }

    /**
     * Resolve account by reference
     *
     * @param string $accountReference
     * @return Account
     */
    protected function resolveAccount(string $accountReference)
    {
        if ($accountReference === 'OFF') {
            return $this->resolveOfflineAccount();
        }

        return Account::firstOrCreate(
            ['reference' => $accountReference],
            [
                'name' => 'Account ' . $accountReference,
                'type' => 'standard',
                'account_type_id' => config('mpesa.default_account_type_id', 1),
                'account_subtype_id' => config('mpesa.default_account_subtype_id', 1),
                'balance' => 0,
                'status' => 'active',
                'metadata' => ['payment_method' => 'mpesa']
            ]
        );
    }

    /**
     * Resolve offline account
     *
     * @return Account
     */
    protected function resolveOfflineAccount()
    {
        $defaultReference = config('mpesa.default_account_reference', 'MPESA_RECEIPTS');
        
        return Account::firstOrCreate(
            ['reference' => $defaultReference],
            [
                'name' => 'M-Pesa Offline Payments',
                'type' => 'mpesa_offline',
                'account_type_id' => config('mpesa.default_account_type_id', 1),
                'account_subtype_id' => config('mpesa.default_account_subtype_id', 1),
                'balance' => 0,
                'status' => 'active',
                'metadata' => ['payment_method' => 'mpesa']
            ]
        );
    }

    /**
     * Create transaction record
     *
     * @param Account $account
     * @param array $paymentData
     * @return Transaction
     */
    protected function createTransaction(Account $account, array $paymentData)
    {
        return Transaction::create([
            'account_id' => $account->id,
            'amount' => $paymentData['amount'],
            'type' => 'credit',
            'reference' => $paymentData['transaction_id'] ?? 'TRX-' . Str::random(12),
            'status' => 'completed',
            'phone_number' => $paymentData['phone_number'] ?? null,
            'payer_name' => $paymentData['payer_name'] ?? null,
            'bill_ref' => $paymentData['account_reference'],
            'processed_at' => now(),
            'org_balance' => $account->balance,
            'metadata' => [
                'mpesa_transaction_id' => $paymentData['transaction_id'] ?? null,
                'mpesa_business_shortcode' => $paymentData['metadata']['BusinessShortCode'] ?? null,
                'mpesa_transaction_time' => $paymentData['metadata']['TransTime'] ?? null,
                'payment_method' => 'mpesa',
                'transaction_type' => 'Payment',
                'bill_reference' => $paymentData['account_reference']
            ]
        ]);
    }
}