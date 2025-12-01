# M-Pesa URL Configuration

## 📍 Your Callback URLs

These are the URLs you need to register with Safaricom M-Pesa:

### Production URLs (Heroku)

| Purpose | URL |
|---------|-----|
| **Validation URL** | `https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/validation` |
| **Confirmation URL** | `https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/confirmation` |
| **Callback URL (STK Push)** | `https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/mpesa/callback` |
| **B2C Result URL** | `https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/b2c/result` |
| **B2C Timeout URL** | `https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/b2c/timeout` |

---

## 🔧 Environment Variables to Set

### On Heroku

Set these environment variables on Heroku:

```bash
# M-Pesa Credentials
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_ENV=production

# Callback URLs
MPESA_VALIDATION_URL=https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/validation
MPESA_CONFIRMATION_URL=https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/confirmation
MPESA_CALLBACK_URL=https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/mpesa/callback
```

### Set via Command Line

```powershell
# Set M-Pesa URLs
heroku config:set MPESA_VALIDATION_URL="https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/validation" -a uetjkuat
heroku config:set MPESA_CONFIRMATION_URL="https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/confirmation" -a uetjkuat
heroku config:set MPESA_CALLBACK_URL="https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/mpesa/callback" -a uetjkuat
```

---

## 📋 What to Tell Safaricom

When registering your app with Safaricom, provide these URLs:

### For C2B (Customer to Business) - PayBill/Till Number

**Validation URL:**
```
https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/validation
```

**Confirmation URL:**
```
https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/confirmation
```

### For STK Push (Lipa Na M-Pesa Online)

**Callback URL:**
```
https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/mpesa/callback
```

### For B2C (Business to Customer) - Withdrawals

**Result URL:**
```
https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/b2c/result
```

**Timeout URL:**
```
https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/b2c/timeout
```

---

## 🔍 Current External Transaction Source

Your system is trying to fetch transactions from:
```
https://test.moutjkuatministry.cloud/api/get-latest-transactions
```

### Questions:

1. **Is this YOUR server?** 
   - If yes, what credentials do I need to access it?
   - If no, where should we fetch transactions from?

2. **Do you have access to M-Pesa Daraja API directly?**
   - If yes, provide your credentials and I'll fetch directly from Safaricom
   - If no, we'll use the callback URLs above

3. **Alternative: Database Access**
   - Do you have a database where M-Pesa transactions are stored?
   - Can you provide connection details?

---

## 🚀 Next Steps

### Option 1: Use Safaricom Callbacks (Recommended)

1. **Register URLs with Safaricom:**
   - Contact Safaricom M-Pesa support
   - Provide the callback URLs above
   - They will whitelist your domain

2. **Set Environment Variables:**
   ```powershell
   heroku config:set MPESA_VALIDATION_URL="https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/validation" -a uetjkuat
   heroku config:set MPESA_CONFIRMATION_URL="https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/confirmation" -a uetjkuat
   ```

3. **Test with a Payment:**
   - Make a small test payment
   - Check Heroku logs for callback
   - Transaction should auto-create

### Option 2: Fetch from External API

If you have an external API storing M-Pesa transactions:

1. **Provide the correct URL:**
   - What's the actual endpoint?
   - Does it need authentication?
   - What format does it return?

2. **I'll update the import script** to use your URL

### Option 3: Direct Daraja API Access

If you have M-Pesa API credentials:

1. **Provide:**
   - Consumer Key
   - Consumer Secret
   - Shortcode
   - Passkey

2. **I'll create a script** to fetch transactions directly from Safaricom

---

## 📝 Tell Me:

**Please provide:**

1. ✅ Which option do you want to use? (Callbacks / External API / Direct Daraja)

2. ✅ If External API:
   - What's the correct URL?
   - Does it need authentication (API key, token)?
   - What's the response format?

3. ✅ If Direct Daraja:
   - Your M-Pesa credentials (Consumer Key, Secret, etc.)

4. ✅ Do you want me to set the Heroku environment variables now?

---

## 🔧 Quick Setup Script

Once you tell me the details, I'll create a script to:
1. Set all environment variables
2. Configure the import
3. Fetch your real transactions
4. Display them in the frontend

**Just tell me which option and provide the details!** 🚀
