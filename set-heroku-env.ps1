# PowerShell script to set all Heroku environment variables at once
# Usage: .\set-heroku-env.ps1

$APP_NAME = "uetjkuat"

Write-Host "🚀 Setting Heroku Environment Variables..." -ForegroundColor Cyan
Write-Host "App: $APP_NAME" -ForegroundColor Gray
Write-Host ""

# Application Settings
Write-Host "Setting Application variables..." -ForegroundColor Yellow
heroku config:set `
  APP_NAME="UET JKUAT Funding" `
  APP_ENV=production `
  APP_KEY="base64:ka1A00Wn4vGVzEcv4ZvlPT/0PSYhaiI1+7DCsNWgEnY=" `
  APP_DEBUG=false `
  APP_URL="https://uetjkuat-54286e10a43b.herokuapp.com" `
  --app $APP_NAME

# Logging
Write-Host "Setting Logging variables..." -ForegroundColor Yellow
heroku config:set `
  LOG_CHANNEL=stderr `
  LOG_LEVEL=error `
  --app $APP_NAME

# Database
Write-Host "Setting Database variables..." -ForegroundColor Yellow
heroku config:set `
  DB_CONNECTION=pgsql `
  DB_HOST="ep-square-moon-ah1uup8k-pooler.c-3.us-east-1.aws.neon.tech" `
  DB_PORT=5432 `
  DB_DATABASE=neondb `
  DB_USERNAME=neondb_owner `
  DB_PASSWORD="npg_0eOnTvcjFJV3" `
  DB_SSLMODE=require `
  DB_CHANNEL_BINDING=require `
  --app $APP_NAME

# Cache & Queue
Write-Host "Setting Cache & Queue variables..." -ForegroundColor Yellow
heroku config:set `
  CACHE_STORE=file `
  QUEUE_CONNECTION=database `
  SESSION_DRIVER=database `
  SESSION_LIFETIME=120 `
  --app $APP_NAME

# Mail
Write-Host "Setting Mail variables..." -ForegroundColor Yellow
heroku config:set `
  MAIL_MAILER=smtp `
  MAIL_HOST="smtp.mailtrap.io" `
  MAIL_PORT=2525 `
  MAIL_USERNAME=null `
  MAIL_PASSWORD=null `
  MAIL_ENCRYPTION=tls `
  MAIL_FROM_ADDRESS="donotreply@uetjkuat.org" `
  MAIL_FROM_NAME="UET JKUAT Funding" `
  --app $APP_NAME

# API
Write-Host "Setting API variables..." -ForegroundColor Yellow
heroku config:set `
  API_KEY="AIzaSyD_YPOtfYq_YQpRmPF47KF_wdyhNjzYIhw" `
  --app $APP_NAME

# M-Pesa
Write-Host "Setting M-Pesa variables..." -ForegroundColor Yellow
heroku config:set `
  MPESA_ENV=sandbox `
  MPESA_CONSUMER_KEY="yhITTqU49HYlZ2z5EP8OKtA6WfZPRc5hReNPlaxM2xqrkkyU" `
  MPESA_CONSUMER_SECRET="YJAg5XibTFSwiFJlGZv93Nxcwkst9zaAGrGAKDGwNkANR2DApGA5N2h862KK23xI" `
  MPESA_SHORTCODE=4187577 `
  MPESA_PASSKEY="38e01ab631ecdacb414f90186e2e347baf33951d0722a7afaa6085afae90df59" `
  MPESA_CALLBACK_URL="https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/payments/mpesa/callback" `
  MPESA_CALLBACK_SECRET="generated-secret" `
  MPESA_TREASURER_NUMBERS=254700088271 `
  MPESA_DEFAULT_ACCOUNT_REFERENCE=UETFUND `
  MPESA_DEFAULT_ACCOUNT_TYPE_ID=1 `
  MPESA_DEFAULT_ACCOUNT_SUBTYPE_ID=1 `
  MPESA_INITIATOR="companyInitiator" `
  MPESA_SECURITY_CREDENTIAL="generated_credential" `
  MPESA_PARTY_A=601234 `
  --app $APP_NAME

# M-Pesa B2C
Write-Host "Setting M-Pesa B2C variables..." -ForegroundColor Yellow
heroku config:set `
  MPESA_B2C_URL="https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest" `
  MPESA_TOKEN_URL="https://sandbox.safaricom.co.ke/oauth/v1/generate" `
  MPESA_B2C_INITIATOR_NAME="companyInitiator" `
  MPESA_B2C_SECURITY_CREDENTIAL="generated_credential" `
  MPESA_B2C_SHORTCODE=600000 `
  MPESA_B2C_RESULT_URL="https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/b2c/result" `
  MPESA_B2C_TIMEOUT_URL="https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/b2c/timeout" `
  --app $APP_NAME

# WhatsApp / SMS
Write-Host "Setting WhatsApp/SMS variables..." -ForegroundColor Yellow
heroku config:set `
  WHATSAPP_WEB_API_URL="https://whatsapp.uetjkuat.org" `
  SMS_API_URL="https://sms.provider/api/send" `
  SMS_API_KEY="provider-key" `
  SMS_SENDER_ID=UETJKUAT `
  --app $APP_NAME

# Gemini AI
Write-Host "Setting Gemini AI variables..." -ForegroundColor Yellow
heroku config:set `
  GEMINI_ENABLED=false `
  GEMINI_API_KEY="AIzaSyD_YPOtfYq_YQpRmPF47KF_wdyhNjzYIhw" `
  --app $APP_NAME

Write-Host ""
Write-Host "✅ All environment variables set!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Clear config cache: heroku run php artisan config:clear --app $APP_NAME" -ForegroundColor Gray
Write-Host "2. Test API: Invoke-WebRequest -Uri 'https://uetjkuat-54286e10a43b.herokuapp.com/api/health'" -ForegroundColor Gray
Write-Host ""

