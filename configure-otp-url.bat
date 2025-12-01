@echo off
echo ========================================
echo Configure UET JKUAT Backend with OTP Service
echo ========================================
echo.

echo Enter your OTP service Heroku URL
echo Example: https://uetjkuat-otp.herokuapp.com
echo.
set /p OTP_URL=OTP Service URL: 

echo.
echo Configuring backend (uetjkuat) to use: %OTP_URL%
echo.

echo Step 1: Setting OTP_SERVICE_URL...
heroku config:set OTP_SERVICE_URL=%OTP_URL% -a uetjkuat
echo.

echo Step 2: Clearing config cache...
heroku run php artisan config:clear -a uetjkuat
echo.

echo Step 3: Restarting backend...
heroku restart -a uetjkuat
echo.

echo Step 4: Verifying configuration...
heroku config -a uetjkuat | findstr OTP
echo.

echo ========================================
echo Configuration Complete!
echo ========================================
echo.
echo Backend: https://uetjkuat.herokuapp.com
echo OTP Service: %OTP_URL%
echo.
echo Test the integration:
echo   curl https://uetjkuat.herokuapp.com/api/auth/otp/status
echo.
echo Check backend logs:
echo   heroku logs --tail -a uetjkuat
echo.

pause
