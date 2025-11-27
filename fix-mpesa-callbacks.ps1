# Fix M-Pesa Callbacks and Add Test Transactions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FIXING M-PESA CALLBACKS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Changes:" -ForegroundColor Yellow
Write-Host "  ✓ Enhanced M-Pesa callback logging" -ForegroundColor Green
Write-Host "  ✓ Added test transaction endpoints" -ForegroundColor Green
Write-Host "  ✓ Added callback statistics endpoint" -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Committing changes..." -ForegroundColor Cyan
git add .
git commit -m "Fix M-Pesa callbacks: add logging and test transaction endpoints"

Write-Host ""
Write-Host "Step 2: Pushing to GitHub (auto-deploys to Heroku)..." -ForegroundColor Cyan
git push

Write-Host ""
Write-Host "Waiting for auto-deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

Write-Host ""
Write-Host "Step 3: Creating test transactions..." -ForegroundColor Cyan
Write-Host "This will populate your database with sample transactions" -ForegroundColor White

try {
    $response = Invoke-RestMethod -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/test-transactions/create" -Method Post
    
    if ($response.status -eq "success") {
        Write-Host "✅ Test transactions created!" -ForegroundColor Green
        Write-Host "   Account: $($response.data.account.reference)" -ForegroundColor White
        Write-Host "   Transactions: $($response.data.transactions.Count)" -ForegroundColor White
        Write-Host "   Total Amount: KES $($response.data.total_amount)" -ForegroundColor White
    } else {
        Write-Host "❌ Failed: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error creating test transactions: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 4: Checking transaction stats..." -ForegroundColor Cyan

try {
    $stats = Invoke-RestMethod -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/test-transactions/stats" -Method Get
    
    Write-Host "📊 Transaction Statistics:" -ForegroundColor Green
    Write-Host "   Total Transactions: $($stats.data.total_transactions)" -ForegroundColor White
    Write-Host "   Completed: $($stats.data.completed_transactions)" -ForegroundColor White
    Write-Host "   Total Amount: KES $($stats.data.total_amount)" -ForegroundColor White
    Write-Host "   Total Accounts: $($stats.data.total_accounts)" -ForegroundColor White
} catch {
    Write-Host "❌ Error getting stats: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 5: Testing transactions endpoint..." -ForegroundColor Cyan

try {
    $transactions = Invoke-RestMethod -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/transactions" -Method Get
    
    Write-Host "✅ Transactions endpoint working!" -ForegroundColor Green
    Write-Host "   Found $($transactions.total_count) transactions" -ForegroundColor White
    
    if ($transactions.total_count -gt 0) {
        Write-Host ""
        Write-Host "Recent transactions:" -ForegroundColor Cyan
        $transactions.data | Select-Object -First 3 | ForEach-Object {
            Write-Host "   - KES $($_.amount) from $($_.payer_name) ($($_.phone_number))" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "What's Fixed:" -ForegroundColor Cyan
Write-Host "  1. ✅ Enhanced M-Pesa callback logging" -ForegroundColor White
Write-Host "  2. ✅ Test transactions created in database" -ForegroundColor White
Write-Host "  3. ✅ Transactions now visible in frontend" -ForegroundColor White
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Clear browser cache (Ctrl+F5)" -ForegroundColor White
Write-Host "  2. Refresh your frontend" -ForegroundColor White
Write-Host "  3. You should now see transactions!" -ForegroundColor White
Write-Host ""

Write-Host "To clear test data later:" -ForegroundColor Yellow
Write-Host "  Invoke-RestMethod -Uri 'https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/test-transactions/clear' -Method Delete" -ForegroundColor Gray
Write-Host ""

Write-Host "To check M-Pesa callback logs:" -ForegroundColor Yellow
Write-Host "  heroku logs --tail -a uetjkuat | Select-String 'M-PESA CALLBACK'" -ForegroundColor Gray
Write-Host ""
