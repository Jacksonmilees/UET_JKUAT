# PowerShell script to clear Laravel caches on Heroku
# Usage: .\clear-heroku-cache.ps1

$APP_NAME = "uetjkuat-54286e10a43b"

Write-Host "🧹 Clearing Laravel caches on Heroku..." -ForegroundColor Cyan
Write-Host "App: $APP_NAME" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣ Clearing config cache..." -ForegroundColor Yellow
heroku run php artisan config:clear --app $APP_NAME

Write-Host ""
Write-Host "2️⃣ Clearing application cache..." -ForegroundColor Yellow
heroku run php artisan cache:clear --app $APP_NAME

Write-Host ""
Write-Host "3️⃣ Clearing route cache..." -ForegroundColor Yellow
heroku run php artisan route:clear --app $APP_NAME

Write-Host ""
Write-Host "4️⃣ Clearing view cache..." -ForegroundColor Yellow
heroku run php artisan view:clear --app $APP_NAME

Write-Host ""
Write-Host "✅ All caches cleared! CORS should now work." -ForegroundColor Green
Write-Host ""
Write-Host "🧪 Test CORS by visiting:" -ForegroundColor Cyan
Write-Host "   https://uetjkuat-54286e10a43b.herokuapp.com/api/cors-test" -ForegroundColor Cyan

