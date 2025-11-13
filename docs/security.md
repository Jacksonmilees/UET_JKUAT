# Security

## API authentication
- Protected endpoints require `X-API-Key` matching `config('services.api.key')`.
- Store the key in env: `API_KEY=...`

## Middleware
- `SecurityHeaders`: adds HSTS, XSS, frame, content type, CSP, referrer policies.
- `TransactionRateLimit`: throttles requests by IP/path/phone_number using cache.
- `ValidateTransactionRequest`: verifies webhook signatures via `X-Webhook-Signature` and sanitizes input.

## Secret management
- Do not commit secrets to git; use `.env` or secrets manager.
- Rotate keys periodically.

## Webhooks
- Verify signature header, use HTTPS, log failures with minimal PII.

## Data handling
- Sanitize and validate all inputs.
- Avoid logging sensitive payloads; use structured logs.

## Transport
- Enforce HTTPS everywhere in production.

## Dependencies
- Keep Composer and npm dependencies up to date.
