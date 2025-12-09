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
            'name' => 'sometimes|string|max:255', // alias for title
            'description' => 'required|string',
            'target_amount' => 'required|numeric|min:0',
            'current_amount' => 'sometimes|numeric|min:0',
            'account_number' => 'sometimes|string', // Optional - auto-generated if not provided
            'account_reference' => 'sometimes|string', // Optional - auto-generated if not provided
            'end_date' => 'nullable|date',
            'image_url' => 'nullable|string',
            'status' => 'sometimes|in:active,completed,paused',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // If name is provided but title is not, use name as title
        if ($this->has('name') && !$this->has('title')) {
            $this->merge(['title' => $this->name]);
        }
        // If title is provided but name is not, use title as name
        if ($this->has('title') && !$this->has('name')) {
            $this->merge(['name' => $this->title]);
        }
    }
}