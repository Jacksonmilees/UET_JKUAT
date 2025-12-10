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
            'long_description' => 'nullable|string',
            'target_amount' => 'nullable|numeric|min:0',
            'fundingGoal' => 'nullable|numeric|min:0', // alias for target_amount
            'current_amount' => 'sometimes|numeric|min:0',
            'account_number' => 'sometimes|string', // Optional - auto-generated if not provided
            'account_reference' => 'sometimes|string', // Optional - auto-generated if not provided
            'accountNumber' => 'sometimes|string', // alias for account_reference
            'end_date' => 'nullable|date',
            'image_url' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'featuredImage' => 'nullable|string', // alias for featured_image
            'status' => 'sometimes|in:active,completed,paused',
            'user_id' => 'nullable|exists:users,id',
            'category_id' => 'nullable|exists:categories,id',
            'category' => 'nullable|string', // Will be resolved to category_id
            'slug' => 'nullable|string|unique:projects,slug',
            'visibility' => 'nullable|in:public,private,members_only',
            'allow_donations' => 'nullable|boolean',
            'organizer' => 'nullable|string|max:255',
            'impact_statement' => 'nullable|string',
            'impactStatement' => 'nullable|string', // alias for impact_statement
            'duration_days' => 'nullable|integer|min:1',
            'durationDays' => 'nullable|integer|min:1', // alias for duration_days
            'metadata' => 'nullable|array',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        $merged = [];

        // If name is provided but title is not, use name as title
        if ($this->has('name') && !$this->has('title')) {
            $merged['title'] = $this->name;
        }
        // If title is provided but name is not, use title as name
        if ($this->has('title') && !$this->has('name')) {
            $merged['name'] = $this->title;
        }

        // Handle camelCase aliases
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