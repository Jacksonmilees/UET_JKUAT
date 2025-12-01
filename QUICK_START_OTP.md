# 🚀 Quick Start - WhatsApp OTP Integration

## Deploy to Heroku (2 Minutes)

```bash
# Run this script
deploy-otp-to-heroku.bat

# Enter your Heroku app name when prompted
# Done! ✅
```

## Start OTP Service Locally (1 Minute)

```bash
cd whatsapp-otp-service
start-otp-service.bat

# Scan QR code with WhatsApp
# Wait for "LOGIN SUCCESSFUL"
# Done! ✅
```

## Test It Works

1. Open your app: `https://your-app.herokuapp.com`
2. Go to Login page
3. Click **"OTP"** tab
4. Enter email or phone
5. Check WhatsApp for code
6. Enter code
7. Login successful! ✅

## Commands Cheat Sheet

```bash
# Deploy to Heroku
git add . && git commit -m "OTP integration" && git push heroku main

# Start OTP service
cd whatsapp-otp-service && npm start

# Check OTP status
curl http://localhost:5001/status

# Check Heroku logs
heroku logs --tail

# Set Heroku config
heroku config:set OTP_SERVICE_URL=http://localhost:5001
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| OTP not sending | Check `http://localhost:5001/status` |
| WhatsApp not logged in | Scan QR code again |
| Service not starting | Check port 5001 is free |
| User not found | User must register first |

## Files You Need

✅ All files are already created and ready!

Just run:
1. `deploy-otp-to-heroku.bat` - Deploy to Heroku
2. `start-otp-service.bat` - Start OTP service

## That's It!

Your WhatsApp OTP authentication is ready to use! 🎉
