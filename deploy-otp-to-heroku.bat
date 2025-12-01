@echo off
echo ========================================
echo UET JKUAT - Deploy OTP Integration to Heroku
echo ========================================
echo.

REM Check if in correct directory
if not exist "routes\api.php" (
    echo ERROR: Please run this script from the project root directory
    pause
    exit /b 1
)

echo Step 1: Checking git status...
git status
echo.

echo Step 2: Adding all changes...
git add .
echo.

echo Step 3: Committing changes...
git commit -m "Add WhatsApp OTP authentication integration - Email/Phone login with OTP verification"
echo.

echo Step 4: Pushing to GitHub...
git push origin main
echo.

echo Step 5: Setting Heroku environment variable...
echo Please enter your Heroku app name:
set /p HEROKU_APP=App name: 

heroku config:set OTP_SERVICE_URL=http://localhost:5001 -a %HEROKU_APP%
echo.

echo Step 6: Deploying to Heroku...
git push heroku main
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start OTP service locally: cd whatsapp-otp-service ^&^& npm install ^&^& npm start
echo 2. Scan WhatsApp QR code when prompted
echo 3. Test login with OTP on your frontend
echo.
echo To check deployment status:
echo   heroku logs --tail -a %HEROKU_APP%
echo.
echo To test OTP service:
echo   curl https://%HEROKU_APP%.herokuapp.com/api/auth/otp/status
echo.

pause
