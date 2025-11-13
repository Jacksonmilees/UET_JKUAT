# Troubleshooting

## Common issues
- 401/403 on protected APIs: ensure `X-API-Key` matches `API_KEY` in env.
- 429 Too many requests: `TransactionRateLimit` exceeded; reduce attempts or adjust config.
- M-Pesa STK fails: verify `MPESA_*` credentials, env (`sandbox` vs `production`), and callback URL.
- B2C callbacks not hitting: check `MPESA_B2C_*` URLs and public reachability.
- Queue jobs not running: start `queue:work` and ensure `QUEUE_CONNECTION` and DB table `jobs` exist (run migrations).
- WhatsApp QR/session: ensure WhatsApp Web API URL is reachable.

## Logs & monitoring
- Check `storage/logs/laravel.log` and custom logs.
- Use `php artisan pail` for real-time logs locally.

## Database
- For SQLite, ensure `database/database.sqlite` exists and is writable.
- For MySQL/Postgres, check credentials and network access.

## CORS
- Adjust `config/cors.php` and clear caches.

## Cache/Config
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```
