# M-Pesa Production Setup Guide

## 🎉 Congratulations!

You've been approved for **M-Pesa Production API**! The Safaricom message shows your production URLs are ready.

## ⚠️ Current Issue

**Error:** "Invalid Access Token" (404.001.03)

**Root Cause:** You're likely using:
- Sandbox credentials with production environment, OR
- Production credentials with sandbox environment, OR
- Wrong consumer key/secret

## 🔧 Solution: Switch to Production

### Step 1: Update Environment Variables in Heroku

You need to set these in Heroku Dashboard → Settings → Config Vars:

```bash
# Change from sandbox to production
MPESA_ENV=production

# Use your PRODUCTION credentials (not sandbox)
MPESA_CONSUMER_KEY=your_production_consumer_key
MPESA_CONSUMER_SECRET=your_production_consumer_secret

# Production URLs (from Safaricom message)
MPESA_B2C_URL=https://api.safaricom.co.ke/mpesa/b2c/v3/paymentrequest
MPESA_TOKEN_URL=https://api.safaricom.co.ke/oauth/v1/generate

# Your production shortcode and passkey
MPESA_SHORTCODE=your_production_shortcode
MPESA_PASSKEY=your_production_passkey
```

### Step 2: Production URLs (from Safaricom)

Based on the Safaricom message, use these URLs:

**For STK Push:**
- OAuth Token: `https://api.safaricom.co.ke/oauth/v1/generate`
- STK Push: `https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest`
- STK Query: `https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query`

**For B2C (Withdrawals):**
- B2C: `https://api.safaricom.co.ke/mpesa/b2c/v3/paymentrequest`
- OAuth Token: `https://api.safaricom.co.ke/oauth/v1/generate`

### Step 3: Update Callback URLs

Make sure callback URLs are publicly accessible:

```
MPESA_CALLBACK_URL=https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/mpesa/callback
MPESA_B2C_RESULT_URL=https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/b2c/result
MPESA_B2C_TIMEOUT_URL=https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/b2c/timeout
```

**Important:** These URLs must be:
- ✅ HTTPS (required for production)
- ✅ Publicly accessible (no authentication)
- ✅ Registered with Safaricom (if required)

### Step 4: Get Your Production Credentials

From the Safaricom Developer Portal:
1. Log in to https://developer.safaricom.co.ke
2. Go to your app
3. Get your **Production** credentials:
   - Consumer Key
   - Consumer Secret
   - Shortcode
   - Passkey
   - Initiator Name
   - Security Credential

### Step 5: Update Heroku Config Vars

Run the updated script or set manually:

```bash
heroku config:set MPESA_ENV=production --app uetjkuat
heroku config:set MPESA_CONSUMER_KEY=your_production_key --app uetjkuat
heroku config:set MPESA_CONSUMER_SECRET=your_production_secret --app uetjkuat
# ... etc
```

### Step 6: Clear Config Cache

```bash
heroku run php artisan config:clear --app uetjkuat
```

## 🔍 Current Configuration Check

Check what you have set:
```bash
heroku config --app uetjkuat | grep MPESA
```

**Should show:**
- `MPESA_ENV=production` (not sandbox)
- Production consumer key/secret
- Production URLs

## ⚠️ Important Notes

1. **Sandbox vs Production:**
   - Sandbox: For testing, uses test credentials
   - Production: For real transactions, uses real credentials

2. **Credentials Don't Mix:**
   - ❌ Don't use sandbox credentials with production environment
   - ❌ Don't use production credentials with sandbox environment
   - ✅ Use matching credentials and environment

3. **Callback URLs:**
   - Must be HTTPS in production
   - Must be publicly accessible
   - May need to be registered with Safaricom

4. **Testing:**
   - Test with small amounts first
   - Monitor logs carefully
   - Production transactions are REAL (cost real money)

## 🧪 Testing After Switch

1. **Test Token Generation:**
   ```bash
   heroku run php artisan tinker --app uetjkuat
   # Then test token generation
   ```

2. **Test STK Push:**
   - Use a real phone number
   - Use small amount for testing
   - Check logs for errors

3. **Monitor Logs:**
   ```bash
   heroku logs --tail --app uetjkuat | grep -i mpesa
   ```

## 📋 Checklist

- [ ] Get production credentials from Safaricom
- [ ] Set `MPESA_ENV=production` in Heroku
- [ ] Set production consumer key/secret
- [ ] Set production shortcode and passkey
- [ ] Update URLs to production (already in code, but verify)
- [ ] Verify callback URLs are HTTPS and accessible
- [ ] Clear config cache
- [ ] Test token generation
- [ ] Test STK push with small amount

## 🎯 Summary

**The "Invalid Access Token" error is because:**
- You're approved for production but still using sandbox credentials/environment
- OR credentials are incorrect

**Fix:**
1. Switch `MPESA_ENV` to `production`
2. Use production credentials from Safaricom
3. Ensure callback URLs are correct

After switching to production credentials, the STK push should work!

