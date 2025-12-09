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
            $data = $response->json();
            if (isset($data['access_token'])) {
                return $data['access_token'];
            }
            Log::error('M-Pesa token response missing access_token', [
                'response' => $data,
                'env' => $this->env,
                'url' => $url
            ]);
            throw new \Exception('Access token not found in M-Pesa response');
        }

        Log::error('M-Pesa token generation failed', [
            'status' => $response->status(),
            'body' => $response->body(),
            'env' => $this->env,
            'consumer_key' => substr($this->consumerKey, 0, 10) . '...', // Log partial key for debugging
        ]);
        
        throw new \Exception('Failed to get M-Pesa access token. Status: ' . $response->status() . '. Check your M-Pesa credentials.');
    }

    public function initiateSTKPush(Request $request)
    {
        // Log incoming request for debugging
        Log::info('M-Pesa STK Push Request', [
            'phone_number' => $request->phone_number ?? 'not provided',
            'amount' => $request->amount ?? 'not provided',
            'account_number' => $request->account_number ?? 'not provided',
        ]);

        $request->validate([
            'phone_number' => ['required', 'regex:/^254[0-9]{9}$/'],
            'amount' => 'required|numeric|min:1',
            'account_number' => 'required|string',
        ], [
            'phone_number.required' => 'Phone number is required',
            'phone_number.regex' => 'Phone number must be in format 254XXXXXXXXX (12 digits starting with 254)',
            'amount.required' => 'Amount is required',
            'amount.numeric' => 'Amount must be a number',
            'amount.min' => 'Amount must be at least 1 KES',
            'account_number.required' => 'Account number is required',
        ]);

        try {
            $accessToken = $this->getAccessToken();
            
            $timestamp = Carbon::now()->format('YmdHis');
            $password = base64_encode($this->shortcode . $this->passkey . $timestamp);
            
            $url = $this->env === 'sandbox'
                ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
                : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

            // Generate callback URL - use config if available, otherwise use route helper
            $callbackUrl = config('services.mpesa.callback_url') 
                ?: route('mpesa.callback');
            
            // Ensure it's a full URL (not relative)
            if (!filter_var($callbackUrl, FILTER_VALIDATE_URL)) {
                $callbackUrl = config('app.url') . '/api/v1/payments/mpesa/callback';
            }
            
            Log::info('M-Pesa STK Push Request', [
                'callback_url' => $callbackUrl,
                'shortcode' => $this->shortcode,
                'amount' => $request->amount,
                'phone' => $request->phone_number,
            ]);

            // Determine account reference to display on the customer's side and in statements
            $accountReference = $request->account_number ?: (config('mpesa.default_account_reference') ?: 'UET-JKUAT');

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
                    'CallBackURL' => $callbackUrl,
                    'AccountReference' => $accountReference,
                    'TransactionDesc' => 'UET-JKUAT Payment'
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

            if (!$response->successful()) {
                Log::error('STK status query failed', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);
                return response()->json([
                    'checkoutRequestId' => $checkoutRequestID,
                    'status' => 'failed',
                    'errorMessage' => 'Failed to query status',
                ], 200);
            }

            $data = $response->json();
            // Map Safaricom response to frontend expected shape
            // Default assumptions: pending unless explicit success/failure codes
            $resultCode = $data['ResultCode'] ?? null;
            $resultDesc = $data['ResultDesc'] ?? null;

            $status = 'pending';
            if ($resultCode === 0 || $resultCode === '0') {
                $status = 'completed';
            } elseif (in_array((string)$resultCode, ['1032', '1', '2001', '1037', '1036'], true)) {
                // 1032: Request cancelled by user; other non-zero codes considered failure
                $status = ($resultCode == '1032') ? 'cancelled' : 'failed';
            }

            return response()->json([
                'checkoutRequestId' => $data['CheckoutRequestID'] ?? $checkoutRequestID,
                'status' => $status,
                // Amount and phone not supplied by STK query - will be populated after callback
                'amount' => null,
                'phoneNumber' => null,
                'mpesaReceiptNumber' => null,
                'errorMessage' => $status === 'failed' || $status === 'cancelled' ? ($resultDesc ?? 'Payment not completed') : null,
            ]);

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