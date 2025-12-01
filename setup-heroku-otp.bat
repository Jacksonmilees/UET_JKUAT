@echo off
echo ========================================
echo UET JKUAT - Heroku OTP Configuration
echo App: uetjkuat-54286e10a43b
echo ========================================
echo.

echo Step 1: Setting OTP Service URL...
heroku config:set OTP_SERVICE_URL=http://localhost:5001 -a uetjkuat-54286e10a43b
echo.

echo Step 2: Clearing config cache...
heroku run php artisan config:clear -a uetjkuat-54286e10a43b
echo.

echo Step 3: Restarting Heroku app...
heroku restart -a uetjkuat-54286e10a43b
echo.

echo Step 4: Checking configuration...
heroku config -a uetjkuat-54286e10a43b
echo.

echo ========================================
echo Configuration Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Start OTP service: cd whatsapp-otp-service ^&^& npm start
echo 2. Scan WhatsApp QR code
echo 3. Test login at: https://uetjkuat-54286e10a43b.herokuapp.com
echo.
echo To check logs:
echo   heroku logs --tail -a uetjkuat-54286e10a43b
echo.
echo To test OTP status:
echo   curl https://uetjkuat-54286e10a43b.herokuapp.com/api/auth/otp/status
echo.

pause
