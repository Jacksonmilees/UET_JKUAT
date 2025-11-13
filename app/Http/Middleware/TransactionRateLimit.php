<?php
// app/Http/Middleware/TransactionRateLimit.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class TransactionRateLimit
{
    public function handle(Request $request, Closure $next, $maxAttempts = 10, $decayMinutes = 1)
    {
        $key = $this->resolveRequestSignature($request);
        $maxAttempts = (int) $maxAttempts;
        $decayMinutes = (int) $decayMinutes;

        if ($this->tooManyAttempts($key, $maxAttempts)) {
            Log::warning('Rate limit exceeded', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'endpoint' => $request->path()
            ]);
            
            return response()->json([
                'error' => 'Too many requests. Please try again later.',
                'retry_after' => $this->availableIn($key)
            ], 429);
        }

        $this->incrementAttempts($key, $decayMinutes);

        return $next($request);
    }

    protected function resolveRequestSignature(Request $request): string
    {
        return sha1(
            $request->ip() . '|' . 
            $request->path() . '|' .
            ($request->input('phone_number') ?? 'anonymous')
        );
    }

    protected function tooManyAttempts(string $key, int $maxAttempts): bool
    {
        return Cache::get($key, 0) >= $maxAttempts;
    }

    protected function incrementAttempts(string $key, int $decayMinutes): void
    {
        Cache::increment($key, 1);
        Cache::expire($key, $decayMinutes * 60);
    }

    protected function availableIn(string $key): int
    {
        return Cache::store('redis')->ttl($key);
    }
}