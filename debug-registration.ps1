# Debug Registration Endpoint
$url = "https://uetjkuat-54286e10a43b.herokuapp.com/api/auth/register"

$testCases = @(
    @{
        name = "Full Registration Data"
        data = @{
            name = "Test User Full"
            email = "testfull$(Get-Random)@example.com"
            password = "password123"
            phoneNumber = "0712345678"
            yearOfStudy = "Year 2"
            course = "Computer Science"
            college = "JKUAT"
            admissionNumber = "SCT211-$(Get-Random -Minimum 1000 -Maximum 9999)/2023"
            ministryInterest = "Media & Communications"
            residence = "Juja"
        }
    },
    @{
        name = "Minimal Registration Data"
        data = @{
            name = "Test User Minimal"
            email = "testmin$(Get-Random)@example.com"
            password = "password123"
        }
    },
    @{
        name = "Invalid Email"
        data = @{
            name = "Test User"
            email = "invalidemail"
            password = "password123"
        }
    },
    @{
        name = "Short Password"
        data = @{
            name = "Test User"
            email = "test$(Get-Random)@example.com"
            password = "12345"
        }
    }
)

foreach ($testCase in $testCases) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Test: $($testCase.name)" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    $body = $testCase.data | ConvertTo-Json
    
    Write-Host "Request Body:" -ForegroundColor Yellow
    Write-Host $body -ForegroundColor Gray
    Write-Host ""
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        
        Write-Host "✅ SUCCESS!" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Yellow
        $response | ConvertTo-Json -Depth 10
        
        if ($response.data.user.member_id) {
            Write-Host "🎉 Member ID: $($response.data.user.member_id)" -ForegroundColor Magenta
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "❌ FAILED - Status: $statusCode" -ForegroundColor Red
        
        if ($_.ErrorDetails.Message) {
            Write-Host "Error Details:" -ForegroundColor Yellow
            try {
                $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
                $errorObj | ConvertTo-Json -Depth 10
            } catch {
                Write-Host $_.ErrorDetails.Message
            }
        } else {
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Start-Sleep -Seconds 1
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Testing Complete" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
