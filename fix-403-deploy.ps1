# Fix 403 Errors - Deploy Updated Routes
Write-Host "Deploying fix for 403 Forbidden errors..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Changes:" -ForegroundColor Yellow
Write-Host "- Made GET /api/v1/transactions publicly accessible" -ForegroundColor White
Write-Host "- Made GET /api/v1/withdrawals publicly accessible" -ForegroundColor White
Write-Host "- Removed duplicate routes from protected section" -ForegroundColor White
Write-Host "- POST operations still require API key for security" -ForegroundColor White
Write-Host ""

git add routes/api.php
git commit -m "Fix 403 errors - make transactions and withdrawals GET endpoints public"
git push

Write-Host ""
Write-Host "✅ Deployed!" -ForegroundColor Green
Write-Host ""
Write-Host "The frontend should now be able to access:" -ForegroundColor Cyan
Write-Host "  - GET /api/v1/transactions" -ForegroundColor White
Write-Host "  - GET /api/v1/withdrawals" -ForegroundColor White
Write-Host "  - GET /api/v1/news" -ForegroundColor White
Write-Host ""
Write-Host "Test the fix by refreshing your frontend app." -ForegroundColor Yellow
Write-Host ""
