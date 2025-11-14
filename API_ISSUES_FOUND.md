# API Issues Found from Logs

## ✅ What's Working

1. **CORS is Working!**
   - OPTIONS requests return 204 (successful preflight)
   - Frontend from Vercel can make requests
   - CORS headers are being sent correctly

2. **API is Accessible**
   - Health endpoint: ✅ 200 OK
   - Routes are being reached
   - Database connected

## ❌ Issues Found

### Issue 1: `/api/v1/news` Returns 404

**Error:** `GET /api/v1/news` → 404 Not Found

**Problem:** The route doesn't exist in `routes/api.php`

**Solution Options:**
1. **Add the route** if you have a NewsController
2. **Remove the call** from frontend if not needed
3. **Create the route** if news feature is planned

### Issue 2: `/api/v1/projects` Returns 401

**Error:** `GET /api/v1/projects` → 401 Unauthorized

**Problem:** The route requires API key authentication (`ApiKeyMiddleware`)

**Solution:**
- Frontend needs to send `X-API-Key` header with the API key
- Or make the route public (remove middleware)

### Issue 3: M-Pesa STK Push Returns 400 - "Invalid Access Token"

**Error:** `POST /api/v1/payments/mpesa` → 400 Bad Request
**Error Message:** `"Invalid Access Token"` (errorCode: 404.001.03)

**Problem:** M-Pesa access token generation is failing or credentials are invalid

**Possible Causes:**
1. **Invalid M-Pesa credentials** - Consumer key/secret might be wrong
2. **Sandbox credentials expired** - Sandbox credentials sometimes expire
3. **Token generation failing** - The `getAccessToken()` method might be failing silently
4. **Environment mismatch** - Using production credentials in sandbox or vice versa

**Debug Steps:**
1. Check if token generation is working
2. Verify M-Pesa credentials are correct
3. Check if sandbox credentials need to be refreshed
4. Add better error logging

## 🔧 Fixes Needed

### Fix 1: Add News Route (if needed)

If you have a NewsController, add to `routes/api.php`:

```php
Route::prefix('v1')->group(function () {
    // ... existing routes ...
    Route::get('/news', [NewsController::class, 'index']);
    Route::get('/news/{id}', [NewsController::class, 'show']);
});
```

### Fix 2: Make Projects Route Public (or add API key to frontend)

**Option A: Remove API key requirement**
```php
// In routes/api.php, move projects outside ApiKeyMiddleware
Route::prefix('v1')->group(function () {
    Route::apiResource('projects', ProjectController::class);
});
```

**Option B: Add API key to frontend**
In `uetjkuat-funding-platform/services/api.ts`, make sure API key is sent:
```typescript
headers: {
    'X-API-Key': API_KEY, // Should be set
}
```

### Fix 3: Fix M-Pesa Token Generation

**Add better error handling:**
```php
private function getAccessToken()
{
    $url = $this->env === 'sandbox' 
        ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
        : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
        ->get($url);

    if ($response->successful()) {
        $data = $response->json();
        if (isset($data['access_token'])) {
            return $data['access_token'];
        }
        Log::error('M-Pesa token response missing access_token', ['response' => $data]);
        throw new \Exception('Access token not found in response');
    }

    Log::error('M-Pesa token generation failed', [
        'status' => $response->status(),
        'body' => $response->body(),
        'env' => $this->env,
    ]);
    throw new \Exception('Failed to get access token: ' . $response->body());
}
```

**Verify M-Pesa Credentials:**
- Check if `MPESA_CONSUMER_KEY` and `MPESA_CONSUMER_SECRET` are correct
- Verify `MPESA_ENV` is set to `sandbox` (for testing)
- Sandbox credentials might need to be regenerated from Safaricom Developer Portal

## 📊 Summary

| Endpoint | Status | Issue | Fix |
|----------|--------|-------|-----|
| `/api/health` | ✅ 200 | None | - |
| `/api/cors-test` | ✅ 200 | None | - |
| `/api/v1/projects` | ❌ 401 | Needs API key | Add header or remove middleware |
| `/api/v1/news` | ❌ 404 | Route missing | Add route or remove frontend call |
| `/api/v1/payments/mpesa` | ❌ 400 | Invalid token | Fix M-Pesa credentials/token generation |

## 🎯 Priority Fixes

1. **High:** Fix M-Pesa token generation (STK push not working)
2. **Medium:** Add news route or remove frontend call
3. **Low:** Fix projects API key requirement


