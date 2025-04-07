@echo off
setlocal

echo === Expo Go Tunnel QR Code Launch ===
echo.
echo This launcher creates a tunnel connection which works across different networks
echo.

echo Terminating any Metro processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 2^>nul') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo Setting up environment...
set EXPO_NO_DOCTOR=1

echo.
echo Instructions:
echo 1. A QR code will appear in the terminal after the tunnel is established
echo 2. Scan the QR code with your iOS device's camera
echo 3. Tap "Open in Expo Go" when prompted
echo.
echo Note: This method uses a tunnel and works even if your devices
echo are on different networks. It may take a minute to establish.
echo.

echo Launching Expo with tunnel connection...
npx expo start --tunnel --clear

endlocal 