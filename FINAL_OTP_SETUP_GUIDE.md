# 🎯 FINAL OTP Setup Guide - Choose Your Approach

## Your Heroku App: `uetjkuat`
**Backend URL:** `https://uetjkuat.herokuapp.com`

---

## 🚀 Two Deployment Options

### ⭐ Option 1: Local OTP Service + ngrok (RECOMMENDED - EASIEST)

**Best for:** Development, testing, getting started quickly

**How it works:**
1. OTP service runs on your computer
2. ngrok exposes it to the internet
3. Heroku backend calls your local service via ngrok URL

**Pros:**
- ✅ Easy to set up (5 minutes)
- ✅ Can scan WhatsApp QR code easily
- ✅ See everything happening in real-time
- ✅ No Heroku complexity

**Cons:**
- ❌ Must keep computer running
- ❌ ngrok URL changes when you restart

**Setup Steps:**

1. **Install ngrok** (one-time)
   - Download: https://ngrok.com/download
   - Extract to a folder in your PATH

2. **Run the setup script:**
   ```bash
   setup-otp-with-ngrok.bat
   ```

3. **Copy your ngrok URL** (from the ngrok window)
   Example: `https://abc123.ngrok.io`

4. **Configure Heroku:**
   ```bash
   heroku config:set OTP_SERVICE_URL=https://YOUR-NGROK-URL -a uetjkuat
   heroku run php artisan config:clear -a uetjkuat
   heroku restart -a uetjkuat
   ```

5. **Scan WhatsApp QR code** (in OTP service window)

6. **Test it:**
   ```bash
   curl https://uetjkuat.herokuapp.com/api/auth/otp/status
   ```

**Done!** ✅

---

### 🏢 Option 2: Deploy OTP Service to Heroku

**Best for:** Production, always-on service

**How it works:**
1. OTP service runs as separate Heroku app
2. Backend calls OTP service via Heroku URL
3. Both apps run 24/7

**Pros:**
- ✅ Always available
- ✅ No need to keep computer running
- ✅ Professional setup

**Cons:**
- ❌ WhatsApp QR scanning is complex on Heroku
- ❌ Session management is tricky
- ❌ May need WhatsApp Business API (costs money)

**Setup Steps:**

1. **Run deployment script:**
   ```bash
   deploy-otp-service-heroku.bat
   ```

2. **This creates:**
   - New Heroku app: `uetjkuat-otp`
   - URL: `https://uetjkuat-otp.herokuapp.com`
   - Automatically configures main backend

3. **Challenge: WhatsApp Authentication**
   - Heroku runs headless (no browser)
   - Can't easily scan QR code
   - Need to use WhatsApp Business API or pre-authenticate session

**For Production:** Consider using:
- WhatsApp Business API (official, reliable)
- SMS OTP (Twilio, Africa's Talking)
- Email OTP (SendGrid, Mailgun)

---

## 🎯 My Recommendation

### For Now (Development/Testing):
**Use Option 1: Local + ngrok**

It's the easiest and fastest way to get OTP working right now.

### For Production (Later):
**Switch to SMS or Email OTP**

WhatsApp automation on Heroku is complex. SMS/Email OTP is more reliable:

```php
// Example: Switch to SMS OTP
// In OTPAuthController.php
$sms = new AfricasTalking(); // or Twilio
$sms->send($phone, "Your OTP: $otp");
```

---

## 📋 Complete Setup Commands

### Option 1: Local + ngrok (Quick Start)

```bash
# 1. Run setup script
setup-otp-with-ngrok.bat

# 2. Get ngrok URL from the ngrok window
# Example: https://abc123.ngrok.io

# 3. Configure Heroku (replace with YOUR ngrok URL)
heroku config:set OTP_SERVICE_URL=https://abc123.ngrok.io -a uetjkuat
heroku run php artisan config:clear -a uetjkuat
heroku restart -a uetjkuat

# 4. Test
curl https://uetjkuat.herokuapp.com/api/auth/otp/status
```

### Option 2: Deploy to Heroku

```bash
# 1. Deploy OTP service
deploy-otp-service-heroku.bat

# 2. Configure backend (automatic)
# Backend URL: https://uetjkuat.herokuapp.com
# OTP Service URL: https://uetjkuat-otp.herokuapp.com

# 3. Test
curl https://uetjkuat-otp.herokuapp.com/status
curl https://uetjkuat.herokuapp.com/api/auth/otp/status
```

---

## 🧪 Testing Your Setup

### Test 1: Check Backend
```bash
curl https://uetjkuat.herokuapp.com/api/health
```

### Test 2: Check OTP Service Status
```bash
curl https://uetjkuat.herokuapp.com/api/auth/otp/status
```

### Test 3: Request OTP (requires user to exist)
```bash
curl -X POST https://uetjkuat.herokuapp.com/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d "{\"identifier\": \"test@uetjkuat.com\"}"
```

### Test 4: Full Login Flow
1. Go to: `https://uetjkuat.herokuapp.com`
2. Click Login
3. Switch to "OTP" tab
4. Enter email or phone
5. Check WhatsApp for code
6. Enter code
7. Login successful! ✅

---

## 📊 Monitor Your Setup

### View Backend Logs
```bash
heroku logs --tail -a uetjkuat
```

### View OTP Service Logs (if deployed to Heroku)
```bash
heroku logs --tail -a uetjkuat-otp
```

### Check Configuration
```bash
heroku config -a uetjkuat | findstr OTP
```

---

## 🔄 Daily Workflow (Option 1: Local + ngrok)

### Each time you start working:

1. **Start OTP service:**
   ```bash
   cd whatsapp-otp-service
   npm start
   ```

2. **Start ngrok:**
   ```bash
   ngrok http 5001
   ```

3. **Update Heroku** (if ngrok URL changed):
   ```bash
   heroku config:set OTP_SERVICE_URL=https://NEW-NGROK-URL -a uetjkuat
   heroku restart -a uetjkuat
   ```

4. **Scan WhatsApp QR** (if needed)

5. **Start coding!** 🚀

---

## 🐛 Troubleshooting

### ngrok URL keeps changing
**Solution:** Get ngrok paid plan for static URL, or use Option 2

### WhatsApp session expired
**Solution:** Restart OTP service and scan QR again

### Backend can't reach OTP service
**Solution:** 
- Check ngrok is running
- Verify OTP_SERVICE_URL in Heroku config
- Check firewall settings

### User not found error
**Solution:** User must register first before using OTP login

---

## ✅ What's Already Done

I've already configured:
- ✅ Backend OTP controller (`OTPAuthController.php`)
- ✅ API routes (`/api/auth/otp/*`)
- ✅ Frontend login UI (Password/OTP toggle)
- ✅ WhatsApp OTP service (rebranded from ImaraBuild)
- ✅ All deployment scripts

**Just choose your option and run the setup!**

---

## 🎉 Summary

**Your Apps:**
- Main Backend: `uetjkuat` → `https://uetjkuat.herokuapp.com`
- OTP Service: Local (ngrok) or `uetjkuat-otp` (Heroku)

**Recommended:**
Start with **Option 1 (Local + ngrok)** for quick testing.

**Scripts Ready:**
- `setup-otp-with-ngrok.bat` - Local setup
- `deploy-otp-service-heroku.bat` - Heroku deployment
- `configure-backend-otp.bat` - Backend configuration

**Everything is ready! Just pick your option and run the script!** 🚀
