# Setting Environment Variables via Heroku Dashboard

Since the CLI can't find the app, use the Heroku Dashboard instead.

## Method 1: Bulk Import (Easiest)

1. Go to https://dashboard.heroku.com
2. Select your app (the one with URL `uetjkuat-54286e10a43b.herokuapp.com`)
3. Go to **Settings** tab
4. Click **Reveal Config Vars**
5. Scroll down and look for **"Import"** or **"Paste"** option
6. If available, paste all variables at once

## Method 2: Manual Entry (If no bulk import)

Copy and paste these one by one into Heroku Dashboard → Settings → Config Vars:

### Group 1: Application
```
APP_NAME=UET JKUAT Funding
APP_ENV=production
APP_KEY=base64:ka1A00Wn4vGVzEcv4ZvlPT/0PSYhaiI1+7DCsNWgEnY=
APP_DEBUG=false
APP_URL=https://uetjkuat-54286e10a43b.herokuapp.com
```

### Group 2: Logging
```
LOG_CHANNEL=stderr
LOG_LEVEL=error
```

### Group 3: Database
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

### Group 4: Cache & Queue
```
CACHE_STORE=file
QUEUE_CONNECTION=database
SESSION_DRIVER=database
SESSION_LIFETIME=120
```

### Group 5: Mail
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

### Group 6: API
```
API_KEY=AIzaSyD_YPOtfYq_YQpRmPF47KF_wdyhNjzYIhw
```

### Group 7: M-Pesa
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

### Group 8: M-Pesa B2C
```
MPESA_B2C_URL=https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest
MPESA_TOKEN_URL=https://sandbox.safaricom.co.ke/oauth/v1/generate
MPESA_B2C_INITIATOR_NAME=companyInitiator
MPESA_B2C_SECURITY_CREDENTIAL=generated_credential
MPESA_B2C_SHORTCODE=600000
MPESA_B2C_RESULT_URL=https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/b2c/result
MPESA_B2C_TIMEOUT_URL=https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/b2c/timeout
```

### Group 9: WhatsApp/SMS
```
WHATSAPP_WEB_API_URL=https://whatsapp.uetjkuat.org
SMS_API_URL=https://sms.provider/api/send
SMS_API_KEY=provider-key
SMS_SENDER_ID=UETJKUAT
```

### Group 10: Gemini AI
```
GEMINI_ENABLED=false
GEMINI_API_KEY=AIzaSyD_YPOtfYq_YQpRmPF47KF_wdyhNjzYIhw
```

## Method 3: Find Correct App Name

If you want to use CLI, first find the correct app name:

1. Go to Heroku Dashboard
2. Click on your app
3. Go to **Settings** tab
4. Look at the **App Name** at the top
5. Update the script with that name

Or check if the app is in a team:
```bash
heroku apps --team YOUR_TEAM_NAME
```

## Quick Steps

1. **Go to Dashboard**: https://dashboard.heroku.com
2. **Select your app** (the one with `uetjkuat-54286e10a43b` in the URL)
3. **Settings** → **Reveal Config Vars**
4. **Add each variable** from the groups above
5. **Save** after each group

## After Setting Variables

1. **Clear config cache** (Dashboard → More → Run console):
   ```bash
   php artisan config:clear
   ```

2. **Test the API**:
   ```powershell
   Invoke-WebRequest -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/health"
   ```

