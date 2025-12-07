<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

abstract class Controller
{
    /**
     * Resolve the authenticated user from a simple Bearer token stored in remember_token.
     */
    protected function getUserFromBearer(Request $request): ?User
    {
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }

        $token = substr($authHeader, 7);
        return User::where('remember_token', $token)->first();
    }
}
