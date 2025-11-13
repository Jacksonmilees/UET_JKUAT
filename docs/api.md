# API Reference

Base path: `/api`

## Public endpoints
- `GET /api/tickets/{mmid}` → Purchase page
- `GET /api/tickets/{mmid}/purchase` → Purchase page (alias)
- `POST /api/tickets/{mmid}/process` → Process ticket purchase
- `GET /api/tickets/check-payment-status/{ticketNumber}` → Check status
- `GET /api/tickets/completed/{mmid}` → Completed ticket sales
- `MATCH GET|POST /api/winner-selection` → Winner selection
- `POST /api/mpesa/callback` → STK callback (legacy)
- `POST /api/webhook/whatsapp` → WhatsApp webhook
- `GET /api/health` → System health

## WhatsApp session management
- `GET /api/whatsapp/start`
- `GET /api/whatsapp/qr`
- `POST /api/whatsapp/webhook`

## v1 (middleware: `api`) callbacks
- `POST /api/v1/payments/mpesa/callback`
- `POST /api/v1/payments/confirmation`
- `POST /api/v1/payments/validation`
- `POST /api/v1/mpesa/b2c/result`
- `POST /api/v1/mpesa/b2c/timeout`

## v1 protected (middleware: `api.key`)
Require header: `X-API-Key: <your_key>`

### Projects
- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/projects/{id}`
- `PUT /api/v1/projects/{id}`
- `DELETE /api/v1/projects/{id}`

### Accounts
- `GET /api/v1/accounts`
- `POST /api/v1/accounts`
- `GET /api/v1/accounts/{id}`
- `PUT /api/v1/accounts/{id}`
- `DELETE /api/v1/accounts/{id}`
- `GET /api/v1/accounts/{account}/transactions`
- `POST /api/v1/create-account`
- `POST /api/v1/accounts/check`
- `POST /api/v1/accounts/transfer`
- `GET|POST /api/v1/accounts/search` (both supported)
- `POST /api/v1/accounts/validate-transfer`
- `GET /api/v1/account-types`
- `GET /api/v1/account-subtypes`

### Withdrawals
- `POST /api/v1/withdrawals/initiate`
- `GET /api/v1/withdrawals`
- `GET /api/v1/withdrawals/{id}`
- `POST /api/v1/withdrawals/send-otp`

### Transactions
- `GET /api/v1/transactions`
- `GET /api/v1/transactions/{id}`
- `GET /api/v1/accounts/{reference}/transactions`

### Airtime
- `POST /api/v1/airtime/purchase`
- `GET /api/v1/airtime/balance`

### Payments (initiate)
- `POST /api/v1/payments/mpesa` → STK push

### Tickets (admin)
- `GET /api/v1/tickets/completed/all`

## Balance query
- `MATCH GET|POST /api/mpesa/balance/query`
- `POST /api/mpesa/balance/result`
- `POST /api/mpesa/balance/timeout`

## Auth & headers
- `Content-Type: application/json`
- `X-API-Key` for protected endpoints
- Webhook signature: `X-Webhook-Signature` when applicable

## Sample STK initiate request
```json
{
  "phone_number": "2547XXXXXXXX",
  "amount": 100,
  "account_number": "MMID12345"
}
```
