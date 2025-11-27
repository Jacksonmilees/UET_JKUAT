# Deploy to Heroku with enhanced logging
Write-Host "Deploying to Heroku..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not a git repository. Initializing..." -ForegroundColor Red
    git init
    git add .
    git commit -m "Initial commit with enhanced logging"
}

# Add changes
Write-Host "1. Adding changes..." -ForegroundColor Yellow
git add app/Http/Controllers/API/AuthController.php
git status

Write-Host ""
Write-Host "2. Committing changes..." -ForegroundColor Yellow
git commit -m "Add enhanced error logging for registration endpoint"

Write-Host ""
Write-Host "3. Pushing to Heroku..." -ForegroundColor Yellow
git push heroku main 

Write-Host ""
Write-Host "4. Running migrations..." -ForegroundColor Yellow
heroku run "php artisan migrate --force" -a uetjkuat

Write-Host ""
Write-Host "5. Checking deployment..." -ForegroundColor Yellow
heroku ps -a uetjkuat

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To view logs, run:" -ForegroundColor Cyan
Write-Host "   heroku logs --tail" -ForegroundColor White
Write-Host ""
Write-Host "To test registration, run:" -ForegroundColor Cyan
Write-Host "   .\test-registration.ps1" -ForegroundColor White
Write-Host ""
