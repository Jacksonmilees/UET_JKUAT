<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Sanitize implements ValidationRule
{
/**
 * Run the validation rule.
 *
 * @param  string  $attribute
 * @param  mixed  $value
 * @param  \Closure  $fail
 */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
    if ($value !== Str::sanitize($value)) {
        $fail('Invalid input detected.');
    }
    }
}
