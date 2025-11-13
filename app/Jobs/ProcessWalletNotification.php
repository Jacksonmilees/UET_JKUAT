<?php
namespace App\Jobs;

use App\Services\PaymentNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ProcessWalletNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $transaction;
    public $data;

    public function __construct($transaction, array $data)
    {
        $this->transaction = $transaction;
        $this->data = $data;
    }

    public function handle(PaymentNotificationService $notificationService)
    {
        try {
            $transactionId = $this->transaction->id ?? 'unknown';
            $this->safeLog('debug', 'Processing wallet notification job', [
                'transaction_id' => $transactionId,
                'data' => $this->data,
                'transaction_phone' => $this->transaction->phone_number ?? null
            ]);

            // Validate mmid
            if (!isset($this->data['mmid']) && isset($this->data['account_reference'])) {
                try {
                    $mmid = DB::connection('member_db')->table('members')
                        ->where('mmid', $this->data['account_reference'])
                        ->value('mmid');
                    if ($mmid) {
                        $this->data['mmid'] = $mmid;
                        $this->safeLog('debug', 'Resolved MMID from account_reference', [
                            'account_reference' => $this->data['account_reference'],
                            'mmid' => $mmid,
                            'transaction_id' => $transactionId
                        ]);
                    } else {
                        $this->safeLog('warning', 'No MMID found for account_reference', [
                            'account_reference' => $this->data['account_reference'],
                            'transaction_id' => $transactionId
                        ]);
                    }
                } catch (\Exception $e) {
                    $this->safeLog('error', 'Error resolving MMID', [
                        'error' => $e->getMessage(),
                        'account_reference' => $this->data['account_reference'],
                        'transaction_id' => $transactionId
                    ]);
                }
            }

            if (!isset($this->data['mmid']) && $this->transaction->phone_number) {
                try {
                    $formattedPhone = $this->formatPhoneNumber($this->transaction->phone_number);
                    $mmid = DB::connection('member_db')->table('members')
                        ->where('whatsapp', 'like', '%' . $formattedPhone . '%')
                        ->value('mmid');
                    if ($mmid) {
                        $this->data['mmid'] = $mmid;
                        $this->safeLog('debug', 'Resolved MMID from phone_number', [
                            'phone_number' => $formattedPhone,
                            'mmid' => $mmid,
                            'transaction_id' => $transactionId
                        ]);
                    }
                } catch (\Exception $e) {
                    $this->safeLog('error', 'Error resolving MMID by phone', [
                        'error' => $e->getMessage(),
                        'phone_number' => $this->transaction->phone_number,
                        'transaction_id' => $transactionId
                    ]);
                }
            }

            $success = $notificationService->sendWalletNotificationToMember($this->transaction, $this->data);

            if ($success) {
                $this->safeLog('info', 'Wallet notification sent successfully', [
                    'transaction_id' => $transactionId,
                    'mmid' => $this->data['mmid'] ?? null
                ]);
            } else {
                $this->safeLog('error', 'Wallet notification failed to send', [
                    'transaction_id' => $transactionId,
                    'mmid' => $this->data['mmid'] ?? null,
                    'data' => $this->data
                ]);
            }
        } catch (\Exception $e) {
            $this->safeLog('error', 'Wallet notification job failed', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage(),
                'data' => $this->data
            ]);
            throw $e;
        }
    }

    protected function formatPhoneNumber($phone)
    {
        $cleaned = preg_replace('/[^\d]/', '', $phone);

        if (strlen($cleaned) == 9 && $cleaned[0] == '7') {
            $cleaned = '254' . $cleaned;
        } elseif (strlen($cleaned) == 10 && $cleaned[0] == '0') {
            $cleaned = '254' . substr($cleaned, 1);
        } elseif (strlen($cleaned) == 12 && substr($cleaned, 0, 3) == '254') {
            // Already in correct format
        } else {
            Log::warning('Unusual phone number format in job', [
                'phone' => $phone,
                'cleaned' => $cleaned
            ]);
        }

        return $cleaned;
    }

    protected function safeLog($level, $message, array $context = [])
    {
        $safeContext = array_map(function ($value) {
            return is_array($value) || is_object($value) ? json_encode($value) : $value;
        }, $context);

        Log::$level($message, $safeContext);
    }
}