<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\MpesaCallbackService;
use App\Services\AccountService;
use App\Services\MsisdnDecoderService;
use App\Services\PaymentNotificationService;
use App\Models\Transaction;
use App\Models\Account;
use App\Models\Ticket;
use App\Exceptions\PaymentProcessingException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class MpesaCallbackController extends Controller
{
    protected $mpesaCallbackService;
    protected $accountService;
    protected $msisdnDecoder;
    protected $notificationService;

    public function __construct(
        MpesaCallbackService $mpesaCallbackService,
        AccountService $accountService,
        MsisdnDecoderService $msisdnDecoder,
        PaymentNotificationService $notificationService
    ) {
        $this->mpesaCallbackService = $mpesaCallbackService;
        $this->accountService = $accountService;
        $this->msisdnDecoder = $msisdnDecoder;
        $this->notificationService = $notificationService;
    }

    public function handle(Request $request)
    {
        // Enhanced logging for debugging
        Log::info('=== M-PESA CALLBACK RECEIVED ===', [
            'timestamp' => now()->toDateTimeString(),
            'ip' => $request->ip(),
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'headers' => $request->headers->all(),
            'payload' => $request->all(),
            'raw_content' => $request->getContent()
        ]);

        try {
            $callbackData = $request->all();

            if (isset($callbackData['Body']['stkCallback'])) {
                $stkCallback = $callbackData['Body']['stkCallback'];

                if ($stkCallback['ResultCode'] != 0) {
                    Log::warning('M-Pesa callback failed or timed out', [
                        'ResultCode' => $stkCallback['ResultCode'],
                        'ResultDesc' => $stkCallback['ResultDesc'],
                        'CheckoutRequestID' => $stkCallback['CheckoutRequestID'],
                        'MerchantRequestID' => $stkCallback['MerchantRequestID'],
                    ]);
                    return $this->errorResponse($stkCallback['ResultDesc'], 400);
                }

                return $this->processStkPushCallback($stkCallback);
            }

            $this->validateCallback($callbackData);
            return $this->processPayment($callbackData);

        } catch (ValidationException $e) {
            Log::error('Validation Error: ' . $e->getMessage(), [
                'errors' => $e->errors(),
                'data' => $callbackData ?? null
            ]);
            return $this->errorResponse('Validation failed: ' . $e->getMessage(), 400);
        } catch (\Exception $e) {
            Log::error('M-Pesa Callback Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return $this->errorResponse($e->getMessage());
        }
    }

    protected function validateCallback(array $data): bool
    {
        if (isset($data['Body']['stkCallback'])) {
            return true;
        }

        $validator = Validator::make($data, [
            'TransactionType' => 'required|string',
            'TransID' => 'required|string',
            'TransTime' => 'required',
            'TransAmount' => 'required|numeric|gt:0',
            'BusinessShortCode' => 'required|string',
            'BillRefNumber' => 'required|string',
            'MSISDN' => 'required|string'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return true;
    }

   protected function processStkPushCallback(array $stkCallback)
{
    try {
        // Extract relevant data from the callback
        $callbackMetadata = $stkCallback['CallbackMetadata']['Item'];
        $amount = $this->getCallbackMetadataValue($callbackMetadata, 'Amount');
        $mpesaReceiptNumber = $this->getCallbackMetadataValue($callbackMetadata, 'MpesaReceiptNumber');
        $phoneNumber = $this->getCallbackMetadataValue($callbackMetadata, 'PhoneNumber');
        $transactionDate = $this->getCallbackMetadataValue($callbackMetadata, 'TransactionDate');

        // Find the pending ticket using the CheckoutRequestID
        $checkoutRequestId = $stkCallback['CheckoutRequestID'];
        
        // Try to find ticket, but handle if column doesn't exist
        $ticket = null;
        try {
            $ticket = Ticket::where('checkout_request_id', $checkoutRequestId)->first();
        } catch (\Exception $e) {
            Log::info('Ticket lookup failed (column may not exist), processing as direct payment', [
                'error' => $e->getMessage()
            ]);
        }

        // If no ticket found, create a direct payment transaction
        if (!$ticket) {
            Log::info('No ticket found - processing as direct payment', [
                'checkout_request_id' => $checkoutRequestId,
                'amount' => $amount,
                'phone' => $phoneNumber
            ]);
            
            // Get or create main account
            $account = Account::first();
            if (!$account) {
                // Create account if none exists
                $accountType = DB::table('account_types')->where('code', 'GEN')->first();
                if (!$accountType) {
                    $accountTypeId = DB::table('account_types')->insertGetId([
                        'name' => 'General',
                        'code' => 'GEN',
                        'description' => 'General Account',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                } else {
                    $accountTypeId = $accountType->id;
                }

                $accountSubtype = DB::table('account_subtypes')->where('code', 'MAIN')->first();
                if (!$accountSubtype) {
                    $accountSubtypeId = DB::table('account_subtypes')->insertGetId([
                        'account_type_id' => $accountTypeId,
                        'name' => 'Main',
                        'code' => 'MAIN',
                        'description' => 'Main Account',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                } else {
                    $accountSubtypeId = $accountSubtype->id;
                }

                $account = Account::create([
                    'reference' => 'MPESA-MAIN',
                    'name' => 'M-Pesa Main Account',
                    'account_type_id' => $accountTypeId,
                    'account_subtype_id' => $accountSubtypeId,
                    'type' => 'general',
                    'balance' => 0,
                    'status' => 'active',
                    'metadata' => ['source' => 'mpesa_callback']
                ]);
            }

            // Create transaction
            $transaction = Transaction::create([
                'account_id' => $account->id,
                'transaction_id' => $mpesaReceiptNumber,
                'amount' => $amount,
                'type' => 'credit',
                'payment_method' => 'mpesa',
                'reference' => $mpesaReceiptNumber,
                'status' => 'completed',
                'phone_number' => $phoneNumber,
                'payer_name' => 'Direct Payment',
                'metadata' => [
                    'transaction_type' => 'Direct M-Pesa Payment',
                    'mpesa_transaction_id' => $mpesaReceiptNumber,
                    'transaction_time' => $transactionDate,
                    'checkout_request_id' => $checkoutRequestId,
                ],
                'processed_at' => now()
            ]);

            // Update account balance
            $account->balance += $amount;
            $account->save();

            Log::info('Direct payment transaction created', [
                'transaction_id' => $transaction->id,
                'amount' => $amount,
                'account_balance' => $account->balance
            ]);

            return $this->successResponse('Direct payment processed successfully', $transaction->id);
        }

        // Update all relevant columns
        $ticket->update([
            'amount' => $amount,
            'phone_number' => $phoneNumber,
            'payment_status' => 'completed',
            'status' => 'completed',
            'mpesa_receipt_number' => $mpesaReceiptNumber,
            'updated_at' => now(),
        ]);

        // Find the account using the MMID reference
        $account = $this->accountService->findAccountByReference($ticket->member_mmid);

        if ($account) {
            // Update the account balance
            $account->balance += $amount;
            $account->save();

            // Create a transaction record
            $transaction = Transaction::create([
                'account_id' => $account->id,
                'amount' => $amount,
                'type' => 'credit',
                'reference' => $mpesaReceiptNumber,
                'status' => 'completed',
                'phone_number' => $phoneNumber,
                'payer_name' => $ticket->buyer_name,
                'metadata' => [
                    'transaction_type' => 'Ticket Purchase',
                    'ticket_number' => $ticket->ticket_number,
                    'mpesa_transaction_id' => $mpesaReceiptNumber,
                    'transaction_time' => $transactionDate,
                ],
            ]);

            // Send notifications
            $this->paymentNotificationService->sendPaymentNotifications(
                $transaction,
                $phoneNumber,
                $ticket->buyer_name
            );

            Log::info('Wallet credited and transaction created', [
                'account_id' => $account->id,
                'transaction_id' => $transaction->id,
                'amount' => $amount,
                'new_balance' => $account->balance,
            ]);
        } else {
            Log::warning('Account not found for MMID: ' . $ticket->member_mmid);
        }

        Log::info('Ticket updated successfully', [
            'ticket_number' => $ticket->ticket_number,
            'payment_status' => $ticket->payment_status,
            'mpesa_receipt_number' => $ticket->mpesa_receipt_number,
        ]);

        return $this->successResponse('STK push callback processed successfully', $ticket->ticket_number);

    } catch (\Exception $e) {
        Log::error('STK push callback processing error: ' . $e->getMessage());
        return $this->errorResponse('Failed to process STK push callback: ' . $e->getMessage());
    }
}

    protected function getCallbackMetadataValue(array $callbackMetadata, string $key): ?string
    {
        foreach ($callbackMetadata as $item) {
            if ($item['Name'] === $key) {
                return $item['Value'] ?? null;
            }
        }
        return null;
    }

    protected function processPayment(array $callbackData)
    {
        return DB::transaction(function () use ($callbackData) {
            if (strpos($callbackData['BillRefNumber'], 'TKT-') === 0) {
                $ticketNumber = explode('-', $callbackData['BillRefNumber'])[2];
                $ticket = Ticket::where('ticket_number', $ticketNumber)->first();

                if ($ticket) {
                    $ticket->update([
                        'payment_status' => 'completed',
                    ]);

                    $account = $this->accountService->findAccountByReference($ticket->mmid);
                    if ($account) {
                        $account = $this->lockAndUpdateAccount($account, $callbackData['TransAmount']);

                        $transaction = $this->createTransaction($account, $callbackData, $this->processMsisdn($callbackData['MSISDN']));

                        $this->sendNotifications($transaction, $this->processMsisdn($callbackData['MSISDN']), $callbackData);

                        Log::info('Ticket payment processed successfully', [
                            'ticket_number' => $ticketNumber,
                            'account_id' => $account->id,
                            'amount' => $callbackData['TransAmount'],
                            'mpesa_trans_id' => $callbackData['TransID']
                        ]);
                    }
                }

                return $this->successResponse('Ticket payment processed successfully', $ticketNumber);
            } else {
                $account = $this->verifyAndGetAccount($callbackData['BillRefNumber']);

                if ($existingTransaction = $this->checkDuplicateTransaction($callbackData['TransID'])) {
                    return $this->successResponse('Duplicate transaction acknowledged', $existingTransaction->id);
                }

                $decodedMsisdn = $this->processMsisdn($callbackData['MSISDN']);
                $account = $this->lockAndUpdateAccount($account, $callbackData['TransAmount']);
                $transaction = $this->createTransaction($account, $callbackData, $decodedMsisdn);

                $this->sendNotifications($transaction, $decodedMsisdn, $callbackData);

                Log::info('M-Pesa payment processed successfully', [
                    'transaction_id' => $transaction->id,
                    'account_id' => $account->id,
                    'amount' => $callbackData['TransAmount'],
                    'mpesa_trans_id' => $callbackData['TransID']
                ]);

                return $this->successResponse('Payment processed successfully', $transaction->id);
            }
        });
    }

    protected function verifyAndGetAccount(string $reference): Account
    {
        $account = $this->accountService->findAccountByReference($reference);

        if (!$account) {
            throw new PaymentProcessingException("Invalid account reference: {$reference}");
        }

        return $account;
    }

    protected function checkDuplicateTransaction(string $transId): ?Transaction
    {
        return Transaction::where('reference', $transId)->first();
    }

    protected function processMsisdn(string $msisdn): string
    {
        try {
            $decoded = $this->msisdnDecoder->decode($msisdn);
            return $decoded ?: $msisdn;
        } catch (\Exception $e) {
            Log::warning('MSISDN decoding failed', [
                'original_msisdn' => $msisdn,
                'error' => $e->getMessage()
            ]);
            return $msisdn;
        }
    }

    protected function lockAndUpdateAccount(Account $account, float $amount): Account
    {
        $lockedAccount = Account::where('id', $account->id)->lockForUpdate()->first();

        if (!$lockedAccount) {
            throw new PaymentProcessingException('Account not found after locking');
        }

        $lockedAccount->balance += $amount;
        $lockedAccount->save();

        return $lockedAccount;
    }

    protected function createTransaction(Account $account, array $callbackData, string $decodedMsisdn): Transaction
    {
        $transaction = new Transaction();
        $transaction->account_id = $account->id;
        $transaction->transaction_id = $callbackData['TransID'];
        $transaction->amount = floatval($callbackData['TransAmount']);
        $transaction->type = 'credit';
        $transaction->payment_method = 'mpesa';
        $transaction->status = 'completed';
        $transaction->reference = $callbackData['TransID'];
        $transaction->phone_number = $decodedMsisdn;
        $transaction->payer_name = $callbackData['FirstName'] ?? null;
        $transaction->metadata = [
            'transaction_type' => $callbackData['TransactionType'],
            'business_shortcode' => $callbackData['BusinessShortCode'],
            'bill_reference' => $callbackData['BillRefNumber'],
            'trans_time' => $callbackData['TransTime'],
            'raw_response' => $callbackData,
            'original_msisdn' => $callbackData['MSISDN'],
            'account_balance' => $account->balance,
            'callback_processed_at' => now()->toDateTimeString()
        ];
        $transaction->processed_at = now();
        $transaction->save();

        return $transaction;
    }

    protected function sendNotifications(Transaction $transaction, string $msisdn, array $callbackData): void
    {
        try {
            $this->notificationService->sendPaymentNotifications(
                $transaction,
                $msisdn,
                $callbackData['FirstName'] ?? null
            );
        } catch (\Exception $e) {
            Log::error('Failed to send payment notification', [
                'error' => $e->getMessage(),
                'transaction_id' => $transaction->id
            ]);
        }
    }

    protected function successResponse(string $message, $transactionId): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'ResultCode' => 0,
            'ResultDesc' => $message,
            'ThirdPartyTransID' => $transactionId
        ]);
    }

    protected function errorResponse(string $message, int $status = 500): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'ResultCode' => 1,
            'ResultDesc' => 'Failed: ' . $message
        ], $status);
    }
}
