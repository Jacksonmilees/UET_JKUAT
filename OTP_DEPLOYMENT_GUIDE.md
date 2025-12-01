# WhatsApp OTP Integration - Heroku Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Add OTP Service URL to Heroku Config

```bash
# Set the OTP service URL environment variable
heroku config:set OTP_SERVICE_URL=http://localhost:5001 -a your-heroku-app-name

# Or if you deploy OTP service separately:
heroku config:set OTP_SERVICE_URL=https://your-otp-service.herokuapp.com -a your-heroku-app-name
```

### 2. Commit and Push Changes

```bash
# Navigate to your project root
cd c:\Users\Hp\Desktop\coresystem

# Add all changes
git add .

# Commit with message
git commit -m "Add WhatsApp OTP authentication integration"

# Push to Heroku
git push heroku main
```

### 3. Verify Deployment

```bash
# Check if deployment was successful
heroku logs --tail -a your-heroku-app-name

# Test the OTP endpoints
curl https://your-app.herokuapp.com/api/auth/otp/status
```

## 📋 Files Added/Modified

### New Files:
- ✅ `whatsapp-otp-service/uet-jkuat-otp.js` - OTP service
- ✅ `whatsapp-otp-service/package.json` - OTP dependencies
- ✅ `whatsapp-otp-service/README.md` - OTP documentation
- ✅ `app/Http/Controllers/API/OTPAuthController.php` - Laravel OTP controller
- ✅ `OTP_DEPLOYMENT_GUIDE.md` - This file

### Modified Files:
- ✅ `routes/api.php` - Added OTP routes
- ✅ `.env.example` - Added OTP_SERVICE_URL
- ✅ `uetjkuat-funding-platform/pages/LoginPage.tsx` - Added OTP login UI
- ✅ `uetjkuat-funding-platform/contexts/AuthContext.tsx` - Added setUser function
- ✅ `uetjkuat-funding-platform/constants.ts` - Added API_BASE_URL

## 🔧 Two Deployment Options

### Option A: OTP Service on Same Server (Recommended for Testing)

The OTP service runs locally on your development machine and connects to the Heroku backend.

**Setup:**
1. Keep OTP service running locally: `cd whatsapp-otp-service && npm start`
2. Set Heroku config to use ngrok or local tunnel
3. Frontend connects to Heroku backend
4. Backend connects to your local OTP service via tunnel

### Option B: Deploy OTP Service to Separate Heroku App (Production)

Deploy the WhatsApp OTP service as a separate Heroku application.

**Setup:**
```bash
# Create new Heroku app for OTP service
heroku create uet-jkuat-otp-service

# Add buildpacks for Puppeteer
heroku buildpacks:add --index 1 https://github.com/jontewks/puppeteer-heroku-buildpack -a uet-jkuat-otp-service
heroku buildpacks:add --index 2 heroku/nodejs -a uet-jkuat-otp-service

# Deploy OTP service
cd whatsapp-otp-service
git init
git add .
git commit -m "Initial OTP service"
heroku git:remote -a uet-jkuat-otp-service
git push heroku main

# Update main backend to use OTP service URL
heroku config:set OTP_SERVICE_URL=https://uet-jkuat-otp-service.herokuapp.com -a your-main-app
```

## 🌐 Environment Variables Needed

Add these to your Heroku app:

```bash
# Main Backend App
heroku config:set OTP_SERVICE_URL=http://localhost:5001 -a your-app-name

# OTP Service App (if separate)
heroku config:set OTP_PORT=5001 -a uet-jkuat-otp-service
```

## 📱 Frontend Configuration

The frontend is already configured to use the backend API. Make sure your frontend environment has:

```bash
# In uetjkuat-funding-platform/.env
VITE_API_URL=https://your-app.herokuapp.com/api
```

## 🧪 Testing the Integration

### 1. Test OTP Service Status
```bash
curl https://your-app.herokuapp.com/api/auth/otp/status
```

Expected response:
```json
{
  "success": true,
  "available": true,
  "data": {
    "service": "UET JKUAT WhatsApp OTP",
    "status": "running"
  }
}
```

### 2. Test OTP Request
```bash
curl -X POST https://your-app.herokuapp.com/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"identifier": "user@example.com"}'
```

### 3. Test from Frontend
1. Go to login page
2. Click "OTP" tab
3. Enter email or phone number
4. Check WhatsApp for OTP code
5. Enter code and verify

## 🔐 Security Considerations

### Production Checklist:
- [ ] Set OTP service to headless mode (`headless: "new"`)
- [ ] Use HTTPS for all API calls
- [ ] Remove OTP from response in production
- [ ] Enable rate limiting
- [ ] Set up monitoring for OTP service
- [ ] Configure firewall rules
- [ ] Use environment variables for sensitive data

## 📊 Monitoring

### Check Logs
```bash
# Backend logs
heroku logs --tail -a your-app-name

# OTP service logs (if separate)
heroku logs --tail -a uet-jkuat-otp-service
```

### Monitor OTP Service
```bash
# Check if service is ready
curl https://your-app.herokuapp.com/api/auth/otp/status

# Restart if needed
curl -X POST http://localhost:5001/restart
```

## 🐛 Troubleshooting

### Issue: OTP service not available
**Solution:** 
- Check if OTP service is running: `GET /api/auth/otp/status`
- Restart OTP service: `POST http://localhost:5001/restart`
- Verify OTP_SERVICE_URL is set correctly

### Issue: WhatsApp not logged in
**Solution:**
- Access OTP service directly: `http://localhost:5001`
- Scan QR code with WhatsApp
- Wait for "LOGIN SUCCESSFUL" message

### Issue: OTP not sending
**Solution:**
- Check WhatsApp session status: `GET http://localhost:5001/status`
- Verify phone number format (international format)
- Check OTP service logs

### Issue: User not found
**Solution:**
- User must be registered first
- Check if email/phone exists in database
- Verify identifier format

## 📝 Git Commands Summary

```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Add WhatsApp OTP authentication"

# Push to GitHub
git push origin main

# Push to Heroku
git push heroku main

# Check deployment
heroku logs --tail
```

## 🎯 Next Steps

1. **Deploy to Heroku:**
   ```bash
   git add .
   git commit -m "Add OTP authentication"
   git push heroku main
   ```

2. **Set Environment Variables:**
   ```bash
   heroku config:set OTP_SERVICE_URL=http://localhost:5001
   ```

3. **Start OTP Service Locally:**
   ```bash
   cd whatsapp-otp-service
   npm install
   npm start
   ```

4. **Test the Integration:**
   - Open your deployed frontend
   - Try logging in with OTP
   - Verify WhatsApp receives the code

## 📞 Support

For issues or questions:
- Check logs: `heroku logs --tail`
- Review OTP service status: `/api/auth/otp/status`
- Contact UET JKUAT technical team

---

**Note:** The WhatsApp OTP service requires a persistent session. For production, consider using a dedicated server or VPS instead of Heroku's ephemeral filesystem.
