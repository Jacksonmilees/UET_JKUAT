# PowerShell script to test Heroku API endpoints
# Usage: .\test-heroku-api.ps1

$baseUrl = "https://uetjkuat-54286e10a43b.herokuapp.com"
$apiUrl = "$baseUrl/api"

Write-Host "🧪 Testing Heroku API Endpoints" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Gray
Write-Host ""

# Test 1: Root endpoint
Write-Host "1️⃣ Testing root endpoint (/)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Content-Type: $($response.Headers['Content-Type'])" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 2: Health endpoint
Write-Host "2️⃣ Testing health endpoint (/api/health)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/health" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $content = $response.Content | ConvertFrom-Json
    Write-Host "   Response: $($content | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 3: CORS test endpoint
Write-Host "3️⃣ Testing CORS endpoint (/api/cors-test)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "https://uet-jkuat.vercel.app"
    }
    $response = Invoke-WebRequest -Uri "$apiUrl/cors-test" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $content = $response.Content | ConvertFrom-Json
    Write-Host "   Response: $($content | ConvertTo-Json -Compress)" -ForegroundColor Gray
    
    # Check CORS headers
    if ($response.Headers['Access-Control-Allow-Origin']) {
        Write-Host "   ✅ CORS Header: $($response.Headers['Access-Control-Allow-Origin'])" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  No CORS header found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 4: OPTIONS preflight request
Write-Host "4️⃣ Testing CORS preflight (OPTIONS)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "https://uet-jkuat.vercel.app"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type, Authorization"
    }
    $response = Invoke-WebRequest -Uri "$apiUrl/cors-test" -Method OPTIONS -Headers $headers -ErrorAction Stop
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    
    # Check CORS headers
    if ($response.Headers['Access-Control-Allow-Origin']) {
        Write-Host "   ✅ Access-Control-Allow-Origin: $($response.Headers['Access-Control-Allow-Origin'])" -ForegroundColor Green
    }
    if ($response.Headers['Access-Control-Allow-Methods']) {
        Write-Host "   ✅ Access-Control-Allow-Methods: $($response.Headers['Access-Control-Allow-Methods'])" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 5: Projects endpoint (requires API key)
Write-Host "5️⃣ Testing projects endpoint (/api/v1/projects)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/v1/projects" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $content = $response.Content | ConvertFrom-Json
    Write-Host "   Projects count: $($content.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        if ($_.Exception.Response.StatusCode.value__ -eq 401) {
            Write-Host "   ℹ️  This endpoint requires API key authentication" -ForegroundColor Cyan
        }
    }
}
Write-Host ""

# Test 6: STK Push endpoint (POST - will fail without proper data, but tests if route exists)
Write-Host "6️⃣ Testing STK Push endpoint (/api/v1/payments/mpesa)..." -ForegroundColor Yellow
$stkPayload = @{
    phone_number = "254712345678"
    amount = 100
    account_number = "TEST123"
} | ConvertTo-Json

try {
    $headers = @{
        "Content-Type" = "application/json"
        "Accept" = "application/json"
    }
    $response = Invoke-WebRequest -Uri "$apiUrl/v1/payments/mpesa" -Method POST -Body $stkPayload -Headers $headers -ErrorAction Stop
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $content = $response.Content | ConvertFrom-Json
    Write-Host "   Response: $($content | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Status: $statusCode" -ForegroundColor Red
        
        # Try to read error response
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "   Error Body: $errorBody" -ForegroundColor Yellow
        } catch {
            Write-Host "   ℹ️  Could not read error response body" -ForegroundColor Cyan
        }
        
        if ($statusCode -eq 404) {
            Write-Host "   ⚠️  Route not found - Laravel might not be serving API routes" -ForegroundColor Yellow
        } elseif ($statusCode -eq 422) {
            Write-Host "   ℹ️  Validation error (expected with test data)" -ForegroundColor Cyan
        } elseif ($statusCode -eq 500) {
            Write-Host "   ⚠️  Server error - check Heroku logs" -ForegroundColor Yellow
        }
    }
}
Write-Host ""
Write-Host ""

# Test 7: Debug middleware endpoint
Write-Host "7️⃣ Testing debug middleware endpoint (/api/debug-middleware)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/debug-middleware" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $content = $response.Content | ConvertFrom-Json
    Write-Host "   Middleware registered: $($content.middleware_aliases.Count) aliases" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all endpoints return 404:" -ForegroundColor Yellow
Write-Host "  • Heroku might be serving static files instead of Laravel" -ForegroundColor White
Write-Host "  • Check if Procfile exists and is configured correctly" -ForegroundColor White
Write-Host "  • Verify Heroku is using PHP buildpack" -ForegroundColor White
Write-Host "  • Check Heroku logs: heroku logs --tail --app uetjkuat-54286e10a43b" -ForegroundColor White
Write-Host ""
Write-Host "If CORS is not working:" -ForegroundColor Yellow
Write-Host "  • Clear config cache: heroku run php artisan config:clear --app uetjkuat-54286e10a43b" -ForegroundColor White
Write-Host "  • Verify CORS config is deployed" -ForegroundColor White
Write-Host ""

