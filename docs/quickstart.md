# Quickstart

This project is a Laravel 11 application. The backend lives under `main-system/`.

## Prerequisites
- PHP 8.2+
- Composer 2+
- Node.js 18+ and npm
- SQLite (default) or MySQL/PostgreSQL
- Redis (optional for cache/queue)

## Clone and install
```bash
# from repository root
cd main-system
composer install
cp .env.example .env
php artisan key:generate

# install frontend tooling
npm install
```

## Database
By default, `.env.example` is configured for SQLite.

```bash
# create SQLite database file
mkdir -p database
touch database/database.sqlite
php artisan migrate --seed
```

To use MySQL/PostgreSQL, update `.env` DB_* variables and run:
```bash
php artisan migrate --seed
```

## Run the app
Two options:

- Simple (backend only):
```bash
php artisan serve
```

- Full DX (server, queue listener, logs, Vite dev):
```bash
composer run dev
```
This runs:
- `php artisan serve`
- `php artisan queue:listen --tries=1`
- `php artisan pail --timeout=0`
- `npm run dev`

## Health check
With server running, visit:
- API health: `GET /api/health`
- Web: `GET /`

## Common artisan
```bash
php artisan migrate:fresh --seed
php artisan queue:work
php artisan test
```
