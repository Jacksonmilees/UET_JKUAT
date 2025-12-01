# ⚡ START HERE - OTP Setup for uetjkuat

## Your Heroku App: `uetjkuat`
**URL:** `https://uetjkuat.herokuapp.com`

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install ngrok (one-time)
Download: https://ngrok.com/download

### Step 2: Run setup script
```bash
setup-otp-with-ngrok.bat
```

### Step 3: Copy ngrok URL
Look in the ngrok window for something like:
```
Forwarding: https://abc123.ngrok.io -> http://localhost:5001
```

### Step 4: Configure Heroku (replace with YOUR URL)
```bash
heroku config:set OTP_SERVICE_URL=https://abc123.ngrok.io -a uetjkuat
heroku run php artisan config:clear -a uetjkuat
heroku restart -a uetjkuat
```

### Step 5: Scan WhatsApp QR code
In the OTP service window, scan the QR code with your phone.

### Step 6: Test!
```bash
curl https://uetjkuat.herokuapp.com/api/auth/otp/status
```

**Done!** ✅

---

## 📱 How Users Login with OTP

1. Go to `https://uetjkuat.herokuapp.com`
2. Click Login
3. Click "OTP" tab
4. Enter email or phone number
5. Get 6-digit code on WhatsApp
6. Enter code
7. Logged in! ✅

---

## 🔄 Daily Workflow

Each time you start working:

1. Run: `setup-otp-with-ngrok.bat`
2. Copy new ngrok URL
3. Update Heroku:
   ```bash
   heroku config:set OTP_SERVICE_URL=https://NEW-URL -a uetjkuat
   heroku restart -a uetjkuat
   ```
4. Scan WhatsApp QR if needed
5. Start coding! 🚀

---

## 📚 Full Documentation

- `FINAL_OTP_SETUP_GUIDE.md` - Complete guide with 2 options
- `HEROKU_OTP_DEPLOYMENT.md` - Detailed deployment info
- `whatsapp-otp-service/README.md` - OTP service docs

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| ngrok not found | Install from https://ngrok.com/download |
| WhatsApp not logged in | Scan QR code in OTP service window |
| Backend can't reach OTP | Check ngrok is running, update Heroku URL |
| User not found | User must register first |

---

## ✅ What's Already Done

- ✅ Backend API ready (`uetjkuat`)
- ✅ OTP controller created
- ✅ Frontend login UI updated
- ✅ WhatsApp OTP service ready
- ✅ All scripts created

**Just run:** `setup-otp-with-ngrok.bat` and follow the steps above!

---

**Questions? Check:** `FINAL_OTP_SETUP_GUIDE.md`
