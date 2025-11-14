# Setting APP_KEY on Heroku - Manual Method

## Problem
Heroku CLI can't find the app, or you need to set APP_KEY manually.

## Solution: Set APP_KEY via Heroku Dashboard

### Method 1: Generate Key Locally and Set in Dashboard

**Step 1: Generate APP_KEY locally**
```bash
php artisan key:generate --show
```

This will output something like:
```
base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Step 2: Set it in Heroku Dashboard**
1. Go to [Heroku Dashboard](https://dashboard.heroku.com)
2. Select your app (the one with URL `uetjkuat-54286e10a43b.herokuapp.com`)
3. Go to **Settings** tab
4. Click **Reveal Config Vars**
5. Click **Edit** or find `APP_KEY` in the list
6. If `APP_KEY` doesn't exist, click **Add** and add:
   - **Key**: `APP_KEY`
   - **Value**: Paste the key you generated (the `base64:...` string)
7. Click **Save**

**Step 3: Clear Config Cache**
After setting APP_KEY, you need to clear the config cache. You can do this via:
- Heroku Dashboard → More → Run console
- Run: `php artisan config:clear`

### Method 2: Use Heroku CLI with Correct App Name

If the app name is different, find it first:

```bash
# List all your apps
heroku apps

# Or check git remote
git remote -v
```

Then use the correct app name:
```bash
heroku run php artisan key:generate --app YOUR_ACTUAL_APP_NAME
```

### Method 3: Set via CLI (if you have access)

If you know the correct app name:
```bash
# Generate and set in one command
heroku run php artisan key:generate --app YOUR_APP_NAME

# Or set manually if you have the key
heroku config:set APP_KEY="base64:your-generated-key-here" --app YOUR_APP_NAME
```

## Verify APP_KEY is Set

After setting it, verify:
```bash
heroku config:get APP_KEY --app YOUR_APP_NAME
```

Or check in Heroku Dashboard → Settings → Config Vars

## Required Environment Variables

While you're in the Dashboard, make sure these are also set:

### Essential Laravel Variables
- `APP_NAME` = `Laravel` (or your app name)
- `APP_ENV` = `production`
- `APP_DEBUG` = `false`
- `APP_URL` = `https://uetjkuat-54286e10a43b.herokuapp.com`
- `APP_KEY` = `base64:...` (the one you just set)
- `LOG_CHANNEL` = `stderr` (for Heroku)

### Database Variables (if using database)
- `DB_CONNECTION` = `pgsql` (or `mysql`)
- `DB_HOST` = (your database host)
- `DB_PORT` = `5432` (for PostgreSQL) or `3306` (for MySQL)
- `DB_DATABASE` = (your database name)
- `DB_USERNAME` = (your database username)
- `DB_PASSWORD` = (your database password)

### M-Pesa Variables (if using STK push)
- `MPESA_CONSUMER_KEY` = (your consumer key)
- `MPESA_CONSUMER_SECRET` = (your consumer secret)
- `MPESA_PASSKEY` = (your passkey)
- `MPESA_SHORTCODE` = (your shortcode)
- `MPESA_ENV` = `sandbox` or `production`

## After Setting APP_KEY

1. **Clear config cache:**
   - Via Dashboard: More → Run console → `php artisan config:clear`
   - Via CLI: `heroku run php artisan config:clear --app YOUR_APP_NAME`

2. **Test the API:**
   ```powershell
   Invoke-WebRequest -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/health"
   ```

3. **Should return 200 OK** instead of 500!

## Quick Steps Summary

1. ✅ Generate key locally: `php artisan key:generate --show`
2. ✅ Copy the `base64:...` output
3. ✅ Go to Heroku Dashboard → Your App → Settings → Config Vars
4. ✅ Add/Edit `APP_KEY` with the copied value
5. ✅ Save
6. ✅ Clear cache via Dashboard console: `php artisan config:clear`
7. ✅ Test API endpoint

## Troubleshooting

### If you can't find the app in Dashboard:
- Check if you're logged into the correct Heroku account
- The app might be under a different account/team
- Check the URL: `https://dashboard.heroku.com/apps`

### If APP_KEY still doesn't work:
- Make sure there are no extra spaces when copying
- The key should start with `base64:`
- Clear config cache after setting
- Restart the dyno: Dashboard → More → Restart all dynos

