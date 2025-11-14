# 🔧 Fix for 404 Errors on Render Backend

## Problem
The backend is returning 404 for all API endpoints because:
1. **API routes weren't registered** in `bootstrap/app.php` (Laravel 11)
2. **Route cache** might be stale after the fix

## ✅ Fixes Applied

### 1. Fixed `bootstrap/app.php`
Added API routes registration:
```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',  // ← Added this
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```

### 2. Updated `RouteServiceProvider.php`
Removed duplicate route registration to prevent conflicts.

## 🚀 Deployment Steps

### Step 1: Push Changes to GitHub
```bash
git add .
git commit -m "Fix: Register API routes in bootstrap/app.php"
git push
```

### Step 2: Trigger Render Redeploy
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your `uet-jkuat-backend` service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Step 3: Wait for Build
- Build takes ~3-5 minutes
- Watch the logs for any errors

### Step 4: Test Endpoints
After deployment, test:
```bash
# Health check
curl https://uet-jkuat.onrender.com/up

# API health
curl https://uet-jkuat.onrender.com/api/health

# Projects endpoint (requires API_KEY header)
curl -H "X-API-Key: YOUR_API_KEY" https://uet-jkuat.onrender.com/api/v1/projects
```

## 🔍 If Still Getting 404

### Option 1: Clear Route Cache Manually
1. Go to Render Dashboard → Your service → **Shell** tab
2. Run:
```bash
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan route:cache
php artisan config:cache
```

### Option 2: Force Redeploy
1. Render Dashboard → Your service
2. **Settings** → Scroll to bottom
3. Click **"Clear build cache & deploy"**

### Option 3: Check Service Logs
1. Render Dashboard → Your service → **Logs** tab
2. Look for errors like:
   - Route not found
   - Class not found
   - Configuration errors

## 📋 Expected Routes After Fix

- ✅ `GET /up` - Health check
- ✅ `GET /api/health` - API health
- ✅ `GET /api/v1/projects` - List projects (requires API_KEY)
- ✅ `POST /api/v1/payments/mpesa` - Initiate M-Pesa payment
- ✅ `POST /api/v1/payments/mpesa/callback` - M-Pesa callback

## ⚠️ Important Notes

1. **First Request Delay**: On Render free tier, first request after sleep takes ~30 seconds
2. **API Key Required**: Most endpoints require `X-API-Key` header
3. **CORS**: Already configured for `https://uet-jkuat.vercel.app`

## 🎯 Next Steps After Fix

Once routes are working:
1. Test M-Pesa STK push with your phone: `0700088271`
2. Verify frontend can connect to backend
3. Test full donation flow

