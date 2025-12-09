<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyMiddleware
{
    /**
     * Handle an incoming request.
     * Allows access if EITHER a valid API key OR a valid Bearer token is provided.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-API-Key');
        $bearerToken = $request->bearerToken();
        
        // Allow if valid API key is provided
        if ($apiKey && $apiKey === config('services.api.key')) {
            return $next($request);
        }
        
        // Allow if valid Bearer token is provided (authenticated user)
        if ($bearerToken) {
            // Validate the bearer token
            $user = \App\Models\User::where('api_token', hash('sha256', $bearerToken))->first();
            
            // Also check for simple token match (for development/testing)
            if (!$user) {
                $user = \App\Models\User::where('api_token', $bearerToken)->first();
            }
            
            if ($user) {
                // Set authenticated user for downstream middleware/controllers
                auth()->setUser($user);
                return $next($request);
            }
        }
        
        // No valid authentication
        if (!$apiKey && !$bearerToken) {
            return response()->json([
                'status' => 'error',
                'message' => 'Authentication required (API key or Bearer token)'
            ], 401);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Invalid API key or token'
        ], 403);
    }
}