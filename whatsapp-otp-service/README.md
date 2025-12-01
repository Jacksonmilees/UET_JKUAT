# UET JKUAT WhatsApp OTP Service

Automated WhatsApp OTP authentication service for the UET JKUAT Ministry Funding Platform.

## Features

- ✅ Automated WhatsApp OTP delivery
- ✅ 6-digit OTP generation
- ✅ 5-minute OTP expiration
- ✅ Rate limiting & attempt tracking
- ✅ Session persistence
- ✅ CORS enabled for frontend integration

## Setup Instructions

### 1. Install Dependencies

```bash
cd whatsapp-otp-service
npm install
```

### 2. Start the Service

```bash
npm start
```

The service will start on port **5001** (or the port specified in `OTP_PORT` environment variable).

### 3. Scan QR Code

1. Open the browser window that appears
2. Scan the WhatsApp Web QR code with your phone
3. Wait for "LOGIN SUCCESSFUL!" message
4. The service is now ready to send OTPs automatically

## API Endpoints

### Send OTP
```http
POST /send-otp
Content-Type: application/json

{
  "phone": "254712345678",
  "email": "user@example.com",
  "customMessage": "Your UET JKUAT code is: {otp}"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent via WhatsApp",
  "expiresIn": "5 minutes",
  "mode": "automated",
  "provider": "WhatsApp"
}
```

### Verify OTP
```http
POST /verify-otp
Content-Type: application/json

{
  "phone": "254712345678",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

### Check Status
```http
GET /status
```

**Response:**
```json
{
  "service": "UET JKUAT WhatsApp OTP",
  "status": "running",
  "automation": {
    "isReady": true,
    "isInitializing": false,
    "sessionStatus": "logged_in"
  },
  "activeOTPs": 3,
  "uptime": 3600
}
```

### Restart Service
```http
POST /restart
```

### Health Check
```http
GET /health
```

## Environment Variables

```bash
OTP_PORT=5001  # Port for OTP service (default: 5001)
```

## Integration with Laravel Backend

The Laravel backend (`OTPAuthController.php`) connects to this service:

```php
// .env
OTP_SERVICE_URL=http://localhost:5001
```

## Frontend Integration

The LoginPage now supports OTP authentication:

1. User enters email or phone number
2. System checks if user exists
3. OTP is sent via WhatsApp
4. User enters 6-digit code
5. System verifies and logs in user

## Session Persistence

WhatsApp session is saved in `./whatsapp_uet_jkuat_session/` directory. This means you only need to scan the QR code once. The session will persist across restarts.

## Security Features

- ✅ OTP expires after 5 minutes
- ✅ Maximum 5 verification attempts
- ✅ 60-second cooldown between resends
- ✅ Automatic cleanup of expired OTPs

## Troubleshooting

### Service not sending messages
1. Check if WhatsApp is logged in: `GET /status`
2. Restart the service: `POST /restart`
3. Rescan QR code if session expired

### Phone number format
Use international format without spaces:
- ✅ `254712345678`
- ✅ `+254712345678`
- ❌ `0712345678`
- ❌ `+254 712 345 678`

## Production Deployment

For production, set headless mode in `uet-jkuat-otp.js`:

```javascript
headless: "new"  // Change from false to "new"
```

## Support

For issues or questions, contact the UET JKUAT technical team.
