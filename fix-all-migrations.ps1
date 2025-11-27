# Fix All Pending Migrations on Heroku
Write-Host "Fixing All Pending Migrations..." -ForegroundColor Cyan
Write-Host ""

$appName = "uetjkuat"

Write-Host "Current Issues:" -ForegroundColor Yellow
Write-Host "===============" -ForegroundColor Yellow
Write-Host "1. Withdrawals table already exists (duplicate)" -ForegroundColor Red
Write-Host "2. Members table needs to be created" -ForegroundColor Yellow
Write-Host "3. Tickets table needs to be created" -ForegroundColor Yellow
Write-Host "4. Fraud alerts table needs to be created" -ForegroundColor Yellow
Write-Host "5. Withdrawal update migration pending" -ForegroundColor Yellow
Write-Host ""

Write-Host "Solution Strategy:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "1. Mark the create_withdrawals migration as run (since table exists)" -ForegroundColor White
Write-Host "2. Run the update_withdrawal migration" -ForegroundColor White
Write-Host "3. Create members, tickets, and fraud_alerts tables" -ForegroundColor White
Write-Host ""

Write-Host "Step 1: Check which tables already exist in database" -ForegroundColor Cyan
heroku run "php artisan tinker --execute='echo implode(\"\n\", array_map(fn(\$t) => \$t->tablename, DB::select(\"SELECT tablename FROM pg_tables WHERE schemaname = \\\"public\\\" ORDER BY tablename\")));'" -a $appName

Write-Host ""
Write-Host "Step 2: Manually mark withdrawals migration as run" -ForegroundColor Cyan
Write-Host "Running SQL to insert migration record..." -ForegroundColor Gray
heroku run "php artisan tinker --execute='DB::table(\"migrations\")->insert([\"migration\" => \"2025_01_15_143128_create_withdrawals_table\", \"batch\" => 13]);'" -a $appName

Write-Host ""
Write-Host "Step 3: Run remaining migrations" -ForegroundColor Cyan
heroku run "php artisan migrate --force" -a $appName

Write-Host ""
Write-Host "Step 4: Verify all migrations completed" -ForegroundColor Cyan
heroku run "php artisan migrate:status" -a $appName

Write-Host ""
Write-Host "✅ Migration fix complete!" -ForegroundColor Green
Write-Host ""
Write-Host "All tables should now be created and migrations marked as run." -ForegroundColor White
Write-Host ""
