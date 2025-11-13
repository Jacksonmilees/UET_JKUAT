<?php
// app/Http/Requests/CreateAccountRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_type_id' => 'required|exists:account_types,id',
            'account_subtype_id' => 'nullable|exists:account_subtypes,id',
            'name' => 'required|string|max:255',
            'reference' => 'required|string|unique:accounts,reference',
            'parent_id' => 'nullable|exists:accounts,id',
            'metadata' => 'nullable|array'
        ];
    }
}