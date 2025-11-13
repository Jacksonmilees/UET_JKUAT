<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Facades\Log;

class MpesaCallbackService
{
    public function handleCallback($data)
    {
        if (!isset($data['account_id']) || !isset($data['transaction_data'])) {
            throw new \Exception('Invalid callback data structure');
        }

        $transactionData = $data['transaction_data'];
        
        // Create transaction record
        $transaction = Transaction::create([
            'account_id' => $data['account_id'],
            'amount' => $transactionData['TransAmount'],
            'type' => 'credit',
            'reference' => $transactionData['TransID'],
            'status' => 'completed',
            'metadata' => [
                'mpesa_transaction_type' => $transactionData['TransactionType'],
                'mpesa_transaction_time' => $transactionData['TransTime'],
                'mpesa_phone_number' => $transactionData['MSISDN'],
                'mpesa_business_shortcode' => $transactionData['BusinessShortCode'],
                'bill_reference' => $transactionData['BillRefNumber'],
                'payer_name' => $transactionData['FirstName'] ?? null,
                'raw_response' => $transactionData
            ]
        ]);

        Log::info('M-Pesa transaction recorded', [
            'transaction_id' => $transaction->id,
            'mpesa_trans_id' => $transactionData['TransID'],
            'account_id' => $data['account_id']
        ]);

        return $transaction;
    }
}