<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\AccountService;
use Illuminate\Support\Facades\Log;
use App\Models\Transaction;

class MobilePaymentController extends Controller
{
    protected $accountService;

    public function __construct(AccountService $accountService)
    {
        $this->accountService = $accountService;
    }

    /**
     * Handle B2C (Business to Customer) transaction callback from M-Pesa
     */
    public function handleB2CCallback(Request $request)
    {
        Log::info('B2C callback received', $request->all());

        try {
            $result = $request->Result;
            
            // Extract key information from callback
            $resultType = $result['ResultType'] ?? null;
            $resultCode = $result['ResultCode'] ?? null;
            $resultDesc = $result['ResultDesc'] ?? null;
            $transactionId = $result['TransactionID'] ?? null;
            $conversationId = $result['ConversationID'] ?? null;

            // Find the original transaction
            $transaction = Transaction::where('reference', $conversationId)
                ->orWhere('provider_reference', $transactionId)
                ->first();

            if (!$transaction) {
                Log::error('B2C callback received for unknown transaction', [
                    'conversation_id' => $conversationId,
                    'transaction_id' => $transactionId
                ]);
                return response()->json(['status' => 'error', 'message' => 'Transaction not found']);
            }

            // Update transaction status based on result
            if ($resultCode === '0') {
                $transaction->update([
                    'status' => 'completed',
                    'provider_reference' => $transactionId,
                    'completed_at' => now(),
                    'metadata' => array_merge($transaction->metadata ?? [], [
                        'mpesa_result_type' => $resultType,
                        'mpesa_result_code' => $resultCode,
                        'mpesa_result_desc' => $resultDesc,
                        'mpesa_conversation_id' => $conversationId,
                        'mpesa_transaction_id' => $transactionId,
                        'completed_at' => now()->toISOString()
                    ])
                ]);

                // Trigger any additional success handling
                $this->handleSuccessfulB2C($transaction);
            } else {
                $transaction->update([
                    'status' => 'failed',
                    'provider_reference' => $transactionId,
                    'metadata' => array_merge($transaction->metadata ?? [], [
                        'mpesa_result_type' => $resultType,
                        'mpesa_result_code' => $resultCode,
                        'mpesa_result_desc' => $resultDesc,
                        'mpesa_conversation_id' => $conversationId,
                        'mpesa_transaction_id' => $transactionId,
                        'failed_at' => now()->toISOString()
                    ])
                ]);

                // Handle failed transaction
                $this->handleFailedB2C($transaction, $resultDesc);
            }

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            Log::error('Error processing B2C callback', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Error processing callback'
            ], 500);
        }
    }

    /**
     * Handle successful B2C transaction
     */
    protected function handleSuccessfulB2C(Transaction $transaction)
    {
        try {
            // Update account balances if needed
            if ($transaction->type === 'withdrawal' && $transaction->account) {
                $transaction->account->decrement('balance', $transaction->amount);
            }

            // Send notifications if needed
            $this->sendB2CNotification($transaction, 'success');

            Log::info('B2C transaction completed successfully', [
                'transaction_id' => $transaction->id,
                'reference' => $transaction->reference
            ]);
        } catch (\Exception $e) {
            Log::error('Error in handleSuccessfulB2C', [
                'error' => $e->getMessage(),
                'transaction_id' => $transaction->id
            ]);
        }
    }

    /**
     * Handle failed B2C transaction
     */
    protected function handleFailedB2C(Transaction $transaction, string $failureReason)
    {
        try {
            // Reverse any pending account changes
            if ($transaction->type === 'withdrawal' && $transaction->account) {
                // Add the amount back to the account if it was preliminarily deducted
                $transaction->account->increment('balance', $transaction->amount);
            }

            // Send failure notification
            $this->sendB2CNotification($transaction, 'failure', $failureReason);

            Log::error('B2C transaction failed', [
                'transaction_id' => $transaction->id,
                'reference' => $transaction->reference,
                'reason' => $failureReason
            ]);
        } catch (\Exception $e) {
            Log::error('Error in handleFailedB2C', [
                'error' => $e->getMessage(),
                'transaction_id' => $transaction->id
            ]);
        }
    }

    /**
     * Send notification for B2C transaction
     */
    protected function sendB2CNotification(Transaction $transaction, string $status, string $message = null)
    {
        try {
            $recipient = $transaction->initiated_by;
            $notificationData = [
                'transaction_id' => $transaction->id,
                'amount' => $transaction->amount,
                'status' => $status,
                'message' => $message ?? 'Transaction ' . ($status === 'success' ? 'completed successfully' : 'failed')
            ];

            // You can implement your notification logic here
            // Example: Notification::send($recipient, new B2CTransactionNotification($notificationData));

        } catch (\Exception $e) {
            Log::error('Error sending B2C notification', [
                'error' => $e->getMessage(),
                'transaction_id' => $transaction->id
            ]);
        }
    }

    /**
     * Validate B2C transaction request
     */
    public function validateB2CRequest(Request $request)
    {
        try {
            $validated = $request->validate([
                'phone_number' => 'required|string|regex:/^254[17][0-9]{8}$/',
                'amount' => 'required|numeric|min:10|max:150000',
                'account_id' => 'required|exists:accounts,id',
                'reason' => 'required|string|in:SalaryPayment,BusinessPayment,PromotionPayment'
            ]);

            // Additional validation logic here
            // e.g., check account balance, transaction limits, etc.

            return response()->json([
                'status' => 'success',
                'message' => 'Request validation successful'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}