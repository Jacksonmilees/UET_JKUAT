# Import Real M-Pesa Transactions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   IMPORTING REAL M-PESA TRANSACTIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This will fetch and import your actual M-Pesa transactions" -ForegroundColor Yellow
Write-Host "from the external API into your database." -ForegroundColor Yellow
Write-Host ""

# Deploy the changes first
Write-Host "Step 1: Deploying M-Pesa import feature..." -ForegroundColor Cyan
git add .
git commit -m "Add M-Pesa real transaction import feature"
git push

Write-Host ""
Write-Host "Waiting 60 seconds for auto-deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

Write-Host ""
Write-Host "Step 2: Importing real M-Pesa transactions..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/import-real-transactions" -Method Post
    
    if ($response.status -eq "success") {
        Write-Host "✅ M-PESA IMPORT SUCCESSFUL!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Import Summary:" -ForegroundColor Cyan
        Write-Host "  Imported: $($response.data.imported) transactions" -ForegroundColor Green
        Write-Host "  Skipped: $($response.data.skipped) (duplicates)" -ForegroundColor Yellow
        Write-Host "  Failed: $($response.data.failed)" -ForegroundColor Red
        Write-Host ""
        Write-Host "💰 Account Balance:" -ForegroundColor Cyan
        Write-Host "  Account: $($response.data.account.reference)" -ForegroundColor White
        Write-Host "  Total Amount: KES $($response.data.total_amount)" -ForegroundColor White
        Write-Host ""
        
        if ($response.data.recent_transactions.Count -gt 0) {
            Write-Host "📋 Recent Imported Transactions:" -ForegroundColor Cyan
            $response.data.recent_transactions | Select-Object -First 5 | ForEach-Object {
                Write-Host "  ✓ KES $($_.amount) from $($_.payer_name)" -ForegroundColor Green
                Write-Host "    Phone: $($_.phone_number) | Ref: $($_.reference)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "❌ Import Failed: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error importing transactions:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "This might mean:" -ForegroundColor Yellow
    Write-Host "  - The external M-Pesa API is not accessible" -ForegroundColor White
    Write-Host "  - No transactions are available to import" -ForegroundColor White
    Write-Host "  - The API endpoint is not configured correctly" -ForegroundColor White
}

Write-Host ""
Write-Host "Step 3: Checking import statistics..." -ForegroundColor Cyan

try {
    $stats = Invoke-RestMethod -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/import-stats" -Method Get
    
    Write-Host "📊 Overall Statistics:" -ForegroundColor Green
    Write-Host "  Total Transactions: $($stats.data.total_transactions)" -ForegroundColor White
    Write-Host "  M-Pesa Transactions: $($stats.data.mpesa_transactions)" -ForegroundColor White
    Write-Host "  Imported from API: $($stats.data.imported_transactions)" -ForegroundColor White
    Write-Host "  Total Amount: KES $($stats.data.total_amount)" -ForegroundColor White
} catch {
    Write-Host "⚠️ Could not fetch statistics" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 4: Verifying transactions in frontend..." -ForegroundColor Cyan

try {
    $transactions = Invoke-RestMethod -Uri "https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/transactions" -Method Get
    
    Write-Host "✅ Transactions Endpoint Working!" -ForegroundColor Green
    Write-Host "  Total visible: $($transactions.total_count) transactions" -ForegroundColor White
    
    if ($transactions.total_count -gt 0) {
        Write-Host ""
        Write-Host "Recent transactions:" -ForegroundColor Cyan
        $transactions.data | Select-Object -First 5 | ForEach-Object {
            Write-Host "  • KES $($_.amount) - $($_.payer_name)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Error checking transactions" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ✅ IMPORT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Clear your browser cache (Ctrl+F5)" -ForegroundColor White
Write-Host "  2. Refresh your frontend" -ForegroundColor White
Write-Host "  3. You should now see your REAL M-Pesa transactions!" -ForegroundColor White
Write-Host ""

Write-Host "To import more transactions later:" -ForegroundColor Yellow
Write-Host "  Invoke-RestMethod -Uri 'https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/mpesa/import-real-transactions' -Method Post" -ForegroundColor Gray
Write-Host ""
