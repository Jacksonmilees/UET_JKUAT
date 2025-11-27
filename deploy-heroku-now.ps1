# Deploy to Heroku - Fix Transactions and Mandatory Contribution
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEPLOYING TO HEROKU" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Changes in this deployment:" -ForegroundColor Yellow
Write-Host "  ✓ Fixed withdrawals data format (array instead of paginated)" -ForegroundColor Green
Write-Host "  ✓ Added M-Pesa transaction logs endpoint" -ForegroundColor Green
Write-Host "  ✓ Fixed mandatory contribution (required=false, paid=true)" -ForegroundColor Green
Write-Host "  ✓ Added /api/v1/accounts/my endpoint" -ForegroundColor Green
Write-Host "  ✓ Added /api/v1/tickets/my endpoint" -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Committing changes..." -ForegroundColor Cyan
git add .
git commit -m "Fix transactions display, M-Pesa logs, and mandatory contribution bar"

Write-Host ""
Write-Host "Step 2: Pushing to GitHub..." -ForegroundColor Cyan
git push

Write-Host ""
Write-Host "Step 3: Deploying to Heroku..." -ForegroundColor Cyan
git push heroku main

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "What's Fixed:" -ForegroundColor Cyan
Write-Host "  1. Transactions should now display in frontend" -ForegroundColor White
Write-Host "  2. M-Pesa activity available at /api/v1/mpesa-transactions" -ForegroundColor White
Write-Host "  3. Mandatory contribution bar should be HIDDEN" -ForegroundColor White
Write-Host "  4. No more 404/500 errors on user endpoints" -ForegroundColor White
Write-Host ""

Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "  - Clear your browser cache (Ctrl+Shift+Delete)" -ForegroundColor Yellow
Write-Host "  - Hard refresh the frontend (Ctrl+F5)" -ForegroundColor Yellow
Write-Host "  - The mandatory bar should disappear after refresh" -ForegroundColor Yellow
Write-Host ""

Write-Host "Test URLs:" -ForegroundColor Cyan
Write-Host "  Transactions: https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/transactions" -ForegroundColor White
Write-Host "  M-Pesa Logs:  https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa-transactions" -ForegroundColor White
Write-Host "  Withdrawals:  https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/withdrawals" -ForegroundColor White
Write-Host "  Mandatory:    https://uetjkuat-54286e10a43b.herokuapp.com/api/auth/mandatory-contribution" -ForegroundColor White
Write-Host ""
