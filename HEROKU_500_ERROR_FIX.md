# Heroku 500 Error - Diagnostic Guide

## ✅ Progress Made
- **Procfile is working** - Laravel is now being served
- **Routes are accessible** - No more 404 errors
- **Issue**: 500 Internal Server Error (configuration problem)

## Common Causes of 500 Errors on Heroku

### 1. Missing Environment Variables
Laravel needs environment variables configured in Heroku.

### 2. Database Connection Issues
Database credentials might be missing or incorrect.

### 3. Missing Dependencies
Composer packages might not be installed.

### 4. Configuration Cache Issues
Old cached config might be causing problems.

## Step-by-Step Fix

### Step 1: Check Heroku Logs
**This is the most important step** - it will show the actual error:

```bash
heroku logs --tail --app uetjkuat-54286e10a43b
```

Look for:
- PHP errors
- Database connection errors
- Missing environment variable errors
- Class not found errors

### Step 2: Verify Environment Variables

Check what environment variables are set in Heroku:

```bash
heroku config --app uetjkuat-54286e10a43b
```

**Required Variables:**
```bash
APP_NAME=Laravel
APP_ENV=production
APP_KEY=base64:...  # Must be set!
APP_DEBUG=false
APP_URL=https://uetjkuat-54286e10a43b.herokuapp.com

# Database
DB_CONNECTION=pgsql  # or mysql
DB_HOST=...
DB_PORT=5432
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...

# M-Pesa (if using)
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_PASSKEY=...
MPESA_SHORTCODE=...
MPESA_ENV=sandbox  # or production
```

### Step 3: Generate APP_KEY (if missing)

If `APP_KEY` is not set, generate it:

```bash
heroku run php artisan key:generate --app uetjkuat-54286e10a43b
```

Or set it manually:
```bash
heroku config:set APP_KEY="base64:$(php artisan key:generate --show)" --app uetjkuat-54286e10a43b
```

### Step 4: Clear All Caches

```bash
heroku run php artisan config:clear --app uetjkuat-54286e10a43b
heroku run php artisan cache:clear --app uetjkuat-54286e10a43b
heroku run php artisan route:clear --app uetjkuat-54286e10a43b
heroku run php artisan view:clear --app uetjkuat-54286e10a43b
```

### Step 5: Run Migrations (if database is configured)

```bash
heroku run php artisan migrate --force --app uetjkuat-54286e10a43b
```

### Step 6: Check Storage Permissions

```bash
heroku run chmod -R 775 storage bootstrap/cache --app uetjkuat-54286e10a43b
```

## Quick Diagnostic Commands

Run these to check the state of your Heroku app:

```bash
# 1. Check logs (most important!)
heroku logs --tail --app uetjkuat-54286e10a43b

# 2. Check environment variables
heroku config --app uetjkuat-54286e10a43b

# 3. Test database connection
heroku run php artisan tinker --app uetjkuat-54286e10a43b
# Then in tinker: DB::connection()->getPdo();

# 4. Check if APP_KEY is set
heroku run php artisan config:show app.key --app uetjkuat-54286e10a43b

# 5. Check route list
heroku run php artisan route:list --app uetjkuat-54286e10a43b
```

## Common Error Messages & Fixes

### "No application encryption key has been specified"
**Fix:**
```bash
heroku run php artisan key:generate --app uetjkuat-54286e10a43b
```

### "SQLSTATE[HY000] [2002] Connection refused"
**Fix:** Database credentials are wrong or database is not accessible
- Check `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- Verify database is running and accessible from Heroku

### "Class 'X' not found"
**Fix:** Missing Composer dependency
```bash
# Redeploy - Heroku should run composer install automatically
git push heroku main
```

### "The stream or file could not be opened"
**Fix:** Storage permissions
```bash
heroku run chmod -R 775 storage bootstrap/cache --app uetjkuat-54286e10a43b
```

## Setting Environment Variables in Heroku Dashboard

1. Go to [Heroku Dashboard](https://dashboard.heroku.com)
2. Select your app: `uetjkuat-54286e10a43b`
3. Go to **Settings** tab
4. Click **Reveal Config Vars**
5. Add/Update required variables
6. Click **Save**

## Testing After Fix

Once you've fixed the issue, test again:

```powershell
# Test health endpoint
Invoke-WebRequest -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/health"

# Should return 200 OK with JSON response
```

## Next Steps

1. **Check logs first** - `heroku logs --tail --app uetjkuat-54286e10a43b`
2. **Identify the specific error** from the logs
3. **Fix the issue** based on the error message
4. **Test again** with the health endpoint

## Summary

The 500 error means Laravel is running but encountering a problem. The **Heroku logs will tell you exactly what's wrong**. Most common issues are:

1. ❌ Missing `APP_KEY`
2. ❌ Missing database credentials
3. ❌ Missing M-Pesa credentials (if using STK push)
4. ❌ Cached configuration issues

**Start with checking the logs - that's your best diagnostic tool!**

