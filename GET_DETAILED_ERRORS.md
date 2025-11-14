# Getting Detailed Error Information from Heroku

## Current Status
- ✅ Laravel is running (Procfile working)
- ❌ All endpoints returning 500 errors
- ⚠️ Need to see actual error messages

## Step 1: Get Detailed Error Logs

The logs you showed are access logs. We need to see the actual PHP/Laravel errors.

### Option A: Filter for Errors in Logs
```bash
heroku logs --tail --app uetjkuat-54286e10a43b | grep -i "error\|exception\|fatal"
```

### Option B: Get Last 100 Lines with Errors
```bash
heroku logs --tail -n 100 --app uetjkuat-54286e10a43b
```

Look for lines containing:
- `PHP Fatal error`
- `SQLSTATE`
- `Class not found`
- `No application encryption key`
- `Connection refused`
- `Undefined variable`

## Step 2: Enable Detailed Error Reporting

Temporarily enable detailed errors to see what's wrong:

### Set APP_DEBUG to true (temporarily)
```bash
heroku config:set APP_DEBUG=true --app uetjkuat-54286e10a43b
```

**⚠️ WARNING:** Only do this temporarily! Set it back to `false` after fixing.

### Test Again
```powershell
Invoke-WebRequest -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/health"
```

Now you should see the actual error message in the response.

## Step 3: Check Common Issues

### Issue 1: Missing APP_KEY (Most Common)

**Check if APP_KEY is set:**
```bash
heroku config:get APP_KEY --app uetjkuat-54286e10a43b
```

**If empty or missing, generate it:**
```bash
heroku run php artisan key:generate --app uetjkuat-54286e10a43b
```

**Or set it manually:**
```bash
# Generate key locally first
php artisan key:generate --show

# Then set it on Heroku
heroku config:set APP_KEY="base64:YOUR_GENERATED_KEY" --app uetjkuat-54286e10a43b
```

### Issue 2: Database Connection

**Check database config:**
```bash
heroku config --app uetjkuat-54286e10a43b | grep DB_
```

**Required variables:**
- `DB_CONNECTION` (should be `pgsql` for PostgreSQL or `mysql`)
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`

**Test database connection:**
```bash
heroku run php artisan tinker --app uetjkuat-54286e10a43b
```

Then in tinker:
```php
DB::connection()->getPdo();
```

If this fails, your database credentials are wrong.

### Issue 3: Missing Environment Variables

**Check all config vars:**
```bash
heroku config --app uetjkuat-54286e10a43b
```

**Common missing variables:**
- `APP_NAME`
- `APP_ENV` (should be `production`)
- `APP_URL` (should be `https://uetjkuat-54286e10a43b.herokuapp.com`)
- `LOG_CHANNEL` (can be `stderr` for Heroku)

### Issue 4: M-Pesa Configuration (for STK Push)

If you're testing STK push, check:
```bash
heroku config --app uetjkuat-54286e10a43b | grep MPESA
```

**Required:**
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_PASSKEY`
- `MPESA_SHORTCODE`
- `MPESA_ENV` (should be `sandbox` or `production`)

## Step 4: Clear All Caches

After fixing configuration, clear caches:

```bash
heroku run php artisan config:clear --app uetjkuat-54286e10a43b
heroku run php artisan cache:clear --app uetjkuat-54286e10a43b
heroku run php artisan route:clear --app uetjkuat-54286e10a43b
heroku run php artisan view:clear --app uetjkuat-54286e10a43b
```

## Step 5: Check Laravel Logs

Laravel logs might be in storage:

```bash
heroku run tail -n 50 storage/logs/laravel.log --app uetjkuat-54286e10a43b
```

Or if using stderr:
```bash
heroku logs --tail --app uetjkuat-54286e10a43b | grep -i "laravel\|error"
```

## Quick Diagnostic Script

Run this to check everything at once:

```bash
echo "=== Checking APP_KEY ==="
heroku config:get APP_KEY --app uetjkuat-54286e10a43b

echo "=== Checking Database Config ==="
heroku config --app uetjkuat-54286e10a43b | grep DB_

echo "=== Checking APP Settings ==="
heroku config --app uetjkuat-54286e10a43b | grep APP_

echo "=== Recent Errors ==="
heroku logs --tail -n 50 --app uetjkuat-54286e10a43b | grep -i "error\|exception\|fatal"
```

## Most Likely Fix

Based on the 500 errors, the most common issue is:

**Missing APP_KEY**

Fix it with:
```bash
heroku run php artisan key:generate --app uetjkuat-54286e10a43b
heroku run php artisan config:clear --app uetjkuat-54286e10a43b
```

Then test again!

## After Fixing

1. **Set APP_DEBUG back to false:**
   ```bash
   heroku config:set APP_DEBUG=false --app uetjkuat-54286e10a43b
   ```

2. **Test the health endpoint:**
   ```powershell
   Invoke-WebRequest -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/health"
   ```

3. **Should return 200 OK with JSON response**

