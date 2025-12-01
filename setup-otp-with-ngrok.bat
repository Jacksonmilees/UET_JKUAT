@echo off
echo ========================================
echo Setup OTP Service with ngrok
echo ========================================
echo.

echo This script will help you set up OTP service locally with ngrok
echo.

echo Step 1: Check if ngrok is installed...
where ngrok >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: ngrok is not installed!
    echo.
    echo Please download and install ngrok:
    echo 1. Go to: https://ngrok.com/download
    echo 2. Download ngrok for Windows
    echo 3. Extract to a folder in your PATH
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)
echo ngrok is installed! ✓
echo.

echo Step 2: Starting OTP service...
echo Opening new window for OTP service...
start "UET JKUAT OTP Service" cmd /k "cd whatsapp-otp-service && npm start"
echo.
echo Waiting for OTP service to start...
timeout /t 5 /nobreak >nul
echo.

echo Step 3: Starting ngrok tunnel...
echo Opening new window for ngrok...
start "ngrok Tunnel" cmd /k "ngrok http 5001"
echo.
echo.
echo ========================================
echo IMPORTANT: Follow these steps
echo ========================================
echo.
echo 1. Look at the ngrok window
echo 2. Find the "Forwarding" line, it will show something like:
echo    Forwarding: https://abc123.ngrok.io -> http://localhost:5001
echo.
echo 3. Copy the ngrok URL (e.g., https://abc123.ngrok.io)
echo.
echo 4. Run this command with YOUR ngrok URL:
echo    heroku config:set OTP_SERVICE_URL=https://YOUR-NGROK-URL -a uetjkuat
echo.
echo 5. Clear cache:
echo    heroku run php artisan config:clear -a uetjkuat
echo.
echo 6. Restart backend:
echo    heroku restart -a uetjkuat
echo.
echo 7. In the OTP service window, scan WhatsApp QR code
echo.
echo 8. Test it works:
echo    curl https://uetjkuat.herokuapp.com/api/auth/otp/status
echo.
echo ========================================
echo Keep both windows open while using OTP!
echo ========================================
echo.

pause
