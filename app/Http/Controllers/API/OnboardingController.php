<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OnboardingController extends Controller
{
    private const MANDATORY_AMOUNT = 100; // KES 100

    /**
    * Initiate mandatory contribution STK push for the authenticated user.
    */
    public function initiate(Request $request)
    {
        $user = $this->getUserFromBearer($request);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'phone_number' => 'required|regex:/^(254|\+254|0)[0-9]{9}$/'
        ]);

        $phone = $this->formatPhone($request->input('phone_number'));

        // Ensure mandatory account exists (per-user reference)
        [$account, $accountReference] = $this->ensureMandatoryAccount($user);

        // Create pending transaction
        $reference = 'MAND-' . $user->id . '-' . Str::upper(Str::random(6));
        $transaction = Transaction::create([
            'account_id' => $account->id,
            'transaction_id' => $reference,
            'amount' => static::MANDATORY_AMOUNT,
            'type' => 'credit',
            'payment_method' => 'mpesa',
            'status' => 'pending',
            'reference' => $reference,
            'phone_number' => $phone,
            'payer_name' => $user->name,
            'metadata' => [
                'purpose' => 'mandatory_contribution',
                'user_id' => $user->id,
                'account_reference' => $accountReference,
            ],
        ]);

        // Initiate STK push via existing MpesaController
        $mpesaController = app(\App\Http\Controllers\MpesaController::class);
        $stkRequest = new Request([
            'phone_number' => $phone,
            'amount' => static::MANDATORY_AMOUNT,
            'account_number' => $accountReference,
        ]);

        $response = $mpesaController->initiateSTKPush($stkRequest);
        $data = $response->getData(true);

        if (!($data['success'] ?? false) || !isset($data['data']['CheckoutRequestID'])) {
            Log::warning('Mandatory STK initiation failed', ['user_id' => $user->id, 'response' => $data]);
            return response()->json([
                'success' => false,
                'message' => $data['message'] ?? 'Failed to initiate payment'
            ], 400);
        }

        // Store checkout request id on metadata
        $transaction->metadata = array_merge($transaction->metadata ?? [], [
            'checkout_request_id' => $data['data']['CheckoutRequestID'],
            'merchant_request_id' => $data['data']['MerchantRequestID'] ?? null,
        ]);
        $transaction->save();

        return response()->json([
            'success' => true,
            'message' => 'STK push initiated. Approve on your phone.',
            'data' => [
                'checkoutRequestId' => $data['data']['CheckoutRequestID'],
                'merchantRequestId' => $data['data']['MerchantRequestID'] ?? null,
                'reference' => $reference,
                'amount' => static::MANDATORY_AMOUNT,
            ]
        ]);
    }

    /**
    * Get mandatory payment status for the authenticated user.
    */
    public function status(Request $request)
    {
        $user = $this->getUserFromBearer($request);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $latest = Transaction::where('metadata->purpose', 'mandatory_contribution')
            ->where('metadata->user_id', $user->id)
            ->orderByDesc('created_at')
            ->first();

        $paid = $latest && $latest->status === 'completed';

        return response()->json([
            'success' => true,
            'data' => [
                'required' => true,
                'amount' => static::MANDATORY_AMOUNT,
                'paid' => $paid,
                'lastPaymentDate' => $paid ? $latest->processed_at?->toDateTimeString() ?? $latest->updated_at?->toDateTimeString() : null,
                'reference' => $latest?->reference,
                'status' => $latest?->status,
            ]
        ]);
    }

    private function ensureMandatoryAccount(User $user): array
    {
        $accountReference = 'MAND-' . $user->id;

        $account = Account::where('reference', $accountReference)->first();
        if ($account) {
            return [$account, $accountReference];
        }

        // Ensure account type/subtype
        $accountType = DB::table('account_types')->where('code', 'GEN')->first();
        $accountTypeId = $accountType ? $accountType->id : DB::table('account_types')->insertGetId([
            'name' => 'General', 'code' => 'GEN', 'description' => 'General Account', 'created_at' => now(), 'updated_at' => now()
        ]);

        $accountSubtype = DB::table('account_subtypes')->where('code', 'MAND')->first();
        $accountSubtypeId = $accountSubtype ? $accountSubtype->id : DB::table('account_subtypes')->insertGetId([
            'account_type_id' => $accountTypeId,
            'name' => 'Mandatory',
            'code' => 'MAND',
            'description' => 'Mandatory Contribution Account',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $account = Account::create([
            'account_type_id' => $accountTypeId,
            'account_subtype_id' => $accountSubtypeId,
            'name' => $user->name . ' Mandatory',
            'reference' => $accountReference,
            'type' => 'mandatory',
            'balance' => 0,
            'status' => 'active',
            'metadata' => [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'phone_number' => $user->phone_number,
            ],
        ]);

        return [$account, $accountReference];
    }

    private function formatPhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);
        if (str_starts_with($digits, '0')) {
            return '254' . substr($digits, 1);
        }
        if (str_starts_with($digits, '254')) {
            return $digits;
        }
        if (str_starts_with($digits, '7')) {
            return '254' . $digits;
        }
        return $digits;
    }
}
