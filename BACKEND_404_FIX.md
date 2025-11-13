# Backend 404 Error - Fixed

## Problem
Backend API endpoints were returning 404 errors because API routes were not registered in Laravel 11's bootstrap configuration.

## Root Cause
In `bootstrap/app.php`, the `withRouting()` method was missing the `api` parameter, so API routes from `routes/api.php` were never loaded.

## Solution
Added API routes to `bootstrap/app.php`:

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',  // ✅ ADDED THIS
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
```

## Next Steps

### 1. Commit and Push Changes
```bash
git add bootstrap/app.php config/cors.php
git commit -m "Fix: Register API routes and add Vercel to CORS"
git push origin main
```

### 2. Deploy to Render
- Render will automatically detect the push and redeploy
- Or manually trigger deployment from Render dashboard

### 3. Wait for Deployment
- First request may take 30-60 seconds (service waking up)
- Check Render logs to verify deployment success

### 4. Test Backend
After deployment, test these endpoints:

```bash
# Health check
curl.exe https://uet-jkuat.onrender.com/api/health

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "...",
#   "services": {...}
# }
```

### 5. Test from Frontend
Visit: `https://uet-jkuat.vercel.app/`
- Open browser DevTools (F12)
- Check Console - should see no 404 errors
- API calls should now work

## Available API Endpoints

After deployment, these endpoints should work:

- `GET /api/health` - Health check
- `GET /api/v1/projects` - List projects (requires API key)
- `GET /api/v1/news` - List news (requires API key)
- `POST /api/v1/payments/mpesa` - Initiate M-Pesa STK push
- `GET /api/v1/payments/mpesa/status/{checkoutRequestId}` - Check payment status

## Verification

### Test Health Endpoint
```bash
curl.exe https://uet-jkuat.onrender.com/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-13T19:35:00.000000Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "queue": "active"
  }
}
```

### Test with CORS
```bash
curl.exe -H "Origin: https://uet-jkuat.vercel.app" \
         https://uet-jkuat.onrender.com/api/health \
         -v
```

**Look for:**
```
Access-Control-Allow-Origin: https://uet-jkuat.vercel.app
```

## Troubleshooting

### Still Getting 404?
1. **Check Render Logs**
   - Go to Render Dashboard → Backend Service → Logs
   - Look for deployment errors
   - Verify service is running

2. **Verify Routes are Loaded**
   - In Render Shell, run: `php artisan route:list | grep api`
   - Should see all API routes listed

3. **Clear Cache**
   ```bash
   php artisan config:clear
   php artisan route:clear
   php artisan cache:clear
   ```

4. **Check Service Status**
   - Verify backend service is "Live" in Render dashboard
   - Check if service is sleeping (first request may be slow)

### CORS Still Not Working?
1. **Verify CORS Config is Deployed**
   - Check `config/cors.php` includes Vercel domain
   - Clear config cache: `php artisan config:clear`

2. **Check CORS Middleware**
   - Verify `HandleCors` is in middleware stack
   - Check `app/Http/Kernel.php`

## Files Changed
- ✅ `bootstrap/app.php` - Added API routes registration
- ✅ `config/cors.php` - Added Vercel domain to allowed origins

## After Deployment
Once deployed, your frontend at `https://uet-jkuat.vercel.app/` should be able to:
- ✅ Fetch projects
- ✅ Fetch news
- ✅ Initiate M-Pesa STK push
- ✅ Check payment status
- ✅ All API operations

