<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use DB;

class MpesaController extends Controller
{
    private $consumerKey;
    private $consumerSecret;
    private $passkey;
    private $shortcode;
    private $env;
    
    public function __construct()
    {
        $this->consumerKey = config('services.mpesa.consumer_key');
        $this->consumerSecret = config('services.mpesa.consumer_secret');
        $this->passkey = config('services.mpesa.passkey');
        $this->shortcode = config('services.mpesa.shortcode');
        $this->env = config('services.mpesa.env');
    }

    private function getAccessToken()
    {
        $url = $this->env === 'sandbox' 
            ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
            : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

        $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
            ->get($url);

        if ($response->successful()) {
            return $response->json()['access_token'];
        }

        throw new \Exception('Failed to get access token');
    }

    public function initiateSTKPush(Request $request)
    {
        $request->validate([
            'phone_number' => 'required|regex:/^254[0-9]{9}$/',
            'amount' => 'required|numeric|min:1',
            'account_number' => 'required|string',
        ]);

        try {
            $accessToken = $this->getAccessToken();
            
            $timestamp = Carbon::now()->format('YmdHis');
            $password = base64_encode($this->shortcode . $this->passkey . $timestamp);
            
            $url = $this->env === 'sandbox'
                ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
                : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

            $response = Http::withToken($accessToken)
                ->post($url, [
                    'BusinessShortCode' => $this->shortcode,
                    'Password' => $password,
                    'Timestamp' => $timestamp,
                    'TransactionType' => 'CustomerPayBillOnline',
                    'Amount' => $request->amount,
                    'PartyA' => $request->phone_number,
                    'PartyB' => $this->shortcode,
                    'PhoneNumber' => $request->phone_number,
                    'CallBackURL' => route('mpesa.callback'),
                    'AccountReference' => $request->account_number,
                    'TransactionDesc' => 'Ticket Purchase'
                ]);

            if ($response->successful()) {
                $responseData = $response->json();
                
                // Store the STK Push request details
                $stkRequest = [
                    'merchant_request_id' => $responseData['MerchantRequestID'],
                    'checkout_request_id' => $responseData['CheckoutRequestID'],
                    'member_mmid' => $request->account_number,
                    'phone_number' => $request->phone_number,
                    'amount' => $request->amount,
                    'status' => 'pending'
                ];

                // You might want to store this in your database
                // StkRequest::create($stkRequest);
                
                return response()->json([
                    'success' => true,
                    'message' => 'STK push initiated successfully',
                    'data' => $responseData
                ]);
            }

            Log::error('STK Push request failed', [
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate STK push',
                'error' => $response->json()
            ], 400);

        } catch (\Exception $e) {
            Log::error('STK Push Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to process payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function handleCallback(Request $request)
    {
        // Log the callback for debugging
        Log::info('M-Pesa Callback Received:', $request->all());

        try {
            DB::beginTransaction();

            $callbackData = $request->json()->all();
            
            if (isset($callbackData['Body']['stkCallback'])) {
                $resultCode = $callbackData['Body']['stkCallback']['ResultCode'];
                $resultDesc = $callbackData['Body']['stkCallback']['ResultDesc'];
                $merchantRequestID = $callbackData['Body']['stkCallback']['MerchantRequestID'];
                $checkoutRequestID = $callbackData['Body']['stkCallback']['CheckoutRequestID'];

                if ($resultCode == 0) {
                    // Payment successful - extract payment details
                    $callbackMetadata = collect($callbackData['Body']['stkCallback']['CallbackMetadata']['Item']);
                    
                    $amount = $callbackMetadata->firstWhere('Name', 'Amount')['Value'];
                    $mpesaReceiptNumber = $callbackMetadata->firstWhere('Name', 'MpesaReceiptNumber')['Value'];
                    $transactionDate = $callbackMetadata->firstWhere('Name', 'TransactionDate')['Value'];
                    $phoneNumber = $callbackMetadata->firstWhere('Name', 'PhoneNumber')['Value'];
                    
                    // Get the account reference (MMID) from the callback
                    $accountReference = $callbackData['Body']['stkCallback']['CallbackMetadata']['Item'][5]['Value'] ?? null;

                    // Create payment record
                    $payment = Payment::create([
                        'transaction_id' => $mpesaReceiptNumber,
                        'amount' => $amount,
                        'phone_number' => $phoneNumber,
                        'member_mmid' => $accountReference,
                        'transaction_date' => Carbon::createFromFormat('YmdHis', $transactionDate),
                        'status' => 'completed',
                        'payment_method' => 'mpesa',
                        'merchant_request_id' => $merchantRequestID,
                        'checkout_request_id' => $checkoutRequestID
                    ]);

                    // Generate ticket
                    $ticket = Ticket::create([
                        'ticket_number' => 'TKT-' . strtoupper(uniqid()),
                        'member_mmid' => $accountReference,
                        'payment_id' => $payment->id,
                        'status' => 'active',
                        'amount' => $amount,
                        'phone_number' => $phoneNumber,
                        'purchase_date' => Carbon::now(),
                        'expiry_date' => Carbon::now()->addDays(30), // Adjust expiry as needed
                    ]);

                    // Send ticket confirmation SMS
                    $this->sendTicketConfirmation($ticket, $phoneNumber);

                    DB::commit();

                    Log::info('Payment processed and ticket generated successfully', [
                        'ticket_number' => $ticket->ticket_number,
                        'transaction_id' => $mpesaReceiptNumber
                    ]);

                    return response()->json([
                        'ResultCode' => 0,
                        'ResultDesc' => 'Success'
                    ]);
                } else {
                    // Payment failed
                    Log::error('Payment failed', [
                        'result_code' => $resultCode,
                        'result_desc' => $resultDesc
                    ]);
                }
            }

            DB::rollBack();
            Log::error('Payment failed or invalid callback data', $callbackData);

            return response()->json([
                'ResultCode' => 1,
                'ResultDesc' => 'Failed'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error processing M-Pesa callback: ' . $e->getMessage());

            return response()->json([
                'ResultCode' => 1,
                'ResultDesc' => 'Failed'
            ]);
        }
    }

    private function sendTicketConfirmation($ticket, $phoneNumber)
    {
        try {
            // Implement your SMS sending logic here
            // Example using a hypothetical SMS service:
            
            $message = "Thank you for your purchase! Your ticket number is {$ticket->ticket_number}. "
                    . "Valid until " . $ticket->expiry_date->format('d/m/Y');

            // Send SMS
            // SMS::send($phoneNumber, $message);

            Log::info('Ticket confirmation SMS sent', [
                'phone' => $phoneNumber,
                'ticket_number' => $ticket->ticket_number
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send ticket confirmation SMS: ' . $e->getMessage());
        }
    }

    public function queryTransactionStatus($checkoutRequestID)
    {
        try {
            $accessToken = $this->getAccessToken();
            
            $url = $this->env === 'sandbox'
                ? 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'
                : 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query';

            $timestamp = Carbon::now()->format('YmdHis');
            $password = base64_encode($this->shortcode . $this->passkey . $timestamp);

            $response = Http::withToken($accessToken)
                ->post($url, [
                    'BusinessShortCode' => $this->shortcode,
                    'Password' => $password,
                    'Timestamp' => $timestamp,
                    'CheckoutRequestID' => $checkoutRequestID
                ]);

            return response()->json($response->json());

        } catch (\Exception $e) {
            Log::error('Transaction status query error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to query transaction status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}