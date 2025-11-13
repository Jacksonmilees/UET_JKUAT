<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'target_amount' => 'required|numeric|min:0',
            'account_number' => 'required|string|unique:projects',
            'end_date' => 'nullable|date|after:today',
            'image_url' => 'nullable|url'
        ];
    }
}