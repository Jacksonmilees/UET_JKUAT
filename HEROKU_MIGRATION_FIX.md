# Heroku Migration Fix - Registration 422 Error

## Root Cause Identified ✅

The **422 Unprocessable Entity** errors are caused by **missing database migrations on Heroku**.

### Evidence from Migration Status:
```
Migration name                                                    Batch / Status  
2025_01_09_044703_create_accounts_table ........................ [6] Ran  
2025_01_09_044705_create_transactions_table .................... [9] Ran  
2025_01_09_044706_add_mpesa_columns_to_accounts_table ......... [11] Ran  
2025_01_09_090412_add_status_to_transactions_table ............ [11] Ran  
2025_01_09_101026_update_accounts_table_fix_unique_constraints  [11] Ran  
2025_01_15_143126_add_metadata_to_accounts_table ............... Pending  
2025_01_15_143128_create_withdrawals_table ..................... Pending  
2025_02_16_104415_create_members_table ......................... Pending  
2025_02_16_143140_create_tickets_table ......................... Pending  
2025_03_20_083942_updating_withdrawal_table .................... Pending  
2025_03_20_083950_create_fraud_alerts_table .................... Pending
```

**CRITICAL ISSUE:** The `users` table migrations are **NOT listed at all**:
- ❌ `0001_01_01_000000_create_users_table.php` - MISSING
- ❌ `2024_11_27_000001_add_profile_fields_to_users_table.php` - MISSING

This means:
1. The `users` table doesn't exist on Heroku
2. Registration attempts fail because there's no table to insert into
3. Laravel returns 422 validation errors (likely due to unique constraint checks failing)

## Additional Issues Found

### 1. Database Connection Error
```
[2025-11-27 12:02:49] production.ERROR: Database connection error 
{"error":"SQLSTATE[HY000] [2002] No such file or directory"}
```

### 2. Duplicate Table Error
```
SQLSTATE[42P07]: Duplicate table: 7 ERROR: relation "withdrawals" already exists
```
The `withdrawals` table exists but the migration thinks it's pending.

### 3. Missing Environment Variables
```
[2025-11-27 12:02:49] production.ERROR: WHATSAPP_PHONE_NUMBER_ID not set in environment.
[2025-11-27 12:02:49] production.ERROR: WHATSAPP_ACCESS_TOKEN not set in environment.
```

## Solution Steps

### Quick Fix (Run this now):

```powershell
# Run the fix script
.\fix-heroku-migrations.ps1
```

### Manual Steps:

#### Step 1: Check Heroku Git Remote
```bash
git remote -v
```
Should show:
```
heroku  https://git.heroku.com/uetjkuat.git (fetch)
heroku  https://git.heroku.com/uetjkuat.git (push)
```

If missing, add it:
```bash
heroku git:remote -a uetjkuat
```

#### Step 2: Push Latest Code to Heroku
```bash
git push heroku main
```

#### Step 3: Run Migrations
```bash
heroku run "php artisan migrate --force" -a uetjkuat
```

This should create:
- ✅ `users` table (base table)
- ✅ User profile fields (member_id, phone_number, etc.)
- ✅ Other pending tables

#### Step 4: Verify Migration Status
```bash
heroku run "php artisan migrate:status" -a uetjkuat
```

All migrations should show "Ran" status.

#### Step 5: Test Registration
```powershell
.\test-registration.ps1
```

Expected: **200 OK** with user data and member_id

## Why This Happened

The users table migrations likely weren't run on Heroku because:
1. They were created after the initial Heroku deployment
2. Migrations weren't run after pushing the code
3. The database was created but migrations weren't executed

## Verification Checklist

After running the fix:

- [ ] All migrations show "Ran" status
- [ ] `users` table exists in database
- [ ] Registration endpoint returns 200 (not 422)
- [ ] User can be created with member_id
- [ ] No database connection errors in logs

## Test Commands

```bash
# View real-time logs
heroku logs --tail -a uetjkuat

# Check database tables
heroku run "php artisan tinker --execute='echo implode(\"\n\", DB::select(\"SELECT tablename FROM pg_tables WHERE schemaname = \\\"public\\\"\"));'" -a uetjkuat

# Count users
heroku run "php artisan tinker --execute='echo \App\Models\User::count();'" -a uetjkuat

# Test database connection
heroku run "php artisan db:show" -a uetjkuat
```

## Expected Outcome

After fix:
1. ✅ Users table exists with all profile fields
2. ✅ Registration returns 200 with member_id
3. ✅ No validation errors
4. ✅ User data persists in database

## Troubleshooting

### If migrations still fail:

**Option A: Fresh migration (CAUTION - will drop all tables)**
```bash
heroku run "php artisan migrate:fresh --force" -a uetjkuat
```

**Option B: Rollback and re-run**
```bash
heroku run "php artisan migrate:rollback --force" -a uetjkuat
heroku run "php artisan migrate --force" -a uetjkuat
```

**Option C: Check database directly**
```bash
heroku pg:psql -a uetjkuat
# Then run: \dt to list tables
# Run: \d users to see users table structure
```

### If database connection errors persist:

```bash
# Check database URL
heroku config:get DATABASE_URL -a uetjkuat

# Verify database is attached
heroku addons -a uetjkuat

# Restart dynos
heroku restart -a uetjkuat
```

## Next Steps After Fix

1. **Deploy enhanced logging** (already done)
2. **Run migrations** (use fix script)
3. **Test registration** (should work now)
4. **Monitor logs** for any other issues
5. **Set missing env vars** (WhatsApp tokens if needed)

## Files Updated

- ✅ `app/Http/Controllers/API/AuthController.php` - Enhanced logging
- ✅ `deploy-to-heroku.ps1` - Correct app name
- ✅ `check-heroku-db.ps1` - Correct app name
- ✅ `fix-heroku-migrations.ps1` - New migration fix script
