<?php
// app/Http/Middleware/ValidateTransactionRequest.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ValidateTransactionRequest
{
    public function handle(Request $request, Closure $next)
    {
        // Validate request signature for webhooks
        if ($request->isMethod('post') && $request->is('api/mpesa/*')) {
            if (!$this->validateSignature($request)) {
                Log::error('Invalid webhook signature', [
                    'ip' => $request->ip(),
                    'path' => $request->path()
                ]);
                return response()->json(['error' => 'Invalid signature'], 403);
            }
        }

        // Sanitize input data
        $this->sanitizeInput($request);

        return $next($request);
    }

    protected function validateSignature(Request $request): bool
    {
        $signature = $request->header('X-Webhook-Signature');
        $payload = $request->getContent();
        $secret = config('mpesa.webhook_secret');

        if (!$signature || !$secret) {
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        
        return hash_equals($expectedSignature, $signature);
    }

    protected function sanitizeInput(Request $request): void
    {
        $input = $request->all();
        
        array_walk_recursive($input, function (&$value) {
            if (is_string($value)) {
                $value = strip_tags($value);
                $value = preg_replace('/[^\w\s@.-]/', '', $value);
            }
        });

        $request->replace($input);
    }
}