#!/bin/bash
# Bash script to set all Heroku environment variables at once
# Usage: ./set-heroku-env.sh

APP_NAME="uetjkuat"

echo "🚀 Setting Heroku Environment Variables..."
echo "App: $APP_NAME"
echo ""

# Application Settings
echo "Setting Application variables..."
heroku config:set \
  APP_NAME="UET JKUAT Funding" \
  APP_ENV=production \
  APP_KEY="base64:ka1A00Wn4vGVzEcv4ZvlPT/0PSYhaiI1+7DCsNWgEnY=" \
  APP_DEBUG=false \
  APP_URL="https://uetjkuat-54286e10a43b.herokuapp.com" \
  --app $APP_NAME

# Logging
echo "Setting Logging variables..."
heroku config:set \
  LOG_CHANNEL=stderr \
  LOG_LEVEL=error \
  --app $APP_NAME

# Database
echo "Setting Database variables..."
heroku config:set \
  DB_CONNECTION=pgsql \
  DB_HOST="ep-square-moon-ah1uup8k-pooler.c-3.us-east-1.aws.neon.tech" \
  DB_PORT=5432 \
  DB_DATABASE=neondb \
  DB_USERNAME=neondb_owner \
  DB_PASSWORD="npg_0eOnTvcjFJV3" \
  DB_SSLMODE=require \
  DB_CHANNEL_BINDING=require \
  --app $APP_NAME

# Cache & Queue
echo "Setting Cache & Queue variables..."
heroku config:set \
  CACHE_STORE=file \
  QUEUE_CONNECTION=database \
  SESSION_DRIVER=database \
  SESSION_LIFETIME=120 \
  --app $APP_NAME

# Mail
echo "Setting Mail variables..."
heroku config:set \
  MAIL_MAILER=smtp \
  MAIL_HOST="smtp.mailtrap.io" \
  MAIL_PORT=2525 \
  MAIL_USERNAME=null \
  MAIL_PASSWORD=null \
  MAIL_ENCRYPTION=tls \
  MAIL_FROM_ADDRESS="donotreply@uetjkuat.org" \
  MAIL_FROM_NAME="UET JKUAT Funding" \
  --app $APP_NAME

# API
echo "Setting API variables..."
heroku config:set \
  API_KEY="AIzaSyD_YPOtfYq_YQpRmPF47KF_wdyhNjzYIhw" \
  --app $APP_NAME

# M-Pesa
echo "Setting M-Pesa variables..."
heroku config:set \
  MPESA_ENV=sandbox \
  MPESA_CONSUMER_KEY="yhITTqU49HYlZ2z5EP8OKtA6WfZPRc5hReNPlaxM2xqrkkyU" \
  MPESA_CONSUMER_SECRET="YJAg5XibTFSwiFJlGZv93Nxcwkst9zaAGrGAKDGwNkANR2DApGA5N2h862KK23xI" \
  MPESA_SHORTCODE=4187577 \
  MPESA_PASSKEY="38e01ab631ecdacb414f90186e2e347baf33951d0722a7afaa6085afae90df59" \
  MPESA_CALLBACK_URL="https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/mpesa/callback" \
  MPESA_CALLBACK_SECRET="generated-secret" \
  MPESA_TREASURER_NUMBERS=254700088271 \
  MPESA_DEFAULT_ACCOUNT_REFERENCE=UETFUND \
  MPESA_DEFAULT_ACCOUNT_TYPE_ID=1 \
  MPESA_DEFAULT_ACCOUNT_SUBTYPE_ID=1 \
  MPESA_INITIATOR="companyInitiator" \
  MPESA_SECURITY_CREDENTIAL="generated_credential" \
  MPESA_PARTY_A=601234 \
  --app $APP_NAME

# M-Pesa B2C
echo "Setting M-Pesa B2C variables..."
heroku config:set \
  MPESA_B2C_URL="https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest" \
  MPESA_TOKEN_URL="https://sandbox.safaricom.co.ke/oauth/v1/generate" \
  MPESA_B2C_INITIATOR_NAME="companyInitiator" \
  MPESA_B2C_SECURITY_CREDENTIAL="generated_credential" \
  MPESA_B2C_SHORTCODE=600000 \
  MPESA_B2C_RESULT_URL="https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/b2c/result" \
  MPESA_B2C_TIMEOUT_URL="https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/b2c/timeout" \
  --app $APP_NAME

# WhatsApp / SMS
echo "Setting WhatsApp/SMS variables..."
heroku config:set \
  WHATSAPP_WEB_API_URL="https://whatsapp.uetjkuat.org" \
  SMS_API_URL="https://sms.provider/api/send" \
  SMS_API_KEY="provider-key" \
  SMS_SENDER_ID=UETJKUAT \
  --app $APP_NAME

# Gemini AI
echo "Setting Gemini AI variables..."
heroku config:set \
  GEMINI_ENABLED=false \
  GEMINI_API_KEY="AIzaSyD_YPOtfYq_YQpRmPF47KF_wdyhNjzYIhw" \
  --app $APP_NAME

echo ""
echo "✅ All environment variables set!"
echo ""
echo "Next steps:"
echo "1. Clear config cache: heroku run php artisan config:clear --app $APP_NAME"
echo "2. Test API: curl https://uetjkuat-54286e10a43b.herokuapp.com/api/health"
echo ""

