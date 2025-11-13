# Development Workflow

## Running locally
- Start backend only:
```bash
php artisan serve
```
- Full DX stack:
```bash
composer run dev
```

## Queues
- Default connection: `database`
- Start a worker:
```bash
php artisan queue:work
```
- Listen with retries:
```bash
php artisan queue:listen --tries=1
```

## Scheduler
- Defined in `app/Console/Kernel.php`:
  - `mpesa:process-transactions` — every 5 minutes
  - `statements:daily` — daily at 18:21
- Run scheduler locally:
```bash
php artisan schedule:work
```

## Useful artisan commands
```bash
php artisan mpesa:register-urls
php artisan mpesa:process-transactions -v
php artisan statements:daily
php artisan statements:send --start=2025-01-01 --end=2025-01-31
php artisan accounts:create-system
```

## Code style
- PHP: Laravel Pint
```bash
vendor/bin/pint
```

## Logs
- Default: `storage/logs/laravel.log`
- Custom: statements appended to `storage/logs/statements.log`

## Environments
- Configure via `.env` per machine. Keep secrets out of VCS.
