@echo off
echo ========================================
echo Configure UET JKUAT Backend for OTP
echo App: uetjkuat
echo ========================================
echo.

echo Step 1: Setting OTP Service URL to Heroku...
heroku config:set OTP_SERVICE_URL=https://uetjkuat-otp.herokuapp.com -a uetjkuat
echo.

echo Step 2: Clearing config cache...
heroku run php artisan config:clear -a uetjkuat
echo.

echo Step 3: Restarting app...
heroku restart -a uetjkuat
echo.

echo Step 4: Checking configuration...
heroku config -a uetjkuat | findstr OTP
echo.

echo ========================================
echo Configuration Complete!
echo ========================================
echo.
echo Backend URL: https://uetjkuat.herokuapp.com
echo OTP Service URL: https://uetjkuat-otp.herokuapp.com
echo.
echo Test OTP integration:
echo   curl https://uetjkuat.herokuapp.com/api/auth/otp/status
echo.
echo Check backend logs:
echo   heroku logs --tail -a uetjkuat
echo.

pause
