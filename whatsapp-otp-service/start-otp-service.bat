@echo off
echo ========================================
echo Starting UET JKUAT WhatsApp OTP Service
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting OTP service on port 5001...
echo.
echo IMPORTANT:
echo 1. A browser window will open with WhatsApp Web
echo 2. Scan the QR code with your phone
echo 3. Wait for "LOGIN SUCCESSFUL" message
echo 4. Keep this window open while using the app
echo.
echo Press Ctrl+C to stop the service
echo.

node uet-jkuat-otp.js

pause
