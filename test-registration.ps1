# Test Registration Endpoint
$url = "https://uetjkuat-54286e10a43b.herokuapp.com/api/auth/register"

$body = @{
    name = "Test User"
    email = "testuser$(Get-Random)@example.com"
    password = "password123"
    phoneNumber = "0712345678"
    yearOfStudy = "Year 2"
    course = "Computer Science"
    college = "JKUAT"
    admissionNumber = "SCT211-$(Get-Random -Minimum 1000 -Maximum 9999)/2023"
    ministryInterest = "Media & Communications"
    residence = "Juja"
} | ConvertTo-Json

Write-Host "Testing registration endpoint..." -ForegroundColor Cyan
Write-Host "URL: $url" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
    
    if ($response.data.user.member_id) {
        Write-Host ""
        Write-Host "🎉 Member ID Generated: $($response.data.user.member_id)" -ForegroundColor Magenta
    }
} catch {
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host ""
        Write-Host "Details:" -ForegroundColor Yellow
        $_.ErrorDetails.Message
    }
}
