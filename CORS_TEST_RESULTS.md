# CORS Test Results

## Test Performed
Tested CORS configuration from terminal using curl with `Origin: http://localhost:5173`

## Results
- ❌ **Backend returning 404** - Service may be sleeping or needs redeployment
- ❌ **No CORS headers in response** - CORS changes not yet deployed

## Current Status

### Backend Service
- URL: `https://uet-jkuat.onrender.com`
- Status: Returning 404 for all endpoints
- Possible causes:
  1. Service is sleeping (Render free tier)
  2. CORS config changes not deployed yet
  3. Routes not properly configured

## Next Steps

### 1. Commit and Push CORS Changes
```bash
git add config/cors.php
git commit -m "Fix CORS: Allow localhost:5173 and Render domains"
git push origin main
```

### 2. Trigger Render Deployment
- Render will automatically detect the push and redeploy
- Or manually trigger deployment from Render dashboard

### 3. Wait for Service to Wake Up
- Render free tier services sleep after 15 minutes of inactivity
- First request may take 30-60 seconds to wake up the service

### 4. Clear Config Cache (After Deployment)
Once deployed, clear the config cache:
- Go to Render Dashboard → Your backend service → Shell
- Run: `php artisan config:clear`
- Or add to deployment script

### 5. Test Again
After deployment, test with:
```bash
curl.exe -H "Origin: http://localhost:5173" https://uet-jkuat.onrender.com/api/health -v
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key, ...
```

## Verification Commands

### Test OPTIONS (Preflight)
```bash
curl.exe -H "Origin: http://localhost:5173" ^
         -H "Access-Control-Request-Method: GET" ^
         -H "Access-Control-Request-Headers: Content-Type" ^
         -X OPTIONS ^
         https://uet-jkuat.onrender.com/api/v1/projects ^
         -v
```

### Test GET Request
```bash
curl.exe -H "Origin: http://localhost:5173" ^
         https://uet-jkuat.onrender.com/api/health ^
         -v
```

### Test with Browser
1. Open browser DevTools (F12)
2. Go to Network tab
3. Visit: `http://localhost:5173`
4. Check for CORS errors in Console
5. Check Response Headers in Network tab

## Troubleshooting

### If Still Getting 404:
1. Check Render logs for deployment errors
2. Verify routes are registered: `php artisan route:list`
3. Check if service is awake (first request may be slow)

### If CORS Headers Missing:
1. Verify `config/cors.php` changes are deployed
2. Clear config cache: `php artisan config:clear`
3. Check `app/Http/Kernel.php` has `HandleCors` middleware
4. Restart the service on Render

### If CORS Still Blocking:
1. Verify origin matches exactly (no trailing slash)
2. Check browser console for exact error
3. Verify CORS middleware is in `api` middleware group
4. Check for conflicting CORS middleware

## Notes
- CORS changes require deployment to take effect
- Render free tier services may sleep - first request will wake them
- Config cache should be cleared after CORS changes
- Test from actual browser for most accurate results



