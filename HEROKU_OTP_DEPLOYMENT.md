# 🚀 Deploy OTP Service to Heroku - Complete Guide

## Your Apps:
- **Main Backend:** `uetjkuat` → `https://uetjkuat.herokuapp.com`
- **OTP Service:** `uetjkuat-otp` → `https://uetjkuat-otp.herokuapp.com` (to be created)

---

## 🎯 Deployment Strategy

We'll deploy the OTP service as a **separate Heroku app** because:
- ✅ WhatsApp automation needs dedicated resources
- ✅ Can scale independently
- ✅ Easier to monitor and debug
- ✅ Backend just calls the OTP service API

---

## 📋 Step-by-Step Deployment

### Option 1: Automated (RECOMMENDED)

Just run this script:
```bash
deploy-otp-service-heroku.bat
```

This will:
1. Create `uetjkuat-otp` Heroku app
2. Add Puppeteer buildpack for WhatsApp automation
3. Deploy the OTP service
4. Configure main backend to use it
5. Done! ✅

### Option 2: Manual Deployment

#### Step 1: Navigate to OTP Service
```bash
cd whatsapp-otp-service
```

#### Step 2: Initialize Git (if not already)
```bash
git init
```

#### Step 3: Create Heroku App
```bash
heroku create uetjkuat-otp
```

#### Step 4: Add Buildpacks for Puppeteer
```bash
# Add Puppeteer buildpack (for Chrome/WhatsApp automation)
heroku buildpacks:add --index 1 https://github.com/jontewks/puppeteer-heroku-buildpack -a uetjkuat-otp

# Add Node.js buildpack
heroku buildpacks:add --index 2 heroku/nodejs -a uetjkuat-otp
```

#### Step 5: Set Environment Variables
```bash
heroku config:set NODE_ENV=production -a uetjkuat-otp
heroku config:set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true -a uetjkuat-otp
```

#### Step 6: Deploy
```bash
git add .
git commit -m "Deploy UET JKUAT OTP service"
heroku git:remote -a uetjkuat-otp
git push heroku main
```

#### Step 7: Configure Main Backend
```bash
cd ..
heroku config:set OTP_SERVICE_URL=https://uetjkuat-otp.herokuapp.com -a uetjkuat
heroku run php artisan config:clear -a uetjkuat
heroku restart -a uetjkuat
```

---

## ⚠️ Important: WhatsApp Authentication

**CRITICAL:** WhatsApp Web requires QR code scanning. On Heroku, this is challenging because:
- Heroku runs headless (no browser UI)
- Session needs to be authenticated once

### Solution Options:

#### Option A: Use WhatsApp Business API (Production)
For production, use official WhatsApp Business API:
- More reliable
- No QR scanning needed
- Costs money but worth it

#### Option B: Pre-authenticate Session Locally
1. Run OTP service locally first
2. Scan QR code
3. Session saved in `whatsapp_uet_jkuat_session/`
4. Upload session to Heroku (complex)

#### Option C: Use Alternative OTP Provider
Use SMS/Email OTP instead:
- Twilio for SMS
- SendGrid for Email
- More reliable on Heroku

---

## 🔧 Alternative: Keep OTP Service Local (SIMPLER)

Since WhatsApp automation is complex on Heroku, you can:

### Keep OTP Service Running Locally

1. **Run OTP service on your computer:**
   ```bash
   cd whatsapp-otp-service
   npm start
   ```

2. **Expose it to internet using ngrok:**
   ```bash
   ngrok http 5001
   ```

3. **Set Heroku to use ngrok URL:**
   ```bash
   heroku config:set OTP_SERVICE_URL=https://your-ngrok-url.ngrok.io -a uetjkuat
   ```

**Pros:**
- ✅ Easy to scan QR code
- ✅ Can see what's happening
- ✅ No Heroku complexity

**Cons:**
- ❌ Must keep computer running
- ❌ ngrok URL changes on restart

---

## 🎯 RECOMMENDED APPROACH

For now, let's use the **local + ngrok** approach:

### Step 1: Install ngrok
Download from: https://ngrok.com/download

### Step 2: Start OTP Service
```bash
cd whatsapp-otp-service
npm start
```

### Step 3: Expose with ngrok
```bash
ngrok http 5001
```

You'll get a URL like: `https://abc123.ngrok.io`

### Step 4: Configure Backend
```bash
heroku config:set OTP_SERVICE_URL=https://abc123.ngrok.io -a uetjkuat
heroku run php artisan config:clear -a uetjkuat
heroku restart -a uetjkuat
```

### Step 5: Test
```bash
curl https://uetjkuat.herokuapp.com/api/auth/otp/status
```

---

## 🧪 Testing

### Test OTP Service Directly
```bash
curl https://uetjkuat-otp.herokuapp.com/status
```

### Test Backend Integration
```bash
curl https://uetjkuat.herokuapp.com/api/auth/otp/status
```

### Test Full Flow
1. Go to: `https://uetjkuat.herokuapp.com`
2. Login page → OTP tab
3. Enter email/phone
4. Check WhatsApp
5. Enter code
6. Login! ✅

---

## 📊 Monitor Deployments

### OTP Service Logs
```bash
heroku logs --tail -a uetjkuat-otp
```

### Main Backend Logs
```bash
heroku logs --tail -a uetjkuat
```

### Check Configuration
```bash
# Main backend
heroku config -a uetjkuat | findstr OTP

# OTP service
heroku config -a uetjkuat-otp
```

---

## 🔄 Update OTP Service

When you make changes:

```bash
cd whatsapp-otp-service
git add .
git commit -m "Update OTP service"
git push heroku main
```

---

## 🐛 Troubleshooting

### Issue: Puppeteer fails on Heroku
**Solution:** Make sure buildpacks are in correct order:
```bash
heroku buildpacks -a uetjkuat-otp
```

Should show:
1. `https://github.com/jontewks/puppeteer-heroku-buildpack`
2. `heroku/nodejs`

### Issue: WhatsApp not authenticated
**Solution:** Use local + ngrok approach (see above)

### Issue: OTP service crashes
**Solution:** Check logs:
```bash
heroku logs --tail -a uetjkuat-otp
```

---

## ✅ Quick Commands Reference

```bash
# Deploy OTP service
deploy-otp-service-heroku.bat

# Configure backend
configure-backend-otp.bat

# Check OTP service
curl https://uetjkuat-otp.herokuapp.com/status

# Check backend integration
curl https://uetjkuat.herokuapp.com/api/auth/otp/status

# View logs
heroku logs --tail -a uetjkuat
heroku logs --tail -a uetjkuat-otp
```

---

## 🎉 Summary

**Your Setup:**
- Main Backend: `https://uetjkuat.herokuapp.com`
- OTP Service: `https://uetjkuat-otp.herokuapp.com` (or ngrok URL)

**Recommended for Now:**
Use **local OTP service + ngrok** until you're ready for WhatsApp Business API.

**For Production:**
Switch to WhatsApp Business API or SMS OTP provider.

---

**Ready to deploy? Run:** `deploy-otp-service-heroku.bat` or use the ngrok approach!
