# Testing M-Pesa STK Push Integration

## Your Test Phone Number
- **Input**: `0700088271` or `+254700088271`
- **Formatted**: `254700088271` (automatically converted by frontend)

## Frontend URL
🌐 **https://uet-jkuat.onrender.com**

## Backend API URL
🔗 **https://uet-jkuat.onrender.com/api**

## Testing Steps

### Option 1: Test via Frontend (Recommended)

1. **Go to Registration Page**
   - Visit: https://uet-jkuat.onrender.com/#/register
   - Fill in the registration form
   - When prompted for payment, enter phone: `0700088271` or `254700088271`
   - Amount: KES 100 (mandatory contribution)
   - Click "Pay KES 100"
   - You should receive an STK push on your phone

2. **Test Project Contribution**
   - Visit: https://uet-jkuat.onrender.com/#/home
   - Click on any project
   - Click "Contribute"
   - Enter amount (e.g., 50, 100, 250, etc.)
   - Enter phone: `0700088271` or `254700088271`
   - Click "Confirm Contribution"
   - You should receive an STK push

3. **Test Login Payment Check**
   - Visit: https://uet-jkuat.onrender.com/#/login
   - Login with your credentials
   - If you haven't paid the mandatory contribution, you'll be prompted
   - Enter phone: `0700088271` or `254700088271`
   - Complete the payment

### Option 2: Test via API Directly (For Debugging)

#### Test STK Push Endpoint

**Endpoint**: `POST /api/v1/payments/mpesa`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {your-token} (if required)
```

**Request Body**:
```json
{
  "phone_number": "254700088271",
  "amount": 100,
  "account_number": "TEST-001"
}
```

**cURL Command**:
```bash
curl -X POST https://uet-jkuat.onrender.com/api/v1/payments/mpesa \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "254700088271",
    "amount": 100,
    "account_number": "TEST-001"
  }'
```

**Expected Response** (Success):
```json
{
  "success": true,
  "message": "STK push initiated successfully",
  "data": {
    "MerchantRequestID": "...",
    "CheckoutRequestID": "...",
    "ResponseCode": "0",
    "ResponseDescription": "Success. Request accepted for processing",
    "CustomerMessage": "Success. Request accepted for processing"
  }
}
```

**Expected Response** (Error):
```json
{
  "success": false,
  "message": "Failed to initiate STK push",
  "error": {
    "errorCode": "...",
    "errorMessage": "..."
  }
}
```

#### Check STK Push Status

**Endpoint**: `GET /api/v1/payments/mpesa/status/{checkoutRequestId}`

**cURL Command**:
```bash
curl -X GET "https://uet-jkuat.onrender.com/api/v1/payments/mpesa/status/{CHECKOUT_REQUEST_ID}"
```

## Phone Number Format

The system accepts:
- ✅ `0700088271` (will be converted to `254700088271`)
- ✅ `254700088271` (direct format)
- ✅ `+254700088271` (will be converted to `254700088271`)

**Backend requires**: `254[0-9]{9}` format (12 digits starting with 254)

## Common Issues & Solutions

### Issue 1: "Invalid phone number format"
**Solution**: Make sure the phone number is in format `254XXXXXXXXX` (12 digits)

### Issue 2: "STK push failed"
**Possible Causes**:
- M-Pesa credentials not configured correctly in backend `.env`
- Phone number not registered with M-Pesa
- Insufficient M-Pesa balance
- Backend environment (sandbox vs production) mismatch

**Check Backend Environment Variables**:
```env
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_ENV=sandbox  # or 'production'
MPESA_CALLBACK_URL=https://uet-jkuat.onrender.com/api/payments/mpesa/callback
```

### Issue 3: "No STK push received"
**Possible Causes**:
- Phone number not registered with M-Pesa
- Network issues
- M-Pesa service temporarily unavailable
- Wrong phone number format

**Solution**: 
- Verify phone number is registered with M-Pesa
- Check M-Pesa balance
- Try again after a few minutes

### Issue 4: CORS Error
**Solution**: Make sure backend CORS allows your frontend domain:
- Add `https://uet-jkuat.onrender.com` to allowed origins in Laravel CORS config

## Testing Checklist

- [ ] Frontend loads correctly
- [ ] Registration form accepts phone number
- [ ] Phone number is formatted correctly (254XXXXXXXXX)
- [ ] STK push is initiated when payment button is clicked
- [ ] STK push appears on phone
- [ ] Payment can be completed on phone
- [ ] Payment status updates in frontend
- [ ] Transaction appears in dashboard
- [ ] Mandatory contribution status updates after payment

## Debugging

### Check Backend Logs (Render)
1. Go to Render Dashboard
2. Select your backend service
3. Click "Logs" tab
4. Look for M-Pesa related logs

### Check Frontend Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for API errors or network issues

### Test API Endpoint Directly
Use Postman or cURL to test the API endpoint directly and see the exact error response.

## Next Steps After Testing

1. ✅ Verify STK push is received
2. ✅ Complete payment on phone
3. ✅ Check if payment status updates
4. ✅ Verify transaction appears in dashboard
5. ✅ Test with different amounts
6. ✅ Test mandatory contribution flow
7. ✅ Test project contribution flow

## Support

If you encounter issues:
1. Check backend logs in Render
2. Check frontend console for errors
3. Verify M-Pesa credentials are correct
4. Ensure phone number is registered with M-Pesa
5. Verify callback URL is accessible


