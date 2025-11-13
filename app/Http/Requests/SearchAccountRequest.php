<?php
// app/Http/Requests/SearchAccountRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SearchAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'query' => 'required|string|min:2'
        ];
    }
}