# Heroku CORS Fix - Step by Step Guide

## Problem
CORS errors when frontend on Vercel (`https://uet-jkuat.vercel.app`) tries to access backend on Heroku (`https://uetjkuat-54286e10a43b.herokuapp.com`).

Error: `No 'Access-Control-Allow-Origin' header is present on the requested resource`

## Root Cause
The CORS configuration is correct, but Laravel's config cache on Heroku needs to be cleared after deployment.

## Solution Steps

### Step 1: Deploy Updated CORS Config
The CORS config has been updated to include:
- ✅ `https://uet-jkuat.vercel.app` in allowed origins
- ✅ Pattern for all Vercel subdomains: `/^https:\/\/([a-z0-9-]+\.)?vercel\.app$/`
- ✅ Pattern for all Heroku subdomains: `/^https:\/\/([a-z0-9-]+\.)?herokuapp\.com$/`

**Commit and push:**
```bash
git add config/cors.php routes/api.php
git commit -m "Fix CORS: Add Vercel and Heroku domains, add CORS test route"
git push heroku main
```

### Step 2: Clear Config Cache on Heroku

After deployment, you **MUST** clear the config cache on Heroku:

**Option A: Using Heroku CLI (Recommended)**
```bash
heroku run php artisan config:clear --app uetjkuat-54286e10a43b
heroku run php artisan cache:clear --app uetjkuat-54286e10a43b
heroku run php artisan route:clear --app uetjkuat-54286e10a43b
```

**Option B: Using Heroku Dashboard**
1. Go to [Heroku Dashboard](https://dashboard.heroku.com)
2. Select your app: `uetjkuat-54286e10a43b`
3. Click **More** → **Run console**
4. Run these commands one by one:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   ```

### Step 3: Verify CORS is Working

**Test 1: Check CORS Headers**
```bash
curl -H "Origin: https://uet-jkuat.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://uetjkuat-54286e10a43b.herokuapp.com/api/cors-test \
     -v
```

You should see these headers in the response:
```
Access-Control-Allow-Origin: https://uet-jkuat.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization, ...
```

**Test 2: Test from Browser**
Visit: `https://uetjkuat-54286e10a43b.herokuapp.com/api/cors-test`

Open browser console and run:
```javascript
fetch('https://uetjkuat-54286e10a43b.herokuapp.com/api/cors-test')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### Step 4: Update Frontend API URL (if needed)

Make sure your frontend on Vercel is configured to use the Heroku backend:

**In Vercel Dashboard → Environment Variables:**
```
VITE_API_BASE_URL=https://uetjkuat-54286e10a43b.herokuapp.com/api
```

Then rebuild your frontend on Vercel.

## Why This Happens

Laravel caches configuration files for performance. When you update `config/cors.php`, the changes won't take effect until you clear the cache. This is especially important on Heroku where the config might be cached from a previous deployment.

## Additional Troubleshooting

### If CORS Still Doesn't Work:

1. **Check Middleware Order**
   - CORS middleware should be in the `api` middleware group (it is)
   - It should also be in global middleware (it is)

2. **Check for Conflicting Middleware**
   - Make sure no other middleware is interfering
   - Check `app/Http/Kernel.php` - CORS should be first in the middleware stack

3. **Test Preflight Request**
   - Browsers send OPTIONS requests before actual requests
   - Make sure OPTIONS requests are handled correctly
   - The CORS middleware should handle this automatically

4. **Check Heroku Logs**
   ```bash
   heroku logs --tail --app uetjkuat-54286e10a43b
   ```
   Look for any errors related to CORS or middleware

5. **Verify Config is Loaded**
   Visit: `https://uetjkuat-54286e10a43b.herokuapp.com/api/debug-middleware`
   This will show you what middleware is registered

## Quick Fix Script

Create a file `clear-cache.sh` in your project root:

```bash
#!/bin/bash
echo "Clearing Laravel caches on Heroku..."
heroku run php artisan config:clear --app uetjkuat-54286e10a43b
heroku run php artisan cache:clear --app uetjkuat-54286e10a43b
heroku run php artisan route:clear --app uetjkuat-54286e10a43b
heroku run php artisan view:clear --app uetjkuat-54286e10a43b
echo "Cache cleared! CORS should now work."
```

Make it executable and run:
```bash
chmod +x clear-cache.sh
./clear-cache.sh
```

## Expected Result

After clearing the cache:
- ✅ CORS preflight requests (OPTIONS) should return 200 with proper headers
- ✅ Actual API requests should include `Access-Control-Allow-Origin` header
- ✅ Frontend on Vercel should be able to make API calls without CORS errors
- ✅ Browser console should show no CORS errors

## Summary

**The fix is simple:**
1. ✅ CORS config is already correct
2. ⚠️ **You MUST clear config cache on Heroku after deployment**
3. ✅ Test with the `/api/cors-test` route
4. ✅ Verify in browser console

The most common issue is forgetting to clear the cache after updating the CORS configuration!

