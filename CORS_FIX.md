# CORS Configuration Fix

## Problem
Frontend running on `http://localhost:5173` was blocked by CORS when trying to access the backend API at `https://uet-jkuat.onrender.com/api`.

## Solution
Updated `config/cors.php` to allow:
- ✅ `http://localhost:5173` (Vite dev server)
- ✅ `http://localhost:8000` (Laravel dev server)
- ✅ All Render subdomains (`*.onrender.com`)
- ✅ All localhost ports (for flexibility)

## Changes Made

### 1. Added Localhost Origins
```php
'allowed_origins' => [
    // ... existing origins ...
    'http://localhost:5173',  // Vite dev server
    'http://localhost:8000',  // Laravel dev server
    'https://uet-jkuat.onrender.com',  // Backend domain
],
```

### 2. Added Origin Patterns
```php
'allowed_origins_patterns' => [
    '/^https:\/\/([a-z0-9-]+\.)?onrender\.com$/', // All Render subdomains
    '/^http:\/\/localhost:\d+$/', // Any localhost port
],
```

## Next Steps

### 1. Deploy to Render
The CORS changes need to be deployed to Render for them to take effect:

```bash
git add config/cors.php
git commit -m "Fix CORS: Allow localhost:5173 and Render domains"
git push origin main
```

Render will automatically redeploy your backend service.

### 2. Clear Config Cache (if needed)
If you're still seeing CORS errors after deployment, clear the config cache on Render:

**Option A: Via Render Dashboard**
1. Go to your backend service on Render
2. Open the Shell/Console
3. Run: `php artisan config:clear`

**Option B: Add to Deploy Script**
Add this to your `.render-build.sh` or deployment script:
```bash
php artisan config:clear
php artisan cache:clear
```

### 3. Test Locally
After deployment, test from your local frontend:
1. Start your frontend: `cd uetjkuat-funding-platform && npm run dev`
2. Open `http://localhost:5173`
3. Check browser console - CORS errors should be gone

## Verification

### Test CORS Headers
You can verify CORS is working by checking the response headers:

```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://uet-jkuat.onrender.com/api/v1/projects \
     -v
```

Look for:
- `Access-Control-Allow-Origin: http://localhost:5173`
- `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: ...`

## Troubleshooting

### Still Getting CORS Errors?

1. **Check if config is cached:**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

2. **Verify CORS middleware is registered:**
   Check `app/Http/Kernel.php` - should have `HandleCors` in middleware

3. **Check browser console:**
   - Look for the exact error message
   - Check Network tab for preflight (OPTIONS) request
   - Verify the `Origin` header matches an allowed origin

4. **Test with curl:**
   ```bash
   curl -X GET https://uet-jkuat.onrender.com/api/v1/projects \
        -H "Origin: http://localhost:5173" \
        -v
   ```

5. **Check Render logs:**
   - Go to Render dashboard → Your service → Logs
   - Look for any CORS-related errors

## Production Notes

For production, consider:
- Removing `http://localhost:*` origins (or restrict to specific ports)
- Using environment variables for allowed origins
- Implementing more restrictive CORS policies based on environment

Example using environment variables:
```php
'allowed_origins' => array_filter([
    env('FRONTEND_URL'),
    env('FRONTEND_URL_LOCAL', 'http://localhost:5173'),
    // ... other origins
]),
```

