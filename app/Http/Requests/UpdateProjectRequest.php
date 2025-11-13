<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'target_amount' => 'sometimes|required|numeric|min:0',
            'end_date' => 'nullable|date|after:today',
            'image_url' => 'nullable|url',
            'status' => 'sometimes|required|in:active,completed,cancelled'
        ];
    }
}