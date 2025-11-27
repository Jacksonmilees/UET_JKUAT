# Fix Members and Tickets Tables
Write-Host "Fixing Members and Tickets Tables..." -ForegroundColor Cyan
Write-Host ""

$appName = "uetjkuat"

Write-Host "Issue: Members table missing MMID column that tickets table references" -ForegroundColor Yellow
Write-Host ""

Write-Host "Step 1: Drop members table (it's empty anyway)" -ForegroundColor Cyan
heroku run "php artisan tinker --execute='Schema::dropIfExists(\"members\");'" -a $appName

Write-Host ""
Write-Host "Step 2: Remove members migration from migrations table" -ForegroundColor Cyan
heroku run "php artisan tinker --execute='DB::table(\"migrations\")->where(\"migration\", \"2025_02_16_104415_create_members_table\")->delete();'" -a $appName

Write-Host ""
Write-Host "Step 3: Push updated migration to Heroku" -ForegroundColor Cyan
Write-Host "Committing changes..." -ForegroundColor Gray
git add database/migrations/2025_02_16_104415_create_members_table.php
git commit -m "Add MMID column to members table"
git push heroku main

Write-Host ""
Write-Host "Step 4: Run migrations again" -ForegroundColor Cyan
heroku run "php artisan migrate --force" -a $appName

Write-Host ""
Write-Host "Step 5: Verify all migrations completed" -ForegroundColor Cyan
heroku run "php artisan migrate:status" -a $appName

Write-Host ""
Write-Host "✅ Fix complete!" -ForegroundColor Green
Write-Host ""
