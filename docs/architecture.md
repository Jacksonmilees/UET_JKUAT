# Architecture

## High-level overview
- Laravel 11 application in `main-system/`
- Domain services under `app/Services`
- HTTP API controllers under `app/Http/Controllers`
- Background jobs in `app/Jobs`
- Console commands in `app/Console/Commands`
- Config and integrations in `config/*.php`

## Directory structure (key parts)
- `app/Http/Controllers` — REST endpoints and web controllers
- `app/Http/Middleware` — API key, security headers, validation, rate limiting
- `app/Models` — Eloquent models: `Account`, `Transaction`, `Project`, `Ticket`, etc.
- `app/Services` — Business logic: M-Pesa, Airtime, WhatsApp, Accounts, Statements
- `app/Jobs` — Queued jobs: `ProcessMpesaTransaction`, `ProcessWalletNotification`
- `app/Console/Commands` — Operations: register URLs, process transactions, statements
- `config` — Application, queue, services, M-Pesa, etc.
- `routes` — `api.php`, `web.php`, `console.php`
- `resources/views` — Blade templates for emails, PDFs, tickets, welcome

## Key flows
- Payments (M-Pesa):
  - `POST /api/v1/payments/mpesa` → `MpesaController@initiateSTKPush`
  - Callback(s): `POST /api/v1/payments/mpesa/callback` → `MpesaCallbackController@handle`
  - B2C: `POST /api/v1/mpesa/b2c/*` → `MpesaB2CWithdrawalController`
  - Background processing: `mpesa:process-transactions` command → `MpesaTransactionController`

- Accounts:
  - CRUD via `AccountController` under `api/v1` (protected by API Key middleware)
  - Transfers, validation, search endpoints

- Tickets:
  - Purchase flow under `/api/tickets/*` and `/api/v1/tickets/*`

- Statements:
  - `statements:daily` scheduled at 18:21
  - `SendAccountStatements` and `AccountStatementService`

## Middleware
- `api.key` — validates `X-API-Key` header against `config('services.api.key')`
- `SecurityHeaders` — standard browser security headers
- `TransactionRateLimit` — cache-backed request throttling per IP/path
- `ValidateTransactionRequest` — webhook signature validation + input sanitization
- `withdrawal_api` — placeholder for withdrawal auth

## Scheduling & Queues
- Schedule: see `app/Console/Kernel.php` (M-Pesa every 5m, statements daily 18:21)
- Queue: default `database` (configurable), jobs in `app/Jobs`

## External services
- M-Pesa Daraja (STK, B2C, balance)
- WhatsApp Web API
- SMS provider (configurable)
- Postmark / SES (mail)
- Gemini AI (optional features)
