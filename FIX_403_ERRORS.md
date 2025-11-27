# Fix 403 Forbidden Errors on Transactions/Withdrawals Endpoints

## Problem
The `/api/v1/transactions` and `/api/v1/withdrawals` endpoints are returning **403 Forbidden** because they're protected by `ApiKeyMiddleware` which requires an `X-API-Key` header that the frontend doesn't have.

## Root Cause
In `routes/api.php` lines 118-164, all `/api/v1/*` routes are wrapped in:
```php
Route::middleware(ApiKeyMiddleware::class)
```

This middleware checks for `config('services.api.key')` which is not set on Heroku.

## Solutions

### Option 1: Set API_KEY on Heroku (Quick Fix)
```bash
heroku config:set API_KEY=your-secret-key-here -a uetjkuat
```

Then update frontend to include the key in requests:
```javascript
headers: {
  'X-API-Key': 'your-secret-key-here'
}
```

### Option 2: Remove API Key Requirement (Recommended)
Make transactions/withdrawals publicly accessible or use token-based auth instead.

#### Step 1: Move transactions/withdrawals out of API key middleware

Edit `routes/api.php`:
```php
// Public v1 routes (no API key required)
Route::prefix('v1')->group(function () {
    Route::get('transactions', [TransactionController::class, 'index']);
    Route::get('transactions/{id}', [TransactionController::class, 'show']);
    Route::get('withdrawals', [WithdrawalController::class, 'getWithdrawals']);
    Route::get('withdrawals/{id}', [WithdrawalController::class, 'getWithdrawal']);
});

// Protected routes (require API key) - keep other routes here
Route::middleware(ApiKeyMiddleware::class)
    ->prefix('v1')
    ->group(function () {
        // Keep POST/PUT/DELETE routes that modify data
        Route::post('/withdrawals/initiate', [WithdrawalController::class, 'initiateWithdrawal']);
        // ... other protected routes
    });
```

### Option 3: Use Token-Based Auth (Best Practice)
Replace API key with user authentication tokens (already implemented for `/api/auth/*`).

## Recommended Action
Use **Option 2** to quickly fix the 403 errors while maintaining security for write operations.
