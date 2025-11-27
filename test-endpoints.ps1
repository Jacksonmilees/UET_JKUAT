# Test All Endpoints After Deployment
Write-Host "Testing Heroku Endpoints..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://uetjkuat-54286e10a43b.herokuapp.com"

# Test 1: Transactions
Write-Host "1. Testing /api/v1/transactions..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/transactions" -Method Get
    Write-Host "   ✓ Status: SUCCESS" -ForegroundColor Green
    Write-Host "   ✓ Data count: $($response.data.Count)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Withdrawals
Write-Host "2. Testing /api/v1/withdrawals..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/withdrawals" -Method Get
    Write-Host "   ✓ Status: SUCCESS" -ForegroundColor Green
    Write-Host "   ✓ Data count: $($response.data.Count)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: M-Pesa Transactions
Write-Host "3. Testing /api/v1/mpesa-transactions..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/mpesa-transactions" -Method Get
    Write-Host "   ✓ Status: SUCCESS" -ForegroundColor Green
    Write-Host "   ✓ Data count: $($response.data.Count)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Mandatory Contribution
Write-Host "4. Testing /api/auth/mandatory-contribution..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/mandatory-contribution" -Method Get
    Write-Host "   ✓ Status: SUCCESS" -ForegroundColor Green
    Write-Host "   ✓ Required: $($response.data.required)" -ForegroundColor Green
    Write-Host "   ✓ Paid: $($response.data.paid)" -ForegroundColor Green
    
    if ($response.data.required -eq $false -and $response.data.paid -eq $true) {
        Write-Host "   ✓ MANDATORY BAR SHOULD BE HIDDEN!" -ForegroundColor Green
    } else {
        Write-Host "   ✗ WARNING: Bar might still show!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Accounts My
Write-Host "5. Testing /api/v1/accounts/my..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/accounts/my" -Method Get
    Write-Host "   ✓ Status: SUCCESS (no more 500 error)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 6: Tickets My
Write-Host "6. Testing /api/v1/tickets/my..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/tickets/my" -Method Get
    Write-Host "   ✓ Status: SUCCESS (no more 404 error)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all tests passed, refresh your frontend!" -ForegroundColor Green
Write-Host ""
