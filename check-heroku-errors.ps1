# PowerShell script to check Heroku error details
# Usage: .\check-heroku-errors.ps1

Write-Host "🔍 Checking Heroku Error Details" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣ Getting recent error logs..." -ForegroundColor Yellow
Write-Host "Run this command to see detailed errors:" -ForegroundColor Gray
Write-Host "heroku logs --tail --app uetjkuat-54286e10a43b | Select-String -Pattern 'error|Error|ERROR|exception|Exception|EXCEPTION'" -ForegroundColor Green
Write-Host ""

Write-Host "2️⃣ Checking environment variables..." -ForegroundColor Yellow
Write-Host "Run this command:" -ForegroundColor Gray
Write-Host "heroku config --app uetjkuat-54286e10a43b" -ForegroundColor Green
Write-Host ""

Write-Host "3️⃣ Common issues to check:" -ForegroundColor Yellow
Write-Host "  ❓ Is APP_KEY set?" -ForegroundColor White
Write-Host "  ❓ Are database credentials configured?" -ForegroundColor White
Write-Host "  ❓ Are M-Pesa credentials set (if using STK push)?" -ForegroundColor White
Write-Host "  ❓ Is APP_ENV set to 'production'?" -ForegroundColor White
Write-Host ""

Write-Host "4️⃣ Quick fixes to try:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Generate APP_KEY:" -ForegroundColor Cyan
Write-Host "  heroku run php artisan key:generate --app uetjkuat-54286e10a43b" -ForegroundColor Green
Write-Host ""
Write-Host "Clear caches:" -ForegroundColor Cyan
Write-Host "  heroku run php artisan config:clear --app uetjkuat-54286e10a43b" -ForegroundColor Green
Write-Host "  heroku run php artisan cache:clear --app uetjkuat-54286e10a43b" -ForegroundColor Green
Write-Host ""
Write-Host "Check if database is accessible:" -ForegroundColor Cyan
Write-Host "  heroku run php artisan tinker --app uetjkuat-54286e10a43b" -ForegroundColor Green
Write-Host "  Then run: DB::connection()->getPdo();" -ForegroundColor Gray
Write-Host ""

