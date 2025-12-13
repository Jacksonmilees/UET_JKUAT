# Fixes for Manifest 401 Error and Payment Flow Issues

**Date**: 2025-12-13
**Branch**: claude/fix-manifest-401-error-01Tmf87ni3skcjSB5RxzYh7B

## Issues Fixed

### 1. Manifest.json 401 Error on Vercel

**Problem**: The frontend was showing a 401 error when trying to fetch `/manifest.json`:
```
Failed to load resource: the server responded with a status of 401 ()
Manifest fetch from https://uet-jkuat-nxuyf1vs3-jacksons-projects-40b2815b.vercel.app/manifest.json failed, code 401
```

**Root Cause**: Vercel's rewrite rules were catching all requests including static assets like manifest.json, and the security headers weren't properly configured for public assets.

**Fix**: Updated `/uetjkuat-funding-platform/vercel.json` to:
- Add specific headers for `manifest.json` with proper content type and CORS
- Add specific headers for `/icons/*` with cache control and CORS
- Set `"public": true` to ensure assets are publicly accessible

**Files Changed**:
- `uetjkuat-funding-platform/vercel.json`

---

### 2. Account Recharge Flow - Missing Payment Verification

**Problem**: When users initiated account recharge via STK push, the frontend:
- Initiated the payment successfully
- Did NOT wait for payment verification
- Did NOT show the transaction in user's reports
- Left users uncertain if payment was successful

**Root Cause**: No endpoint existed for the frontend to check the status of a recharge contribution after initiating payment.

**Fix**: Added new endpoint to check contribution status:
- **Endpoint**: `GET /api/v1/recharge/contribution/{contributionId}/status`
- **Access**: Public (no authentication required)
- **Returns**: Contribution status, amount, M-Pesa receipt, timestamps

**How It Works**:
1. Frontend initiates payment and receives `contribution_id`
2. Frontend polls the new status endpoint every few seconds
3. Backend checks M-Pesa callback updates and returns current status
4. When status is "completed", frontend shows success and transaction details

**Files Changed**:
- `app/Http/Controllers/API/AccountRechargeController.php` - Added `checkContributionStatus()` method
- `routes/api.php` - Added route for contribution status endpoint

**Backend Already Handles**:
- M-Pesa callback updates contribution status to 'completed'
- Adds amount to user's wallet via `addToWallet()`
- Creates notification for user
- Logs transaction properly

---

### 3. Mandatory Payment Status Confirmation

**Problem**: When users paid mandatory semester contribution:
- Payment was processed by M-Pesa callback
- Transaction status was updated to 'completed'
- Account balance was updated
- BUT user's `mandatory_paid_current_semester` flag was NOT updated
- User remained locked out even after successful payment

**Root Cause**: The M-Pesa callback handler updated transaction and account, but didn't update the semester-related flags on the User model.

**Fix**: Enhanced M-Pesa callback handler to:
- Check if payment is for mandatory contribution
- Get active semester
- Update user's `current_semester_id`
- Set `mandatory_paid_current_semester` to `true`
- Record `mandatory_paid_at` timestamp
- Log completion with semester details

**Files Changed**:
- `app/Http/Controllers/API/MpesaCallbackController.php` - Updated `processStkPushCallback()` method

**Flow Now**:
1. User initiates mandatory payment via `/api/v1/onboarding/initiate`
2. STK push is sent to user's phone
3. User approves payment
4. M-Pesa calls back to `/api/v1/payments/mpesa/callback`
5. Callback handler:
   - Updates transaction status to 'completed'
   - Updates account balance
   - Updates user status to 'active'
   - **NEW**: Updates semester payment flags
6. Frontend polls `/api/v1/onboarding/status` to confirm payment
7. User is granted full access

---

## Database Migration Issues

### API 500 Errors on Production

**Problem**: Multiple API endpoints returning 500 errors:
- `/api/v1/notifications/unread-count`
- `/api/v1/merchandise`
- `/api/v1/tickets/completed/all`
- `/api/v1/semesters`

**Probable Root Cause**: Database tables don't exist on Heroku (migrations not run).

**Required Migrations**:
```bash
2024_12_07_001_create_semesters_table.php
2024_12_07_002_create_notifications_table.php
2025_02_16_143140_create_tickets_table.php
2025_12_10_000001_create_merchandise_table.php
```

**Action Required on Heroku**:
```bash
# SSH into Heroku dyno
heroku run bash -a uetjkuat

# Run migrations
php artisan migrate --force

# Verify tables exist
php artisan tinker
>>> DB::table('notifications')->count();
>>> DB::table('merchandise')->count();
>>> DB::table('semesters')->count();
>>> DB::table('tickets')->count();
```

**Fallback Error Handling**: Some controllers already have try-catch blocks that return empty arrays on errors (e.g., MerchandiseController), but this should be a temporary measure.

---

## Testing Checklist

### Frontend (Vercel Deployment)

- [ ] Verify manifest.json loads without 401 error
- [ ] Check Service Worker registers successfully
- [ ] Confirm PWA install prompt works
- [ ] Test icons load correctly

### Account Recharge Flow

- [ ] Create recharge token via `/api/v1/recharge-tokens`
- [ ] Access recharge link `/api/v1/recharge/{token}`
- [ ] Initiate payment via `/api/v1/recharge/{token}/pay`
- [ ] Poll status via `/api/v1/recharge/contribution/{id}/status`
- [ ] Verify status changes from 'pending' to 'completed'
- [ ] Check wallet balance increases
- [ ] Verify notification is created
- [ ] Confirm transaction appears in reports

### Mandatory Payment Flow

- [ ] New user initiates mandatory payment
- [ ] Approve STK push on phone
- [ ] Poll `/api/v1/onboarding/status` endpoint
- [ ] Verify `paid` field changes to `true`
- [ ] Confirm user can access full platform
- [ ] Check database: `mandatory_paid_current_semester = true`
- [ ] Verify `mandatory_paid_at` timestamp is set
- [ ] Confirm `current_semester_id` is set correctly

### Database & API Health

- [ ] Run migrations on Heroku: `heroku run php artisan migrate --force`
- [ ] Test all API endpoints return proper responses
- [ ] Verify no 500 errors on production
- [ ] Check Laravel logs for errors

---

## Implementation Notes

### Contribution Status Endpoint Usage

**Frontend Implementation Example**:
```javascript
async function checkPaymentStatus(contributionId) {
  const maxAttempts = 20; // 1 minute (20 * 3 seconds)
  let attempts = 0;

  const checkStatus = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/recharge/contribution/${contributionId}/status`
      );
      const data = await response.json();

      if (data.success && data.data.status === 'completed') {
        // Payment successful!
        showSuccessMessage(data.data);
        return true;
      } else if (data.data.status === 'failed') {
        // Payment failed
        showErrorMessage('Payment failed. Please try again.');
        return true;
      }

      // Still pending, continue polling
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkStatus, 3000); // Check again in 3 seconds
      } else {
        showWarningMessage('Payment verification timed out. Check your account later.');
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  checkStatus();
}
```

### Mandatory Payment Status Polling

**Frontend Implementation Example**:
```javascript
async function pollMandatoryPaymentStatus(checkoutRequestId) {
  const maxAttempts = 40; // 2 minutes (40 * 3 seconds)
  let attempts = 0;

  const checkStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/onboarding/status`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.success && data.data.paid) {
        // Payment confirmed!
        redirectToDashboard();
        return true;
      }

      // Still pending, continue polling
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkStatus, 3000);
      } else {
        showErrorMessage('Payment verification timed out.');
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  checkStatus();
}
```

---

## Deployment Instructions

### 1. Deploy Frontend (Vercel)

The vercel.json changes will take effect on next deployment:

```bash
cd uetjkuat-funding-platform
git add vercel.json
git commit -m "Fix manifest.json 401 error with proper Vercel configuration"
git push origin claude/fix-manifest-401-error-01Tmf87ni3skcjSB5RxzYh7B
```

Vercel will auto-deploy on push. Verify:
- Manifest.json loads successfully
- No 401 errors in console

### 2. Deploy Backend (Heroku)

```bash
# Commit backend changes
git add app/Http/Controllers/API/AccountRechargeController.php
git add app/Http/Controllers/API/MpesaCallbackController.php
git add routes/api.php
git commit -m "Add recharge status endpoint and fix mandatory payment confirmation"
git push origin claude/fix-manifest-401-error-01Tmf87ni3skcjSB5RxzYh7B

# Deploy to Heroku (if auto-deploy is not enabled)
git push heroku claude/fix-manifest-401-error-01Tmf87ni3skcjSB5RxzYh7B:main

# Run migrations
heroku run php artisan migrate --force -a uetjkuat

# Verify deployment
heroku logs --tail -a uetjkuat
```

### 3. Verify All Fixes

Test each fixed feature as per the testing checklist above.

---

## Additional Recommendations

### 1. Add Frontend Status Polling

Update the frontend recharge and mandatory payment flows to use the new status endpoints with polling logic as shown in the implementation examples.

### 2. Monitor M-Pesa Callbacks

Set up monitoring for M-Pesa callback failures:
```bash
# Check Laravel logs regularly
heroku logs --tail -a uetjkuat | grep "M-PESA CALLBACK"
```

### 3. Database Backup

Before running migrations on production:
```bash
# Backup Heroku Postgres database
heroku pg:backups:capture -a uetjkuat
heroku pg:backups:download -a uetjkuat
```

### 4. Add Health Check for Tables

Consider adding a health check endpoint that verifies all required tables exist:
```php
Route::get('/health/database', function () {
    $tables = ['users', 'accounts', 'transactions', 'notifications',
               'merchandise', 'semesters', 'tickets'];
    $status = [];

    foreach ($tables as $table) {
        try {
            DB::table($table)->count();
            $status[$table] = 'OK';
        } catch (\Exception $e) {
            $status[$table] = 'MISSING';
        }
    }

    return response()->json(['tables' => $status]);
});
```

---

## Support & Rollback

### Rollback Procedure

If issues arise:

```bash
# Rollback Heroku deployment
heroku releases:rollback -a uetjkuat

# Rollback Vercel deployment via dashboard
# Or redeploy previous commit:
vercel --prod
```

### Get Help

Check logs for errors:
```bash
# Backend logs
heroku logs --tail -a uetjkuat

# Frontend logs
vercel logs uetjkuat-funding-platform
```

---

## Summary

This fix addresses three critical production issues:

1. ✅ **Manifest 401 Error**: Fixed Vercel configuration for public assets
2. ✅ **Recharge Verification**: Added status check endpoint for payment confirmation
3. ✅ **Mandatory Payment**: Fixed callback to update semester payment flags

All fixes are backward compatible and include proper error handling. The changes improve user experience by providing clear payment status feedback and ensuring users aren't locked out after successful payments.
