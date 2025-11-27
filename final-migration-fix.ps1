# Final Migration Fix - Complete All Pending Migrations
Write-Host "Final Migration Fix..." -ForegroundColor Cyan
Write-Host ""

$appName = "uetjkuat"

Write-Host "Committing and deploying fixed migrations..." -ForegroundColor Yellow
git add database/migrations/2025_02_16_104415_create_members_table.php
git add database/migrations/2025_02_16_143140_create_tickets_table.php
git commit -m "Fix members and tickets migrations - remove problematic foreign key"
git push

Write-Host ""
Write-Host "Running all pending migrations..." -ForegroundColor Cyan
heroku run "php artisan migrate --force" -a $appName

Write-Host ""
Write-Host "Final migration status:" -ForegroundColor Cyan
heroku run "php artisan migrate:status" -a $appName

Write-Host ""
Write-Host "✅ All migrations should now be complete!" -ForegroundColor Green
Write-Host ""
