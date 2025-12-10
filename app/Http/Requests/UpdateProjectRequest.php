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
            'title' => 'sometimes|string|max:255',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'long_description' => 'nullable|string',
            'target_amount' => 'sometimes|numeric|min:0',
            'fundingGoal' => 'nullable|numeric|min:0',
            'current_amount' => 'sometimes|numeric|min:0',
            'account_number' => 'sometimes|string',
            'account_reference' => 'sometimes|string',
            'accountNumber' => 'sometimes|string',
            'end_date' => 'nullable|date',
            'image_url' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'featuredImage' => 'nullable|string',
            'status' => 'sometimes|in:active,completed,cancelled,paused',
            'user_id' => 'nullable|exists:users,id',
            'category_id' => 'nullable|exists:categories,id',
            'category' => 'nullable|string',
            'slug' => 'nullable|string|unique:projects,slug,' . ($this->project ? $this->project->id : ''),
            'visibility' => 'nullable|in:public,private,members_only',
            'allow_donations' => 'nullable|boolean',
            'organizer' => 'nullable|string|max:255',
            'impact_statement' => 'nullable|string',
            'impactStatement' => 'nullable|string',
            'duration_days' => 'nullable|integer|min:1',
            'durationDays' => 'nullable|integer|min:1',
            'metadata' => 'nullable|array',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        $merged = [];

        // Handle aliases similar to StoreProjectRequest
        if ($this->has('name') && !$this->has('title')) {
            $merged['title'] = $this->name;
        }
        if ($this->has('title') && !$this->has('name')) {
            $merged['name'] = $this->title;
        }
        if ($this->has('fundingGoal') && !$this->has('target_amount')) {
            $merged['target_amount'] = $this->fundingGoal;
        }
        if ($this->has('featuredImage') && !$this->has('featured_image')) {
            $merged['featured_image'] = $this->featuredImage;
        }
        if ($this->has('impactStatement') && !$this->has('impact_statement')) {
            $merged['impact_statement'] = $this->impactStatement;
        }
        if ($this->has('durationDays') && !$this->has('duration_days')) {
            $merged['duration_days'] = $this->durationDays;
        }
        if ($this->has('accountNumber') && !$this->has('account_reference')) {
            $merged['account_reference'] = $this->accountNumber;
        }
        if ($this->has('longDescription') && !$this->has('long_description')) {
            $merged['long_description'] = $this->longDescription;
        }

        // Handle category string to category_id conversion
        if ($this->has('category') && !$this->has('category_id')) {
            $category = \App\Models\Category::where('name', $this->category)->first();
            if ($category) {
                $merged['category_id'] = $category->id;
            }
        }

        if (!empty($merged)) {
            $this->merge($merged);
        }
    }
}