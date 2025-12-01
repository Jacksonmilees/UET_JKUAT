@echo off
echo ========================================
echo Deploy WhatsApp OTP Service to Heroku
echo ========================================
echo.

echo This will create a SEPARATE Heroku app for the OTP service
echo Main backend: uetjkuat
echo OTP service: uetjkuat-otp
echo.

cd whatsapp-otp-service

echo Step 1: Initialize git repository...
if not exist ".git" (
    git init
)
echo.

echo Step 2: Create Heroku app for OTP service...
heroku create uetjkuat-otp
echo.

echo Step 3: Add Puppeteer buildpack...
heroku buildpacks:add --index 1 https://github.com/jontewks/puppeteer-heroku-buildpack -a uetjkuat-otp
heroku buildpacks:add --index 2 heroku/nodejs -a uetjkuat-otp
echo.

echo Step 4: Set environment variables...
heroku config:set NODE_ENV=production -a uetjkuat-otp
heroku config:set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true -a uetjkuat-otp
echo.

echo Step 5: Add and commit files...
git add .
git commit -m "Deploy UET JKUAT OTP service"
echo.

echo Step 6: Add Heroku remote...
heroku git:remote -a uetjkuat-otp
echo.

echo Step 7: Deploy to Heroku...
git push heroku main
echo.

echo Step 8: Configure main backend to use OTP service...
cd ..
heroku config:set OTP_SERVICE_URL=https://uetjkuat-otp.herokuapp.com -a uetjkuat
echo.

echo Step 9: Clear cache and restart main backend...
heroku run php artisan config:clear -a uetjkuat
heroku restart -a uetjkuat
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo OTP Service URL: https://uetjkuat-otp.herokuapp.com
echo Main Backend URL: https://uetjkuat.herokuapp.com
echo.
echo Check OTP service status:
echo   curl https://uetjkuat-otp.herokuapp.com/status
echo.
echo Check OTP service logs:
echo   heroku logs --tail -a uetjkuat-otp
echo.
echo IMPORTANT: You need to authenticate WhatsApp once:
echo   heroku run bash -a uetjkuat-otp
echo   Then manually trigger WhatsApp login (this is a one-time setup)
echo.

pause
