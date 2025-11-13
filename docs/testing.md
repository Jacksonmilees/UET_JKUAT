# Testing

## PHPUnit
```bash
php artisan test
```

## Feature and unit tests
- Tests live in `main-system/tests/`
- Base `TestCase.php` provided

## Recommendations
- Use database transactions or refresh:
```php
use Illuminate\Foundation\Testing\RefreshDatabase;
```
- Add tests for controllers (`routes/api.php`), services (e.g., `MpesaService`, `AccountService`), jobs.
