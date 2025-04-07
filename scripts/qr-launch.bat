@echo off
setlocal enabledelayedexpansion
echo === EcoCart QR Code Launcher ===
echo.
echo This launcher is optimized for testing on iOS/Android devices using Expo Go

echo Checking for processes using port 8081...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 2^>nul') do (
    echo Found process on port 8081: %%a
    echo Terminating process...
    taskkill /F /PID %%a 2>nul
    echo Process terminated.
)

echo.
echo Getting network information...

REM Get local IP address for development server
set LOCAL_IP=127.0.0.1
FOR /F "tokens=2 delims=:" %%i IN ('ipconfig ^| findstr /c:"IPv4 Address"') DO (
    set LOCAL_IP=%%i
    set LOCAL_IP=!LOCAL_IP:~1!
    goto :found_ip
)
:found_ip

echo.
echo Your development machine's IP address: !LOCAL_IP!
echo.
echo IMPORTANT CONNECTION INSTRUCTIONS:
echo ===================================
echo 1. Make sure your iOS device and computer are on the same Wi-Fi network
echo 2. Ensure your firewall allows connections on ports 8081 and 19000-19002
echo 3. If the QR code doesn't connect, try the following on your iOS device:
echo    - Open Expo Go app
echo    - Click "Enter URL manually"
echo    - Enter: exp://!LOCAL_IP!:19000
echo.

REM Set important environment variables
set REACT_NATIVE_PACKAGER_HOSTNAME=!LOCAL_IP!
set EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
set EXPO_NO_DOCTOR=true

echo Starting Expo server and generating QR code...
echo When the QR code appears, scan it with the Expo Go app on your iOS device
echo.

REM Use the clear flag to ensure clean start
npx expo start --clear 