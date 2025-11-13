<?php
// app/Http/Requests/ValidateTransferRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidateTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'source_reference' => 'required|string|exists:accounts,reference',
            'destination_reference' => 'required|string|exists:accounts,reference|different:source_reference',
            'amount' => 'required|numeric|gt:0'
        ];
    }
}
