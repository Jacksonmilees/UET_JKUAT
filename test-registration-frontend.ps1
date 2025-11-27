# Test Registration with Frontend Data Format
$url = "https://uetjkuat-54286e10a43b.herokuapp.com/api/auth/register"

# Simulate exact frontend payload
$body = @{
    name = "John Doe"
    email = "john.doe@example.com"
    password = "password123"
    phoneNumber = "0712345678"
    yearOfStudy = "First Year"
    course = "Computer Science"
    college = "JKUAT"
    admissionNumber = "SCT211-1234/2023"
    ministryInterest = "Media & Communications"
    residence = "Juja"
} | ConvertTo-Json

Write-Host "Testing registration with frontend format..." -ForegroundColor Cyan
Write-Host "URL: $url" -ForegroundColor Gray
Write-Host ""
Write-Host "Payload:" -ForegroundColor Yellow
$body
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host ""
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host ""
        Write-Host "Error Details:" -ForegroundColor Yellow
        $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
        $errorObj | ConvertTo-Json -Depth 10
        
        if ($errorObj.errors) {
            Write-Host ""
            Write-Host "Validation Errors:" -ForegroundColor Magenta
            $errorObj.errors | Format-List
        }
    }
}
