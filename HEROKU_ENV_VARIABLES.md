# Heroku Environment Variables Checklist

## ✅ Required Variables (Must Set)

### Application
- `APP_KEY` = `base64:ka1A00Wn4vGVzEcv4ZvlPT/0PSYhaiI1+7DCsNWgEnY=` (already set)
- `APP_NAME` = `Laravel` (or your app name)
- `APP_ENV` = `production`
- `APP_DEBUG` = `false`
- `APP_URL` = `https://uetjkuat-54286e10a43b.herokuapp.com`

### Database (If Using Database)
- `DB_CONNECTION` = `pgsql` (for PostgreSQL) or `mysql` (for MySQL)
- `DB_HOST` = (your database host)
- `DB_PORT` = `5432` (PostgreSQL) or `3306` (MySQL)
- `DB_DATABASE` = (your database name)
- `DB_USERNAME` = (your database username)
- `DB_PASSWORD` = (your database password)
- `DB_SSLMODE` = `require` (for PostgreSQL on Heroku)

### Logging
- `LOG_CHANNEL` = `stderr` (recommended for Heroku)
- `LOG_LEVEL` = `error` (or `debug` for troubleshooting)

## ⚠️ Optional But Recommended

### Cache
- `CACHE_STORE` = `file` or `database` (Redis not required)

### Queue
- `QUEUE_CONNECTION` = `database` or `sync`

### API
- `API_KEY` = (if using API key authentication)

## 🔧 M-Pesa (If Using STK Push)

- `MPESA_ENV` = `sandbox` or `production`
- `MPESA_CONSUMER_KEY` = (your consumer key)
- `MPESA_CONSUMER_SECRET` = (your consumer secret)
- `MPESA_SHORTCODE` = (your shortcode)
- `MPESA_PASSKEY` = (your passkey)
- `MPESA_CALLBACK_SECRET` = (your callback secret)

## 📝 How to Set in Heroku Dashboard

1. Go to https://dashboard.heroku.com
2. Select your app: `uetjkuat-54286e10a43b`
3. Go to **Settings** tab
4. Click **Reveal Config Vars**
5. Click **Edit** or **Add** for each variable
6. Enter Key and Value
7. Click **Save**

## 🧪 Quick Test

After setting variables, test:
```powershell
Invoke-WebRequest -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/health"
```

Should return 200 OK!

