<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MpesaB2CWithdrawalController extends Controller
{
    public function handleWithdrawalResult(Request $request)
    {
        Log::info('B2C withdrawal callback received', ['payload' => $request->all()]);

        try {
            return DB::transaction(function () use ($request) {
                $result = $request->Result;
                
                // Validate the response structure
                if (!isset($result['ConversationID'])) {
                    Log::error('Invalid callback response structure', ['result' => $result]);
                    return response()->json(['status' => 'error', 'message' => 'Invalid callback response'], 400);
                }

                // Find the transaction
                $transaction = Transaction::where('metadata->conversation_id', $result['ConversationID'])->first();
                
                if (!$transaction) {
                    Log::error('Withdrawal transaction not found for B2C callback', [
                        'conversation_id' => $result['ConversationID']
                    ]);
                    return response()->json(['status' => 'error', 'message' => 'Transaction not found'], 404);
                }

                // Find or create withdrawal record
                $withdrawal = Withdrawal::where('mpesa_conversation_id', $result['ConversationID'])
                    ->orWhere('transaction_id', $transaction->id)
                    ->first();

                if (!$withdrawal) {
                    Log::warning('Creating missing withdrawal record for transaction', [
                        'transaction_id' => $transaction->id
                    ]);
                    
                    $withdrawal = Withdrawal::create([
                        'account_id' => $transaction->account_id,
                        'transaction_id' => $transaction->id,
                        'initiated_by_name' => $transaction->metadata['initiated_by_name'] ?? 'admin', // Default to 'admin' if no name provided
                        'amount' => $transaction->amount,
                        'phone_number' => $transaction->phone_number,
                        'withdrawal_reason' => $transaction->metadata['withdrawal_reason'] ?? 'BusinessPayment',
                        'remarks' => $transaction->metadata['remarks'] ?? null,
                        'mpesa_conversation_id' => $result['ConversationID'],
                        'status' => 'pending'
                    ]);
                }

                // Process result parameters if they exist
                $resultParams = [];
                if (isset($result['ResultParameters']['ResultParameter'])) {
                    $resultParams = collect($result['ResultParameters']['ResultParameter'])
                        ->keyBy('Key')
                        ->map(function ($item) {
                            return $item['Value'];
                        })
                        ->toArray();
                }

                $isSuccessful = $result['ResultCode'] === 0;
                $newStatus = $isSuccessful ? 'completed' : 'failed';

                // Update withdrawal with complete information
                $withdrawal->update([
                    'status' => $newStatus,
                    'mpesa_result_code' => $result['ResultCode'],
                    'mpesa_result_desc' => $result['ResultDesc'],
                    'mpesa_transaction_id' => $result['TransactionID'] ?? null,
                    'completed_at' => $isSuccessful ? now() : null,
                    'metadata' => array_merge($withdrawal->metadata ?? [], [
                        'result_params' => $resultParams,
                        'raw_response' => $request->all(),
                        'transaction_completed_datetime' => $resultParams['TransactionCompletedDateTime'] ?? now(),
                        'receiver_party_public_name' => $resultParams['ReceiverPartyPublicName'] ?? null,
                        'working_account_funds' => $resultParams['B2CWorkingAccountAvailableFunds'] ?? null,
                        'utility_account_funds' => $resultParams['B2CUtilityAccountAvailableFunds'] ?? null,
                        'transaction_amount' => $resultParams['TransactionAmount'] ?? $transaction->amount
                    ])
                ]);

                // Process account balance update for successful transactions
                if ($isSuccessful) {
                    $account = $transaction->account;
                    $account->balance -= $transaction->amount;
                    $account->save();

                    Log::info('Account balance updated after successful withdrawal', [
                        'account_id' => $account->id,
                        'transaction_id' => $transaction->id,
                        'new_balance' => $account->balance
                    ]);
                }

                // Update transaction status
                $transaction->update([
                    'status' => $newStatus,
                    'metadata' => array_merge($transaction->metadata, [
                        'result_code' => $result['ResultCode'],
                        'result_desc' => $result['ResultDesc'],
                        'transaction_id' => $result['TransactionID'] ?? null,
                        'callback_received_at' => now(),
                        'withdrawal_id' => $withdrawal->id
                    ])
                ]);

                Log::info('B2C withdrawal callback processed successfully', [
                    'transaction_id' => $transaction->id,
                    'withdrawal_id' => $withdrawal->id,
                    'new_status' => $newStatus,
                    'is_successful' => $isSuccessful
                ]);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Callback processed successfully',
                    'data' => [
                        'withdrawal_id' => $withdrawal->id,
                        'transaction_id' => $transaction->id,
                        'new_status' => $newStatus
                    ]
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Error processing B2C withdrawal callback', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all()
            ]);

            return response()->json([
                'status' => 'error', 
                'message' => 'Error processing callback: ' . $e->getMessage()
            ], 500);
        }
    }
}