@echo off
setlocal EnableDelayedExpansion

echo === Simple iOS Launch (No Expo Router) ===
echo.

echo Terminating any Metro processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 2^>nul') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo Cleaning npm cache...
call npm cache clean --force

echo.
echo Cleaning Metro cache and node_modules...
if exist "node_modules" (
    echo Removing node_modules...
    rmdir /s /q "node_modules"
)

if exist ".expo" (
    echo Removing .expo cache...
    rmdir /s /q ".expo"
)

if exist ".metro" (
    echo Removing Metro cache...
    rmdir /s /q ".metro"
)

echo.
echo Verifying package.json...
if not exist "package.json" (
    echo Error: package.json not found
    pause
    exit /b 1
)

echo.
echo Reinstalling dependencies...
call npm install --legacy-peer-deps--verbose

if errorlevel 1 (
    echo.
    echo Error: Failed to install dependencies
    echo Checking package.json for issues...
    type package.json
    echo.
    echo Please check if package.json is valid
    pause
    exit /b 1
)

echo.
echo Setting up simplified environment...
set "EXPO_NO_DOCTOR=1"
set "EXPO_DEBUG_NO_ROUTER=true"

echo.
echo This will launch a simplified version without Expo Router
echo.
echo When the QR code appears:
echo 1. Scan it with your iOS device's camera app
echo 2. Tap "Open in Expo Go" when prompted
echo.

echo Launching simplified app...
echo Starting Expo...
call npx expo start --clear

if errorlevel 1 (
    echo.
    echo Error: Failed to start Expo
    echo Please check if you have all dependencies installed
    echo Try running: npm install
    pause
    exit /b 1
)

endlocal 