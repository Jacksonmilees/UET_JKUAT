# Check Heroku Database Status
Write-Host "Checking Heroku database and migrations..." -ForegroundColor Cyan
Write-Host ""

# Test if API is reachable
$baseUrl = "https://uetjkuat-54286e10a43b.herokuapp.com"

Write-Host "1. Testing API health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/health" -Method Get -ErrorAction SilentlyContinue
    Write-Host "   ✅ API is reachable" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Health endpoint not found (expected)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "2. Testing auth/me endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/me" -Method Get -ErrorAction SilentlyContinue
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   Status: $statusCode (expected 401 Unauthorized)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "3. Run these commands in your terminal to check Heroku:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   # Check if migrations have been run" -ForegroundColor Yellow
Write-Host "   heroku run `"php artisan migrate:status`" -a uetjkuat" -ForegroundColor White
Write-Host ""
Write-Host "   # Run migrations if needed" -ForegroundColor Yellow
Write-Host "   heroku run `"php artisan migrate --force`" -a uetjkuat" -ForegroundColor White
Write-Host ""
Write-Host "   # Check database connection" -ForegroundColor Yellow
Write-Host "   heroku run `"php artisan db:show`" -a uetjkuat" -ForegroundColor White
Write-Host ""
Write-Host "   # View recent logs" -ForegroundColor Yellow
Write-Host "   heroku logs --tail -a uetjkuat" -ForegroundColor White
Write-Host ""
Write-Host "   # Check config vars" -ForegroundColor Yellow
Write-Host "   heroku config -a uetjkuat" -ForegroundColor White
Write-Host ""
