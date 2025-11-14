# Diagnosing 500 Error After APP_KEY Fix

## Current Status
- ✅ APP_KEY has been set
- ✅ Config cache cleared
- ❌ Still getting 500 errors

## Next Steps to Find the Actual Error

### Step 1: Enable Debug Mode (Temporarily)

In Heroku Dashboard:
1. Go to your app → Settings → Config Vars
2. Find `APP_DEBUG` or add it if it doesn't exist
3. Set value to: `true`
4. Save

**⚠️ WARNING:** Only enable this temporarily! Set it back to `false` after fixing.

### Step 2: Test Again

After enabling debug mode, test the endpoint:
```powershell
Invoke-WebRequest -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/health"
```

Now you should see the **actual error message** in the response instead of a generic 500 page.

### Step 3: Check Required Environment Variables

While in Heroku Dashboard → Settings → Config Vars, verify these are set:

#### Essential Laravel Variables:
- ✅ `APP_KEY` - Should be set now
- ❓ `APP_NAME` - Should be set (e.g., "Laravel")
- ❓ `APP_ENV` - Should be `production`
- ❓ `APP_DEBUG` - Should be `false` (or `true` temporarily for debugging)
- ❓ `APP_URL` - Should be `https://uetjkuat-54286e10a43b.herokuapp.com`
- ❓ `LOG_CHANNEL` - Can be `stderr` for Heroku

#### Database Variables (if using database):
- ❓ `DB_CONNECTION` - `pgsql` or `mysql`
- ❓ `DB_HOST` - Your database host
- ❓ `DB_PORT` - `5432` (PostgreSQL) or `3306` (MySQL)
- ❓ `DB_DATABASE` - Database name
- ❓ `DB_USERNAME` - Database username
- ❓ `DB_PASSWORD` - Database password

### Step 4: Common Issues After APP_KEY Fix

#### Issue 1: Database Connection Error
**Error message will say:** `SQLSTATE[HY000] [2002] Connection refused` or similar

**Fix:** Set database credentials in Config Vars

#### Issue 2: Missing Required Environment Variable
**Error message will say:** `Undefined array key "XXX"` or `env() returned null`

**Fix:** Add the missing variable in Config Vars

#### Issue 3: Storage Permissions
**Error message will say:** `The stream or file could not be opened`

**Fix:** Run in Heroku console:
```bash
chmod -R 775 storage bootstrap/cache
```

#### Issue 4: Missing Composer Dependencies
**Error message will say:** `Class 'X' not found`

**Fix:** Redeploy - Heroku should run `composer install` automatically

### Step 5: Check Heroku Logs

Get detailed error logs:
```bash
heroku logs --tail -n 100 --app uetjkuat-54286e10a43b
```

Or in Heroku Dashboard:
1. Go to your app
2. Click "More" → "View logs"
3. Look for error messages

## Quick Checklist

Run through this checklist in Heroku Dashboard → Settings → Config Vars:

- [ ] `APP_KEY` is set (✅ Done)
- [ ] `APP_NAME` is set
- [ ] `APP_ENV` = `production`
- [ ] `APP_URL` = `https://uetjkuat-54286e10a43b.herokuapp.com`
- [ ] `LOG_CHANNEL` = `stderr` (optional but recommended)
- [ ] Database variables are set (if using database)
- [ ] M-Pesa variables are set (if using STK push)

## After Finding the Error

1. **Fix the specific issue** based on the error message
2. **Set APP_DEBUG back to false** (important for security!)
3. **Test the endpoint again**
4. **Should return 200 OK**

## Most Likely Next Issues

Based on common patterns, after fixing APP_KEY, the next issues are usually:

1. **Database connection** - Missing or incorrect DB credentials
2. **Missing APP_URL** - Laravel needs to know its own URL
3. **Storage permissions** - Can't write to storage directory

Enable debug mode first to see which one it is!

