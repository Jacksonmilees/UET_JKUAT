# ⚡ RUN THESE COMMANDS NOW

## Your Heroku App: `uetjkuat-54286e10a43b`

---

## 🚀 Option 1: Automated Setup (EASIEST)

Just double-click this file:
```
setup-heroku-otp.bat
```

**Done!** ✅

---

## 🔧 Option 2: Manual Commands

Copy and paste these commands one by one:

### 1. Set OTP Service URL
```bash
heroku config:set OTP_SERVICE_URL=http://localhost:5001 -a uetjkuat-54286e10a43b
```

### 2. Clear Config Cache
```bash
heroku run php artisan config:clear -a uetjkuat-54286e10a43b
```

### 3. Restart App
```bash
heroku restart -a uetjkuat-54286e10a43b
```

### 4. Verify Configuration
```bash
heroku config -a uetjkuat-54286e10a43b
```

You should see `OTP_SERVICE_URL` in the list.

---

## 📱 Start OTP Service

After configuring Heroku, start the OTP service:

### Option A: Quick Start
```bash
cd whatsapp-otp-service
start-otp-service.bat
```

### Option B: Manual
```bash
cd whatsapp-otp-service
npm install
npm start
```

**Then:**
1. Browser opens automatically
2. Scan WhatsApp QR code
3. Wait for "LOGIN SUCCESSFUL"
4. Keep window open

---

## ✅ Test It Works

### Test 1: Check Backend
```bash
curl https://uetjkuat-54286e10a43b.herokuapp.com/api/health
```

### Test 2: Check OTP Routes
```bash
curl https://uetjkuat-54286e10a43b.herokuapp.com/api/auth/otp/status
```

### Test 3: Full Login Flow
1. Go to: `https://uetjkuat-54286e10a43b.herokuapp.com`
2. Click Login
3. Click "OTP" tab
4. Enter email/phone
5. Check WhatsApp
6. Enter code
7. Login! 🎉

---

## 📊 Monitor

```bash
# View logs
heroku logs --tail -a uetjkuat-54286e10a43b

# Check status
heroku ps -a uetjkuat-54286e10a43b
```

---

## ✨ Summary

**Your Setup:**
- ✅ Backend: `https://uetjkuat-54286e10a43b.herokuapp.com`
- ✅ OTP Service: `http://localhost:5001`
- ✅ New Login: Password OR WhatsApp OTP

**What I've Configured:**
- ✅ OTP Controller (`OTPAuthController.php`)
- ✅ API Routes (`/api/auth/otp/*`)
- ✅ Frontend Login UI (Password/OTP toggle)
- ✅ WhatsApp OTP Service (rebranded from ImaraBuild)

**Just Run:**
1. `setup-heroku-otp.bat` - Configure Heroku
2. `start-otp-service.bat` - Start OTP service
3. Test login with OTP!

---

**Everything is ready! Just run the commands above.** 🚀
