# Heroku Environment Variables Setup

## ⚠️ Important Notes

1. **APP_URL is WRONG** - You have `https://uet-jkuat.onrender.com/api` but should be `https://uetjkuat-54286e10a43b.herokuapp.com`
2. **APP_KEY** - Use the one we generated: `base64:ka1A00Wn4vGVzEcv4ZvlPT/0PSYhaiI1+7DCsNWgEnY=`
3. **M-Pesa Callback URLs** - Update to use Heroku URL instead of `api.uetjkuat.org`

## 📋 Environment Variables for Heroku

Copy and paste these into Heroku Dashboard → Settings → Config Vars:

### Application Settings
```
APP_NAME=UET JKUAT Funding
APP_ENV=production
APP_KEY=base64:ka1A00Wn4vGVzEcv4ZvlPT/0PSYhaiI1+7DCsNWgEnY=
APP_DEBUG=false
APP_URL=https://uetjkuat-54286e10a43b.herokuapp.com
```

### Logging
```
LOG_CHANNEL=stderr
LOG_LEVEL=error
```

### Database (Neon DB)
```
DB_CONNECTION=pgsql
DB_HOST=ep-square-moon-ah1uup8k-pooler.c-3.us-east-1.aws.neon.tech
DB_PORT=5432
DB_DATABASE=neondb
DB_USERNAME=neondb_owner
DB_PASSWORD=npg_0eOnTvcjFJV3
DB_SSLMODE=require
DB_CHANNEL_BINDING=require
```

### Cache & Queue
```
CACHE_STORE=file
QUEUE_CONNECTION=database
SESSION_DRIVER=database
SESSION_LIFETIME=120
```

### Mail Configuration
```
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=donotreply@uetjkuat.org
MAIL_FROM_NAME=UET JKUAT Funding
```

### API Authentication
```
API_KEY=AIzaSyD_YPOtfYq_YQpRmPF47KF_wdyhNjzYIhw
```

### M-PESA Configuration
```
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=yhITTqU49HYlZ2z5EP8OKtA6WfZPRc5hReNPlaxM2xqrkkyU
MPESA_CONSUMER_SECRET=YJAg5XibTFSwiFJlGZv93Nxcwkst9zaAGrGAKDGwNkANR2DApGA5N2h862KK23xI
MPESA_SHORTCODE=4187577
MPESA_PASSKEY=38e01ab631ecdacb414f90186e2e347baf33951d0722a7afaa6085afae90df59
MPESA_CALLBACK_URL=https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/mpesa/callback
MPESA_CALLBACK_SECRET=generated-secret
MPESA_TREASURER_NUMBERS=254700088271
MPESA_DEFAULT_ACCOUNT_REFERENCE=UETFUND
MPESA_DEFAULT_ACCOUNT_TYPE_ID=1
MPESA_DEFAULT_ACCOUNT_SUBTYPE_ID=1
MPESA_INITIATOR=companyInitiator
MPESA_SECURITY_CREDENTIAL=generated_credential
MPESA_PARTY_A=601234
```

### M-PESA B2C (Withdrawals)
```
MPESA_B2C_URL=https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest
MPESA_TOKEN_URL=https://sandbox.safaricom.co.ke/oauth/v1/generate
MPESA_B2C_INITIATOR_NAME=companyInitiator
MPESA_B2C_SECURITY_CREDENTIAL=generated_credential
MPESA_B2C_SHORTCODE=600000
MPESA_B2C_RESULT_URL=https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/b2c/result
MPESA_B2C_TIMEOUT_URL=https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/b2c/timeout
```

### WhatsApp / SMS
```
WHATSAPP_WEB_API_URL=https://whatsapp.uetjkuat.org
SMS_API_URL=https://sms.provider/api/send
SMS_API_KEY=provider-key
SMS_SENDER_ID=UETJKUAT
```

### Gemini AI
```
GEMINI_ENABLED=false
GEMINI_API_KEY=AIzaSyD_YPOtfYq_YQpRmPF47KF_wdyhNjzYIhw
```

## 🔧 Changes Made for Heroku

1. ✅ **APP_URL** - Changed from `https://uet-jkuat.onrender.com/api` to `https://uetjkuat-54286e10a43b.herokuapp.com`
2. ✅ **APP_KEY** - Using the generated key
3. ✅ **M-Pesa Callback URLs** - Updated to use Heroku URL
4. ✅ **LOG_CHANNEL** - Changed to `stderr` (recommended for Heroku)
5. ✅ **LOG_LEVEL** - Changed to `error` (for production)

## 📝 How to Set in Heroku

1. Go to https://dashboard.heroku.com
2. Select your app: `uetjkuat-54286e10a43b`
3. Go to **Settings** tab
4. Click **Reveal Config Vars**
5. For each variable above:
   - Click **Edit** (if exists) or **Add** (if new)
   - Enter the **Key** and **Value**
   - Click **Save**

## ⚠️ Important URLs to Update

Make sure these M-Pesa URLs point to your Heroku app:
- `MPESA_CALLBACK_URL` = `https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/mpesa/callback`
- `MPESA_B2C_RESULT_URL` = `https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/b2c/result`
- `MPESA_B2C_TIMEOUT_URL` = `https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/b2c/timeout`

## 🧪 After Setting Variables

1. **Clear config cache:**
   - Go to Heroku Dashboard → More → Run console
   - Run: `php artisan config:clear`

2. **Test the API:**
   ```powershell
   Invoke-WebRequest -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/health"
   ```

3. **Should return 200 OK!**

## 🔒 Security Notes

- ✅ Never commit `.env` files to git
- ✅ Use Heroku Config Vars for production
- ✅ Change `MPESA_CALLBACK_SECRET` to a strong random string
- ✅ Change `MPESA_SECURITY_CREDENTIAL` to actual credential
- ✅ Change `MPESA_B2C_SECURITY_CREDENTIAL` to actual credential

