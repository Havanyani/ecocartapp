@echo off
setlocal EnableDelayedExpansion

echo === Simple Android Launch (No Expo Router) ===
echo.

echo Terminating all Node.js and Metro processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do (
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :19000') do (
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :19001') do (
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :19002') do (
    taskkill /F /PID %%a 2>nul
)
taskkill /F /IM "node.exe" 2>nul

echo.
:PROMPT
set /P CLEAN_INSTALL=Do you want to clean install node_modules? (Y/N): 
if /I "%CLEAN_INSTALL%" EQU "Y" goto CLEAN
if /I "%CLEAN_INSTALL%" EQU "N" goto START
goto PROMPT

:CLEAN
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
    echo Error: package.json not found in %CD%
    pause
    exit /b 1
)

echo.
echo Reinstalling dependencies...
call npm install --legacy-peer-deps --verbose

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

:START
echo.
echo Setting up simplified environment...
set "EXPO_NO_DOCTOR=1"
set "EXPO_DEBUG_NO_ROUTER=true"
set "REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1"
set "EXPO_PLATFORM=android"
set "NO_FLIPPER=1"
set "EXPO_USE_PATH_ALIASES=1"
set "EXPO_NO_ASSETS_PROCESSING=1"

echo.
echo Clearing Metro cache...
if exist "%APPDATA%\Expo\metro-cache" (
    rmdir /s /q "%APPDATA%\Expo\metro-cache"
)

echo.
echo This will launch a simplified version without Expo Router
echo.
echo When the QR code appears:
echo 1. Open Expo Go on your Android device
echo 2. Scan the QR code with Expo Go
echo.

echo Launching simplified app...
echo Starting Expo...
call npx expo start --clear --no-dev

if errorlevel 1 (
    echo.
    echo Error: Failed to start Expo
    echo Please check if you have all dependencies installed
    echo Try running: npm install --legacy-peer-deps
    pause
    exit /b 1
)

endlocal 