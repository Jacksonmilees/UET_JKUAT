# M-Pesa Callback URL Fix

## Problem Identified

The M-Pesa STK push is using `route('mpesa.callback')` which might generate:
- Wrong URL if `APP_URL` is not set correctly
- Relative URL instead of absolute URL
- Localhost URL instead of Heroku URL

## Fix Applied

Updated `MpesaController.php` to:
1. ✅ First try to use `MPESA_CALLBACK_URL` from config (set in Heroku)
2. ✅ Fall back to route helper if config not available
3. ✅ Validate it's a full URL
4. ✅ Construct from `APP_URL` if it's not a valid URL
5. ✅ Added logging to see what callback URL is being used

## Current Callback URL in Heroku

You have set:
```
MPESA_CALLBACK_URL=https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/mpesa/callback
```

This should now be used correctly!

## However: "Invalid Access Token" Error

**Important:** The "Invalid Access Token" error happens **BEFORE** the callback URL is used. This error occurs when:
1. Getting the access token from M-Pesa OAuth endpoint
2. The callback URL is only used when sending the STK push request

So the callback URL might not be the main issue, but it's good to fix it anyway.

## The Real Issue: Access Token Generation

The "Invalid Access Token" error (404.001.03) means:
- M-Pesa rejected the access token
- This happens when the token generation fails or credentials are wrong

**Check:**
1. Are `MPESA_CONSUMER_KEY` and `MPESA_CONSUMER_SECRET` correct?
2. Is `MPESA_ENV` set to `sandbox` (for testing)?
3. Do sandbox credentials need to be refreshed?

## After Deploying the Fix

The improved logging will show:
- What callback URL is being sent to M-Pesa
- Detailed error messages from token generation
- This will help identify if it's credentials or callback URL

## Testing

After deploying, check Heroku logs:
```bash
heroku logs --tail --app uetjkuat | grep -i "mpesa\|callback"
```

You should see:
- The callback URL being used
- Token generation errors (if any)
- STK push request details

## Summary

✅ **Callback URL fix applied** - Now uses config value correctly
⚠️ **Main issue is likely M-Pesa credentials** - Check token generation errors in logs

The callback URL fix ensures M-Pesa can reach your callback endpoint, but the "Invalid Access Token" error suggests the credentials might be wrong.


