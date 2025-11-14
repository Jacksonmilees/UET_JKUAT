# Fixing "Connection Closed Unexpectedly" Error

## Current Status
- ✅ APP_KEY is set
- ❌ Error changed from 500 to "Connection closed unexpectedly"
- This suggests the app is **crashing** or **timing out**

## What This Error Means

"The connection was closed unexpectedly" usually means:
1. **PHP fatal error** - App crashes before sending response
2. **Database connection timeout** - Can't connect to database
3. **Memory limit exceeded** - App runs out of memory
4. **App is restarting** - Dyno is restarting

## Step 1: Check Heroku Logs

This is the most important step - it will show what's actually happening:

### Via Heroku Dashboard:
1. Go to your app in Heroku Dashboard
2. Click **"More"** → **"View logs"**
3. Look for error messages, especially:
   - `PHP Fatal error`
   - `SQLSTATE`
   - `Memory limit`
   - `Timeout`

### Via CLI:
```bash
heroku logs --tail -n 200 --app uetjkuat-54286e10a43b
```

Look for recent errors in the logs.

## Step 2: Check App Status

Check if the dyno is running:
```bash
heroku ps --app uetjkuat-54286e10a43b
```

Should show `web.1: up` - if it shows `crashed` or keeps restarting, that's the problem.

## Step 3: Common Causes & Fixes

### Cause 1: Database Connection Error

**Error in logs:** `SQLSTATE[HY000] [2002] Connection refused` or similar

**Fix:**
1. Go to Heroku Dashboard → Settings → Config Vars
2. Verify database credentials are set:
   - `DB_CONNECTION`
   - `DB_HOST`
   - `DB_PORT`
   - `DB_DATABASE`
   - `DB_USERNAME`
   - `DB_PASSWORD`

**If using Heroku Postgres:**
- Go to Resources tab
- Add Heroku Postgres addon if not added
- Database credentials are automatically set

### Cause 2: Missing Required Environment Variables

**Error in logs:** `Undefined array key` or `env() returned null`

**Fix:** Add missing variables in Config Vars:
- `APP_NAME` = `Laravel`
- `APP_ENV` = `production`
- `APP_URL` = `https://uetjkuat-54286e10a43b.herokuapp.com`
- `LOG_CHANNEL` = `stderr`

### Cause 3: Storage Permissions

**Error in logs:** `The stream or file could not be opened`

**Fix:** Run in Heroku console (Dashboard → More → Run console):
```bash
chmod -R 775 storage bootstrap/cache
```

### Cause 4: Memory Limit

**Error in logs:** `Allowed memory size exhausted`

**Fix:** Increase PHP memory limit in `php.ini` or add to Config Vars:
- `PHP_MEMORY_LIMIT` = `256M`

### Cause 5: Fatal PHP Error

**Error in logs:** `PHP Fatal error: ...`

**Fix:** The error message will tell you exactly what's wrong. Common issues:
- Missing class/function
- Syntax error
- Missing dependency

## Step 4: Enable Detailed Error Reporting

To see errors more clearly:

1. **Set APP_DEBUG to true** (temporarily):
   - Heroku Dashboard → Settings → Config Vars
   - `APP_DEBUG` = `true`

2. **Set LOG_LEVEL to debug**:
   - `LOG_LEVEL` = `debug`

3. **Check logs again**

## Step 5: Restart the Dyno

Sometimes a simple restart fixes issues:

### Via Dashboard:
1. Go to your app
2. Click **"More"** → **"Restart all dynos"**

### Via CLI:
```bash
heroku restart --app uetjkuat-54286e10a43b
```

## Quick Diagnostic Commands

Run these to get more info:

```bash
# Check dyno status
heroku ps --app uetjkuat-54286e10a43b

# Get recent logs
heroku logs --tail -n 100 --app uetjkuat-54286e10a43b

# Check environment variables
heroku config --app uetjkuat-54286e10a43b

# Test database connection (if using DB)
heroku run php artisan tinker --app uetjkuat-54286e10a43b
# Then in tinker: DB::connection()->getPdo();
```

## Most Likely Issue

Based on the "connection closed" error, the most likely causes are:

1. **Database connection failing** - Check DB credentials
2. **Missing APP_URL** - Laravel needs to know its URL
3. **Fatal PHP error** - Check logs for the exact error

## Next Steps

1. ✅ **Check Heroku logs** - This will show the actual error
2. ✅ **Check dyno status** - Is it running or crashing?
3. ✅ **Verify database credentials** - If using a database
4. ✅ **Add missing environment variables** - APP_NAME, APP_ENV, APP_URL
5. ✅ **Restart dyno** - Sometimes fixes transient issues

**Start with checking the logs - that will tell you exactly what's wrong!**

