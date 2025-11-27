# Registration Endpoint Debugging Guide

## Problem Summary
The `/api/auth/register` endpoint is returning **422 Unprocessable Entity** errors consistently.

## Error Logs
```
2025-11-27T11:53:07 heroku[router]: method=POST path="/api/auth/register" status=422
2025-11-27T11:53:11 heroku[router]: method=POST path="/api/auth/register" status=422
```

## Changes Made

### 1. Enhanced Error Logging in AuthController
**File:** `app/Http/Controllers/API/AuthController.php`

Added comprehensive logging to track:
- Incoming request data (excluding password)
- Content-Type headers
- Validation errors with full details
- Database errors during user creation
- Successful registrations

### 2. Exception Handling
Wrapped user creation in try-catch block to capture and log any database errors.

## Debugging Steps

### Step 1: Check Heroku Logs
```bash
heroku logs --tail
```
Look for:
- `Registration attempt` - Shows incoming request data
- `Registration validation failed` - Shows which fields failed validation
- `Registration failed` - Shows database or other errors
- `User registered successfully` - Confirms successful registration

### Step 2: Verify Database Migrations
```bash
# Check migration status
heroku run php artisan migrate:status

# Run migrations if needed
heroku run php artisan migrate --force

# Verify database connection
heroku run php artisan db:show
```

### Step 3: Check Database Schema
Ensure the `users` table has these columns:
- `member_id` (string, unique, nullable)
- `phone_number` (string, nullable)
- `year_of_study` (string, nullable)
- `course` (string, nullable)
- `college` (string, nullable)
- `admission_number` (string, unique, nullable)
- `ministry_interest` (string, nullable)
- `residence` (string, nullable)
- `role` (string, default: 'user')
- `status` (string, default: 'active')
- `avatar` (string, nullable)
- `registration_completed_at` (timestamp, nullable)

### Step 4: Test Registration Locally
```bash
# Run local server
php artisan serve

# In another terminal, test registration
.\test-registration.ps1
```

### Step 5: Run Debug Script
```powershell
.\debug-registration.ps1
```
This will test multiple scenarios:
- Full registration data
- Minimal registration data
- Invalid email
- Short password

## Common Issues & Solutions

### Issue 1: Migrations Not Run on Heroku
**Solution:**
```bash
heroku run php artisan migrate --force
```

### Issue 2: Database Connection Error
**Solution:**
```bash
# Check database config
heroku config:get DATABASE_URL

# Verify database is attached
heroku addons
```

### Issue 3: Validation Failing on Required Fields
**Check the logs for:**
```
Registration validation failed
errors: { "field_name": ["error message"] }
```

**Required fields:**
- `name` (string, max 255)
- `email` (valid email, unique)
- `password` (string, min 6)

**Optional fields:**
- All other fields are nullable

### Issue 4: Unique Constraint Violation
If email or admission_number already exists:
```
errors: { 
  "email": ["The email has already been taken."],
  "admissionNumber": ["The admission number has already been taken."]
}
```

## Deployment Process

### 1. Deploy Changes
```powershell
.\deploy-to-heroku.ps1
```

### 2. Monitor Deployment
```bash
heroku logs --tail
```

### 3. Test Registration
```powershell
.\test-registration.ps1
```

## Expected Response

### Success (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "member_id": "UETJ1234AB27",
      "name": "Test User",
      "email": "test@example.com",
      "phone_number": "0712345678",
      "year_of_study": "Year 2",
      "course": "Computer Science",
      "college": "JKUAT",
      "admission_number": "SCT211-1234/2023",
      "ministry_interest": "Media & Communications",
      "residence": "Juja",
      "role": "user",
      "status": "active"
    },
    "token": "..."
  },
  "message": "Registration successful! Your member ID is: UETJ1234AB27"
}
```

### Validation Error (422)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 6 characters."]
  }
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Registration failed: [error details]"
}
```

## Next Steps

1. **Deploy the enhanced logging:**
   ```powershell
   .\deploy-to-heroku.ps1
   ```

2. **Monitor logs during registration attempt:**
   ```bash
   heroku logs --tail
   ```

3. **Test registration:**
   ```powershell
   .\test-registration.ps1
   ```

4. **Check logs for specific error:**
   - If validation error: Check which field is failing
   - If database error: Check migration status
   - If other error: Review full stack trace in logs

## Useful Commands

```bash
# View environment variables
heroku config

# Access Heroku bash
heroku run bash

# Check PHP version
heroku run php -v

# Clear cache
heroku run php artisan cache:clear
heroku run php artisan config:clear

# Restart dynos
heroku restart
```

## Contact & Support
If issues persist after following this guide, check:
1. Heroku logs for detailed error messages
2. Database connection and migrations
3. Environment variables configuration
4. CORS settings in `config/cors.php`
