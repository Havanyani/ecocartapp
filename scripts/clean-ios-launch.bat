@echo off
setlocal

echo === Expo Go QR Code Launch ===
echo.
echo Terminating any Metro processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 2^>nul') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo Setting up clean environment...
set EXPO_PUBLIC_PLATFORM=ios
set EXPO_NO_DOCTOR=1

echo.
echo Instructions:
echo 1. A QR code will appear in the terminal
echo 2. Scan the QR code with your iOS device's camera
echo 3. Tap "Open in Expo Go" when prompted
echo.
echo Important: Your iOS device and this computer must be on the same network
echo.

echo Launching Expo with QR code...
npx expo start --clear

endlocal
