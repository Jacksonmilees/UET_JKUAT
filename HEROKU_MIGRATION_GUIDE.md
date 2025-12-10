# Heroku Migration Guide

## Running Migrations on Heroku

Since the Heroku CLI might not be available in all environments, here are multiple ways to run migrations on your Heroku app (`uetjkuat`):

### Method 1: Using Web Interface (Easiest)
1. Go to https://dashboard.heroku.com/apps/uetjkuat
2. Click on "More" → "Run console"
3. Type: `php artisan migrate --force`
4. Press Enter and wait for migrations to complete

### Method 2: Using Heroku CLI (If Available)
```bash
heroku run php artisan migrate --force --app uetjkuat
```

### Method 3: Adding to Procfile (Automatic)
The migrations will run automatically on each deploy if you add this to your `Procfile`:
```
release: php artisan migrate --force
```

## Post-Migration Steps

After running migrations, you should:

1. **Clear caches:**
   ```bash
   heroku run php artisan config:clear --app uetjkuat
   heroku run php artisan cache:clear --app uetjkuat
   heroku run php artisan route:clear --app uetjkuat
   ```

2. **Check logs:**
   ```bash
   heroku logs --tail --app uetjkuat
   ```

3. **Verify database:**
   ```bash
   heroku run php artisan migrate:status --app uetjkuat
   ```

## Troubleshooting

### If migrations fail:
1. Check the error message in logs
2. Rollback last migration:
   ```bash
   heroku run php artisan migrate:rollback --step=1 --force --app uetjkuat
   ```
3. Try again

### If database connection fails:
- Verify DATABASE_URL is set: `heroku config --app uetjkuat`
- Check Neon database is accessible and credentials are correct

## Recent Migrations Added

The following migrations were added to support new features:
- Campaign fields for projects (featured_image, metadata, etc.)
- Campaign tables and analytics
- Roles and permissions system
- Audit logs
- Withdrawal approvals

## Backend Changes Made

### Models Updated:
- **Project**: Added `featured_image`, `long_description`, `organizer`, `impact_statement`, `duration_days`, and other campaign fields
- **User**: Added roles relationship
- **Campaign**: New model for managing campaigns
- **AuditLog**: New model for tracking changes
- **Role**: New model for RBAC

### Request Validation Updated:
- **StoreProjectRequest**: Now accepts `featuredImage`, `longDescription`, `impactStatement`, `durationDays`, and other camelCase fields
- **UpdateProjectRequest**: Same updates as store request

### Key Features:
1. **Image Support**: Projects now support both `image_url` and `featured_image` fields
2. **URL Support**: Images can be provided as URLs or base64 encoded data
3. **Field Mapping**: CamelCase frontend fields automatically map to snake_case backend fields

## Testing the Changes

### 1. Test Project Creation (with image):
```bash
curl -X POST https://uetjkuat.herokuapp.com/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "title": "Test Project",
    "description": "Short description",
    "longDescription": "Longer detailed description",
    "fundingGoal": 100000,
    "featuredImage": "https://example.com/image.jpg",
    "organizer": "Admin",
    "impactStatement": "This will help many students",
    "durationDays": 30,
    "category": "Education"
  }'
```

### 2. Verify projects load:
```bash
curl -X GET https://uetjkuat.herokuapp.com/api/v1/projects \
  -H "X-API-Key: YOUR_API_KEY"
```

## Next Steps

1. **Run migrations** using one of the methods above
2. **Test the API endpoints** to ensure everything works
3. **Check frontend** to verify images display correctly
4. **Monitor logs** for any errors

## Support

If you encounter issues:
1. Check `storage/logs/laravel.log` on the server
2. Verify environment variables are set correctly
3. Ensure database credentials are valid
4. Check Neon database connection
