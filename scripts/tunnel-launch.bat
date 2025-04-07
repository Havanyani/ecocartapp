@echo off
echo === EcoCart Tunnel Launcher ===
echo.
echo This launcher uses Expo's tunnel feature for more reliable connections across different networks

echo Checking for processes using port 8081...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 2^>nul') do (
    echo Found process on port 8081: %%a
    echo Terminating process...
    taskkill /F /PID %%a 2>nul
    echo Process terminated.
)

echo.
echo TUNNEL CONNECTION INSTRUCTIONS:
echo ==============================
echo 1. When the QR code appears, scan it with the Expo Go app on your iOS device
echo 2. The tunnel allows your device to connect even if it's on a different network
echo 3. Note: The first connection may take longer than usual
echo.

echo Setting up tunnel environment...
set EXPO_NO_DOCTOR=true

echo Starting Expo with tunnel connection...
echo This may take a moment to establish the tunnel...
echo.

npx expo start --tunnel --clear 