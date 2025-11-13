# Deployment

## Build
```bash
# install deps
composer install --no-dev --optimize-autoloader
npm ci
npm run build
```

## Environment
- Set `.env` with production values (see `docs/configuration.md`)
- Generate app key once: `php artisan key:generate`

## Database
```bash
php artisan migrate --force
```

## Cache optimizations
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Queues & Scheduler
- Run a queue worker (supervisor/systemd recommended)
- Run scheduler via cron: `* * * * * php /path/to/artisan schedule:run >> /dev/null 2>&1`

## File permissions
- `storage/` and `bootstrap/cache/` writable by web server user

## Health checks
- `GET /api/health` should return `status: healthy`
