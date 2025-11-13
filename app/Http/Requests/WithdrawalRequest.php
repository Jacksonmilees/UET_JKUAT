<?php
// app/Http/Requests/WithdrawalRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WithdrawalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => 'required|exists:accounts,id',
            'amount' => 'required|numeric|gt:0',
            'phone_number' => 'required|string|regex:/^254[17][0-9]{8}$/',
            'withdrawal_reason' => 'required|string|in:SalaryPayment,BusinessPayment,PromotionPayment',
            'remarks' => 'nullable|string|max:255'
        ];
    }
}