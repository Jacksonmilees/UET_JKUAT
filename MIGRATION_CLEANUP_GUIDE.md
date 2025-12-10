# Migration Cleanup Guide for Heroku

## Problem
Your database has partial migrations from a previous failed attempt. The `campaign_analytics` table exists with indexes, but the migration record doesn't exist in the `migrations` table.

## Solution: Clean Up and Re-run Migrations

### Step 1: Deploy Latest Code

First, ensure the latest fixes are on Heroku:

```bash
# If using Heroku CLI
git push heroku claude/fix-backend-frontend-01PMdLr7UK3gNeXvmaaBGhY2:main

# OR merge to main first
git checkout main
git merge claude/fix-backend-frontend-01PMdLr7UK3gNeXvmaaBGhY2
git push heroku main
```

### Step 2: Clean Up Partial Migrations

Run this on Heroku to drop partially created tables:

**Option A: Using Heroku Web Console** (Recommended)
1. Go to: https://dashboard.heroku.com/apps/uetjkuat
2. Click: "More" → "Run console"
3. Paste this command:

```bash
php artisan tinker --execute="
DB::statement('DROP TABLE IF EXISTS campaign_analytics CASCADE');
DB::statement('DROP TABLE IF EXISTS campaign_donations CASCADE');
echo 'Partial tables cleaned up successfully';
"
```

**Option B: Using Heroku CLI**
```bash
heroku run "php artisan tinker --execute=\"DB::statement('DROP TABLE IF EXISTS campaign_analytics CASCADE'); DB::statement('DROP TABLE IF EXISTS campaign_donations CASCADE'); echo 'Cleaned up';\"" --app uetjkuat
```

### Step 3: Run Migrations Again

After cleanup, run migrations:

**Using Web Console:**
```bash
php artisan migrate --force
```

**Using CLI:**
```bash
heroku run php artisan migrate --force --app uetjkuat
```

### Step 4: Verify Success

Check migration status:

```bash
php artisan migrate:status
```

You should see all migrations marked as "Ran".

### Step 5: Clear Caches

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

---

## What Was Fixed

### 1. **Duplicate Indexes Removed**
   - `campaign_analytics`: Removed duplicate `event_type` index (was defined twice)
   - `campaigns`: Removed duplicate `unique_code` and `slug` indexes

### 2. **Idempotent Migrations**
   - Added `Schema::hasTable()` checks to all campaign migrations
   - Migrations now skip table creation if table already exists
   - Prevents errors on re-run

### 3. **Syntax Errors Fixed**
   - Fixed extra quote in `audit_logs` migration

---

## Alternative: Force Clean Slate (If Above Doesn't Work)

If you still have issues, you can reset all campaign migrations:

```bash
# WARNING: This will delete data in campaign tables!
php artisan tinker --execute="
DB::statement('DROP TABLE IF EXISTS campaign_donations CASCADE');
DB::statement('DROP TABLE IF EXISTS campaign_analytics CASCADE');
DB::statement('DROP TABLE IF EXISTS campaigns CASCADE');
DB::table('migrations')->where('migration', 'LIKE', '%campaign%')->delete();
echo 'Campaign migrations reset';
"

# Then run migrations
php artisan migrate --force
```

---

## Testing After Migration

### 1. Check Tables Were Created
```bash
php artisan tinker --execute="
echo 'campaigns: ' . (Schema::hasTable('campaigns') ? 'EXISTS' : 'MISSING') . PHP_EOL;
echo 'campaign_analytics: ' . (Schema::hasTable('campaign_analytics') ? 'EXISTS' : 'MISSING') . PHP_EOL;
echo 'campaign_donations: ' . (Schema::hasTable('campaign_donations') ? 'EXISTS' : 'MISSING') . PHP_EOL;
"
```

### 2. Test Project Creation with Image
```bash
curl -X POST https://uetjkuat.herokuapp.com/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "title": "Test Project",
    "description": "Test description",
    "fundingGoal": 50000,
    "featuredImage": "https://example.com/image.jpg"
  }'
```

### 3. Verify in Logs
```bash
heroku logs --tail --app uetjkuat
```

Look for successful migration messages.

---

## Common Issues & Solutions

### Issue: "relation already exists"
**Solution:** Run the cleanup commands in Step 2 first.

### Issue: "column does not exist"
**Solution:** The migration didn't complete. Run cleanup + migrate again.

### Issue: "foreign key constraint fails"
**Solution:** Tables are in wrong order. Drop all campaign tables and re-migrate.

### Issue: Migration says "DONE" but table doesn't exist
**Solution:** Check for errors in logs. The migration might have rolled back.

---

## Quick Command Reference

```bash
# Deploy code
git push heroku main

# Clean up
heroku run "php artisan tinker --execute='DB::statement(\"DROP TABLE IF EXISTS campaign_analytics CASCADE\")'" --app uetjkuat

# Migrate
heroku run php artisan migrate --force --app uetjkuat

# Check status
heroku run php artisan migrate:status --app uetjkuat

# Clear caches
heroku run php artisan config:clear --app uetjkuat
heroku run php artisan cache:clear --app uetjkuat

# View logs
heroku logs --tail --app uetjkuat
```

---

## Support

If you continue to have issues:
1. Check the full error message in `heroku logs`
2. Ensure all environment variables are set correctly
3. Verify database connection is working
4. Try the "Force Clean Slate" approach

---

**Last Updated:** 2025-12-10
