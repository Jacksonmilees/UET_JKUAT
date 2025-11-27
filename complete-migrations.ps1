# Complete All Remaining Migrations
Write-Host "Completing all migrations..." -ForegroundColor Cyan
Write-Host ""

git add .
git commit -m "Simplify withdrawal update migration"
git push
git push heroku main

Write-Host ""
Write-Host "Running final migrations..." -ForegroundColor Yellow
heroku run "php artisan migrate --force" -a uetjkuat

Write-Host ""
Write-Host "Final status:" -ForegroundColor Cyan
heroku run "php artisan migrate:status" -a uetjkuat

Write-Host ""
Write-Host "✅ Complete!" -ForegroundColor Green
