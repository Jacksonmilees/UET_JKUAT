# Deployment Fix Steps - Registration System

## Issue
500 Internal Server Error on `/api/auth/register` endpoint.

## Root Causes Fixed

### 1. Invalid Schema Reference in Migration
**File**: `database/migrations/2025_02_16_143140_create_tickets_table.php`

**Problem**: Referenced non-existent schema `moutsystem.members`
```php
// BEFORE (Wrong)
$table->foreign('member_mmid')->references('MMID')->on('moutsystem.members')->onDelete('cascade');

// AFTER (Fixed)
$table->foreign('member_mmid')->references('MMID')->on('members')->onDelete('cascade');
```

### 2. Migration Files Had Leading Spaces
Fixed file names:
- ` 2025_01_15_143128_create_withdrawals_table.php` → `2025_01_15_143128_create_withdrawals_table.php`
- ` 2025_02_16_143140_create_tickets_table.php` → `2025_02_16_143140_create_tickets_table.php`

---

## Deployment Steps

### Option 1: Deploy via Git (Recommended)

```bash
# 1. Add Heroku remote if not already added
heroku git:remote -a uetjkuat

# 2. Push to Heroku
git push heroku main

# 3. Run migrations
heroku run php artisan migrate --app uetjkuat

# 4. Verify
heroku logs --tail --app uetjkuat
```

### Option 2: Manual Deployment via Heroku Dashboard

1. **Go to Heroku Dashboard**: https://dashboard.heroku.com/apps/uetjkuat
2. **Navigate to Deploy tab**
3. **Connect to GitHub** (if not connected)
4. **Deploy Branch**: Select `main` branch and click "Deploy Branch"
5. **Wait for build to complete**
6. **Run Migration**:
   - Go to "More" → "Run console"
   - Enter: `php artisan migrate`
   - Click "Run"

### Option 3: Deploy via Heroku CLI

```bash
# If you have the Heroku CLI installed
cd c:\Users\Hp\Desktop\coresystem

# Deploy
git push https://git.heroku.com/uetjkuat.git main

# Run migrations
heroku run php artisan migrate --app uetjkuat
```

---

## Files Changed in This Commit

1. ✅ `app/Models/User.php` - Added all profile fields
2. ✅ `app/Services/MemberIdService.php` - Member ID generation
3. ✅ `app/Http/Controllers/API/AuthController.php` - Accept all registration fields
4. ✅ `app/Http/Controllers/API/UserController.php` - Enhanced user management
5. ✅ `database/migrations/2024_01_01_000000_create_news_table.php` - News table
6. ✅ `database/migrations/2024_11_27_000001_add_profile_fields_to_users_table.php` - User profile fields
7. ✅ `database/migrations/2025_02_16_143140_create_tickets_table.php` - Fixed schema reference
8. ✅ `uetjkuat-funding-platform/services/api.ts` - Updated types
9. ✅ `uetjkuat-funding-platform/index.html` - Fixed icon references

---

## Migrations to Run

When you run `php artisan migrate`, these migrations will execute:

1. **create_news_table** - Creates news table for news API
2. **add_profile_fields_to_users_table** - Adds 12 new fields to users table:
   - `member_id` (unique)
   - `phone_number`
   - `year_of_study`
   - `course`
   - `college`
   - `admission_number` (unique)
   - `ministry_interest`
   - `residence`
   - `role`
   - `status`
   - `avatar`
   - `registration_completed_at`

---

## Verification Steps

After deployment and migration:

### 1. Test Registration
```bash
curl -X POST https://uetjkuat-54286e10a43b.herokuapp.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phoneNumber": "0712345678",
    "yearOfStudy": "Year 2",
    "course": "Computer Science",
    "college": "JKUAT",
    "admissionNumber": "SCT211-0001/2023",
    "ministryInterest": "Media",
    "residence": "Juja"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "member_id": "UETJ5847AK27",
      "name": "Test User",
      ...all other fields...
    },
    "token": "..."
  },
  "message": "Registration successful! Your member ID is: UETJ5847AK27"
}
```

### 2. Check News Endpoint
```bash
curl https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/news
```

**Expected**: Should return 200 (not 500)

### 3. Check Logs
```bash
heroku logs --tail --app uetjkuat
```

Look for:
- ✅ No 500 errors on `/api/auth/register`
- ✅ No 500 errors on `/api/v1/news`
- ✅ Successful migration messages

---

## Troubleshooting

### If Migration Fails

**Error**: `SQLSTATE[42P01]: Undefined table`
**Solution**: Some migrations might be out of order. Check:
```bash
heroku run php artisan migrate:status --app uetjkuat
```

**Error**: `SQLSTATE[42701]: Duplicate column`
**Solution**: Column already exists. Safe to ignore or rollback:
```bash
heroku run php artisan migrate:rollback --step=1 --app uetjkuat
heroku run php artisan migrate --app uetjkuat
```

### If Registration Still Fails

1. **Check Database Connection**:
   ```bash
   heroku run php artisan tinker --app uetjkuat
   >>> DB::connection()->getPdo();
   ```

2. **Verify Columns Exist**:
   ```bash
   heroku run php artisan tinker --app uetjkuat
   >>> Schema::getColumnListing('users');
   ```

3. **Check Logs for Specific Error**:
   ```bash
   heroku logs --tail --app uetjkuat | grep "ERROR"
   ```

---

## Current Status

✅ **Code Fixed**: All registration system code is complete
✅ **Migrations Created**: Database migrations ready
✅ **Schema Fixed**: Invalid schema reference corrected
✅ **Committed**: Changes committed to git

⏳ **Pending**: Deploy to Heroku and run migrations

---

## Quick Deploy Command

```bash
# One-liner to deploy and migrate
git push heroku main && heroku run php artisan migrate --app uetjkuat
```

---

## Support

If you encounter any issues:

1. Check Heroku logs: `heroku logs --tail --app uetjkuat`
2. Verify migration status: `heroku run php artisan migrate:status --app uetjkuat`
3. Check database: `heroku run php artisan tinker --app uetjkuat`
4. Review error messages in browser console

---

## Summary

**What was fixed**:
- ✅ Invalid schema reference in tickets migration
- ✅ File naming issues (leading spaces)
- ✅ Complete registration system with member ID
- ✅ All user profile fields
- ✅ News model and migration
- ✅ Icon references

**What needs to be done**:
1. Deploy code to Heroku
2. Run migrations
3. Test registration endpoint
4. Verify all endpoints work

**Expected outcome**:
- Registration accepts all 9 fields
- Member ID auto-generated (format: UETJ####XY##)
- No more 500 errors
- Full user tracking across system
