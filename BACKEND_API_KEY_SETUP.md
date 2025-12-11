# Backend API Key Setup for Heroku

## Critical Setup Required

The frontend has been configured with an API key (`uetjkuat_secure_api_key_2025_production`), but this MUST be set in the Heroku environment variables for the backend to work properly.

## Steps to Configure on Heroku

### 1. Set the API_KEY Environment Variable

```bash
# Login to Heroku CLI
heroku login

# Set the API key (replace with your app name if different)
heroku config:set API_KEY=uetjkuat_secure_api_key_2025_production -a uetjkuat

# Verify it was set
heroku config:get API_KEY -a uetjkuat
```

### 2. Alternative: Set via Heroku Dashboard

1. Go to https://dashboard.heroku.com/apps/uetjkuat
2. Click on "Settings" tab
3. Scroll to "Config Vars"
4. Click "Reveal Config Vars"
5. Add a new config var:
   - **KEY**: `API_KEY`
   - **VALUE**: `uetjkuat_secure_api_key_2025_production`
6. Click "Add"

### 3. Verify the Setup

After setting the environment variable, verify it's working:

```bash
# Check if the app is using the API key
heroku logs --tail -a uetjkuat

# Test a protected endpoint
curl -X GET "https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/accounts" \
  -H "X-API-Key: uetjkuat_secure_api_key_2025_production" \
  -H "Content-Type: application/json"
```

## Frontend Configuration

The frontend is already configured in `/uetjkuat-funding-platform/.env.local`:

```env
VITE_API_BASE_URL=https://uetjkuat-54286e10a43b.herokuapp.com/api
VITE_API_KEY=uetjkuat_secure_api_key_2025_production
```

## How the API Key Works

### Protected Endpoints
The following endpoints require the `X-API-Key` header:

```
POST   /api/v1/projects
PUT    /api/v1/projects/{id}
DELETE /api/v1/projects/{id}
POST   /api/v1/accounts
PUT    /api/v1/accounts/{id}
DELETE /api/v1/accounts/{id}
POST   /api/v1/accounts/transfer
POST   /api/v1/withdrawals/initiate
POST   /api/v1/news
PUT    /api/v1/news/{id}
DELETE /api/v1/news/{id}
... and more (see routes/api.php)
```

### Public Endpoints (No API Key Required)
```
GET    /api/v1/projects
GET    /api/v1/news
GET    /api/v1/announcements
GET    /api/v1/merchandise
GET    /api/v1/transactions
... and more
```

## Backend Code Reference

The API key middleware is defined in:
- **File**: `app/Http/Middleware/ApiKeyMiddleware.php`
- **Config**: `config/services.php` (line 18: `'key' => env('API_KEY')`)
- **Routes**: `routes/api.php` (line 283: `Route::middleware(ApiKeyMiddleware::class)`)

## Troubleshooting

### Issue: 401 or 403 Errors

**Cause**: API key is not set or doesn't match

**Solution**:
1. Verify the API key is set in Heroku: `heroku config:get API_KEY -a uetjkuat`
2. Ensure it matches the frontend key: `uetjkuat_secure_api_key_2025_production`
3. Restart the Heroku dyno: `heroku restart -a uetjkuat`

### Issue: "VITE_API_KEY is not set" Warning in Frontend Console

**Cause**: Frontend environment file not loaded

**Solution**:
1. Ensure `/uetjkuat-funding-platform/.env.local` exists
2. Restart the frontend dev server: `npm run dev`
3. For production builds, set the environment variable in your hosting platform (Vercel, Netlify, etc.)

## Security Notes

1. **Never commit** `.env` files to version control
2. **Never expose** the API key in client-side code (it's sent in headers, which is fine)
3. **Rotate** the API key periodically for security
4. Use different API keys for:
   - Development: `uetjkuat_dev_api_key_2025`
   - Staging: `uetjkuat_staging_api_key_2025`
   - Production: `uetjkuat_secure_api_key_2025_production`

## Next Steps After Setup

1. Set the API_KEY in Heroku (CRITICAL)
2. Restart the Heroku app
3. Test the admin dashboard
4. Verify all protected endpoints work
5. Monitor logs for any authentication errors

---

**Last Updated**: 2025-12-11
**Related Files**:
- Frontend env: `/uetjkuat-funding-platform/.env.local`
- Backend middleware: `/app/Http/Middleware/ApiKeyMiddleware.php`
- Routes: `/routes/api.php`
- Config: `/config/services.php`
