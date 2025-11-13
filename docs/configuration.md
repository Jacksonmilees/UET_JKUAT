# Configuration & Environment

Primary config files are in `main-system/config/`.

## Core
- `app.php`: app name, locale, timezone
- `database.php`: DB connections (sqlite default), Redis
- `cache.php`: cache stores (default database)
- `queue.php`: queue connections (default database)
- `session.php`: session driver (database)
- `mail.php`: mail transport (log by default)
- `logging.php`: channels and levels
- `services.php`: third-party services and API keys
- `mpesa.php`: M-Pesa credentials and B2C settings

## Environment variables (.env)
Common keys used:

- App: `APP_ENV`, `APP_KEY`, `APP_DEBUG`, `APP_URL`
- Database: `DB_CONNECTION`, `DB_DATABASE`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`
- Cache/Queue: `CACHE_STORE`, `QUEUE_CONNECTION`, `REDIS_*`
- Mail: `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_*`
- Logs: `LOG_CHANNEL`, `LOG_LEVEL`, `LOG_STACK`

### API auth
- `API_KEY` — used by `ApiKeyMiddleware` (`X-API-Key` header)

### M-Pesa
- `MPESA_ENV` — `sandbox` or `production`
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- `MPESA_CALLBACK_SECRET`
- `MPESA_VALIDATION_URL`, `MPESA_CONFIRMATION_URL`
- B2C: `MPESA_B2C_URL`, `MPESA_TOKEN_URL`, `MPESA_B2C_INITIATOR_NAME`, `MPESA_B2C_SECURITY_CREDENTIAL`, `MPESA_B2C_SHORTCODE`, `MPESA_B2C_RESULT_URL`, `MPESA_B2C_TIMEOUT_URL`

### WhatsApp / SMS
- `WHATSAPP_WEB_API_URL`
- `WHATSAPP_API_URL`
- `SMS_API_URL_URL`, `SMS_API_KEY`, `SMS_SENDER_ID`

### Email providers
- Postmark: `POSTMARK_TOKEN`
- AWS SES: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`

### Gemini (optional)
- `GEMINI_API_KEY`, `GEMINI_BASE_URL`, `GEMINI_MODEL`
- `GEMINI_ENABLED`, `GEMINI_TIMEOUT`
- `GEMINI_RATE_LIMIT_REQUESTS`, `GEMINI_RATE_LIMIT_MINUTES`
- `GEMINI_FRAUD_DETECTION_ENABLED`, `GEMINI_FRAUD_THRESHOLD`
- `GEMINI_ANOMALY_DETECTION_ENABLED`, `GEMINI_ANOMALY_THRESHOLD`
- `GEMINI_SMART_MATCHING_ENABLED`, `GEMINI_MATCHING_CONFIDENCE`

## CORS
Configured via `config/cors.php`.

## Build & Dev
- `package.json` scripts: `dev`, `build`
- `vite.config.js` inputs: `resources/css/app.css`, `resources/js/app.js`
- Tailwind configured in `tailwind.config.js`
