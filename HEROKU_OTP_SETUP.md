# 🚀 Heroku OTP Configuration - uetjkuat-54286e10a43b

## ✅ Your Heroku App Details

**App Name:** `uetjkuat-54286e10a43b`  
**URL:** `https://uetjkuat-54286e10a43b.herokuapp.com`  
**API Base:** `https://uetjkuat-54286e10a43b.herokuapp.com/api`

## 📋 Required Configuration

### Step 1: Set OTP Service URL

```bash
heroku config:set OTP_SERVICE_URL=http://localhost:5001 -a uetjkuat-54286e10a43b
```

### Step 2: Verify All Config Variables

```bash
heroku config -a uetjkuat-54286e10a43b
```

You should see:
- ✅ `APP_KEY` - Laravel encryption key
- ✅ `APP_URL` - Your Heroku app URL
- ✅ `DB_*` - Database credentials
- ✅ `MPESA_*` - M-Pesa configuration
- ✅ `OTP_SERVICE_URL` - **NEW** OTP service endpoint

### Step 3: Clear Config Cache

```bash
heroku run php artisan config:clear -a uetjkuat-54286e10a43b
```

### Step 4: Restart Heroku App

```bash
heroku restart -a uetjkuat-54286e10a43b
```

## 🧪 Test OTP Integration

### Test 1: Check OTP Service Status

```bash
curl https://uetjkuat-54286e10a43b.herokuapp.com/api/auth/otp/status
```

**Expected Response:**
```json
{
  "success": false,
  "available": false,
  "message": "OTP service unavailable"
}
```
*This is normal - OTP service runs locally*

### Test 2: Check Backend Routes

```bash
curl https://uetjkuat-54286e10a43b.herokuapp.com/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-01T13:52:00.000000Z"
}
```

### Test 3: Full OTP Flow (After Starting Local Service)

1. **Start OTP Service Locally:**
   ```bash
   cd whatsapp-otp-service
   npm install
   npm start
   ```

2. **Test OTP Request:**
   ```bash
   curl -X POST https://uetjkuat-54286e10a43b.herokuapp.com/api/auth/otp/request \
     -H "Content-Type: application/json" \
     -d '{"identifier": "test@uetjkuat.com"}'
   ```

## 🔧 Complete Setup Commands (Copy & Paste)

```bash
# 1. Set OTP service URL
heroku config:set OTP_SERVICE_URL=http://localhost:5001 -a uetjkuat-54286e10a43b

# 2. Clear cache
heroku run php artisan config:clear -a uetjkuat-54286e10a43b

# 3. Restart app
heroku restart -a uetjkuat-54286e10a43b

# 4. Check logs
heroku logs --tail -a uetjkuat-54286e10a43b

# 5. Verify config
heroku config -a uetjkuat-54286e10a43b
```

## 📱 Frontend Configuration

Your frontend should use this API URL:

**File:** `uetjkuat-funding-platform/.env`
```env
VITE_API_URL=https://uetjkuat-54286e10a43b.herokuapp.com/api
```

**File:** `uetjkuat-funding-platform/constants.ts`
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://uetjkuat-54286e10a43b.herokuapp.com/api';
```

## 🎯 OTP Service Setup (Local)

Since the OTP service uses Puppeteer and WhatsApp Web, it needs to run locally:

### Option 1: Quick Start (Windows)

```bash
cd whatsapp-otp-service
start-otp-service.bat
```

### Option 2: Manual Start

```bash
cd whatsapp-otp-service
npm install
npm start
```

### What Happens:
1. ✅ Service starts on port 5001
2. ✅ Browser opens with WhatsApp Web
3. ✅ Scan QR code with your phone
4. ✅ Wait for "LOGIN SUCCESSFUL"
5. ✅ Service is ready!

## 🌐 Architecture

```
User (Browser)
    ↓
Frontend (Vercel/Local)
    ↓
Backend API (Heroku: uetjkuat-54286e10a43b)
    ↓
OTP Service (Local: localhost:5001)
    ↓
WhatsApp Web
```

## ✅ Verification Checklist

- [ ] Heroku app is running: `https://uetjkuat-54286e10a43b.herokuapp.com`
- [ ] OTP_SERVICE_URL is set in Heroku config
- [ ] Config cache is cleared
- [ ] OTP service is running locally on port 5001
- [ ] WhatsApp is logged in (QR scanned)
- [ ] Frontend points to correct API URL
- [ ] Test login with OTP works

## 🐛 Troubleshooting

### Issue: "OTP service unavailable"

**Cause:** OTP service is not running or not accessible

**Solution:**
```bash
# Start OTP service
cd whatsapp-otp-service
npm start

# Check if running
curl http://localhost:5001/status
```

### Issue: "User not found"

**Cause:** User doesn't exist in database

**Solution:**
- User must register first using regular registration
- Then they can login with OTP using their email/phone

### Issue: "WhatsApp not logged in"

**Cause:** WhatsApp session expired

**Solution:**
```bash
# Restart OTP service
curl -X POST http://localhost:5001/restart

# Scan QR code again
```

### Issue: Backend not responding

**Cause:** Heroku app might be sleeping or crashed

**Solution:**
```bash
# Check logs
heroku logs --tail -a uetjkuat-54286e10a43b

# Restart app
heroku restart -a uetjkuat-54286e10a43b

# Check status
curl https://uetjkuat-54286e10a43b.herokuapp.com/api/health
```

## 📊 Monitor Your Deployment

### View Logs
```bash
heroku logs --tail -a uetjkuat-54286e10a43b
```

### Check Dyno Status
```bash
heroku ps -a uetjkuat-54286e10a43b
```

### View Config
```bash
heroku config -a uetjkuat-54286e10a43b
```

### Run Artisan Commands
```bash
heroku run php artisan route:list -a uetjkuat-54286e10a43b
```

## 🎉 You're All Set!

Your OTP integration is configured for:
- **Backend:** `uetjkuat-54286e10a43b.herokuapp.com`
- **OTP Service:** `localhost:5001`
- **New Routes:**
  - `POST /api/auth/otp/request`
  - `POST /api/auth/otp/verify`
  - `GET /api/auth/otp/status`

Just start the OTP service locally and test the login flow!
