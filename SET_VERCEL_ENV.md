# 🚨 URGENT: Set Vercel Environment Variable

## Problem:
Your Vercel deployment is using the OLD Render URL instead of the new Heroku backend.

## Solution:

### Go to Vercel Dashboard and Add Environment Variable:

1. **Open:** https://vercel.com/dashboard
2. **Select Project:** `uet-jkuat`
3. **Click:** Settings (left sidebar)
4. **Click:** Environment Variables
5. **Add New Variable:**
   ```
   Name:  VITE_API_URL
   Value: https://uetjkuat.herokuapp.com/api
   ```
6. **Select Environments:** ✅ Production ✅ Preview ✅ Development
7. **Click:** Save
8. **Redeploy:**
   - Go to "Deployments" tab
   - Click ⋮ (3 dots) on latest deployment
   - Click "Redeploy"
   - Wait for deployment to complete

## After Redeployment:

1. Clear browser cache or use Incognito
2. Go to https://uet-jkuat.vercel.app
3. Try OTP login with:
   - Email: `imarabuild@gmail.com`
   - OR Phone: `0700088271`
4. Should now connect to Heroku backend ✅

---

## Why This Happened:

The `.env` file is NOT deployed to Vercel (it's in `.gitignore`).
You must set environment variables in Vercel Dashboard.

The code uses:
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://uetjkuat.herokuapp.com/api';
```

Without `VITE_API_URL` set on Vercel, it falls back to the hardcoded Heroku URL, but the service worker cached the old Render URL.

---

## Quick Test (After Setting Env Var):

```bash
# Test backend is working
curl https://uetjkuat.herokuapp.com/api/auth/otp/status
```

Should return OTP service status.
