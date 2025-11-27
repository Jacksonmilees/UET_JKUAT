# Add MMID Column to Members Table
Write-Host "Adding MMID column to members table..." -ForegroundColor Cyan
Write-Host ""

$appName = "uetjkuat"

Write-Host "Step 1: Add MMID column to members table" -ForegroundColor Cyan
heroku run "php artisan tinker --execute='Schema::table(\"members\", function(\$table) { if (!Schema::hasColumn(\"members\", \"MMID\")) { \$table->string(\"MMID\")->unique()->after(\"id\"); } });'" -a $appName

Write-Host ""
Write-Host "Step 2: Add other columns to members table" -ForegroundColor Cyan
heroku run "php artisan tinker --execute='Schema::table(\"members\", function(\$table) { if (!Schema::hasColumn(\"members\", \"name\")) { \$table->string(\"name\")->nullable(); } if (!Schema::hasColumn(\"members\", \"email\")) { \$table->string(\"email\")->nullable(); } if (!Schema::hasColumn(\"members\", \"phone\")) { \$table->string(\"phone\")->nullable(); } });'" -a $appName

Write-Host ""
Write-Host "Step 3: Now run the pending migrations" -ForegroundColor Cyan
heroku run "php artisan migrate --force" -a $appName

Write-Host ""
Write-Host "Step 4: Verify all migrations completed" -ForegroundColor Cyan
heroku run "php artisan migrate:status" -a $appName

Write-Host ""
Write-Host "✅ Done!" -ForegroundColor Green
Write-Host ""
