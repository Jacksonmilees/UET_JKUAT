# Fix Heroku Database Migrations
Write-Host "Fixing Heroku Database Migrations..." -ForegroundColor Cyan
Write-Host ""

$appName = "uetjkuat"

Write-Host "Current Migration Status:" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow
Write-Host "The users table migrations are MISSING from Heroku!" -ForegroundColor Red
Write-Host "This is why registration is failing with 422 errors." -ForegroundColor Red
Write-Host ""

Write-Host "Step 1: Check current migration status" -ForegroundColor Cyan
heroku run "php artisan migrate:status" -a $appName

Write-Host ""
Write-Host "Step 2: Run fresh migrations (this will create users table)" -ForegroundColor Cyan
Write-Host "Press Enter to continue or Ctrl+C to cancel..." -ForegroundColor Yellow
Read-Host

heroku run "php artisan migrate --force" -a $appName

Write-Host ""
Write-Host "Step 3: Verify migrations completed" -ForegroundColor Cyan
heroku run "php artisan migrate:status" -a $appName

Write-Host ""
Write-Host "Step 4: Test the database connection" -ForegroundColor Cyan
heroku run "php artisan tinker --execute='echo \App\Models\User::count() . \" users in database\n\";'" -a $appName

Write-Host ""
Write-Host "✅ Migration fix complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test registration: .\test-registration.ps1" -ForegroundColor White
Write-Host "2. View logs: heroku logs --tail -a $appName" -ForegroundColor White
Write-Host ""
