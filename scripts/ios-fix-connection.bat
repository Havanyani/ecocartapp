@echo off
setlocal enabledelayedexpansion
echo === EcoCart iOS Connection Fix ===
echo.
echo This script includes fixes for iOS "There was a problem running" errors

echo Clearing cached files and Metro bundler...
rmdir /s /q node_modules\.cache 2>nul
rmdir /s /q %APPDATA%\Expo 2>nul

echo.
echo Checking if global dependencies are installed...
call npm list -g expo-cli >nul 2>&1 || (
  echo Installing expo-cli globally...
  call npm install -g expo-cli
)

call npm list -g @expo/ngrok >nul 2>&1 || (
  echo Installing @expo/ngrok globally...
  call npm install -g @expo/ngrok
)

echo.
echo Setting environment variables for better iOS compatibility...
set EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
set EXPO_NO_DOCTOR=true
set REACT_NATIVE_PACKAGER_HOSTNAME=

REM Prevent validation warnings
set EXPO_NO_VALIDATION_WARNINGS=1

echo.
echo Ensuring proper Metro configuration...
echo Backing up metro.config.js to metro.config.js.bak
copy metro.config.js metro.config.js.bak >nul 2>&1

echo Creating simplified Metro config for iOS compatibility...
echo const { getDefaultConfig } = require('@expo/metro-config'); > metro.config.js
echo const defaultConfig = getDefaultConfig(__dirname); >> metro.config.js
echo. >> metro.config.js
echo module.exports = { >> metro.config.js
echo   resolver: { >> metro.config.js
echo     sourceExts: [...defaultConfig.resolver.sourceExts, 'mjs', 'cjs'], >> metro.config.js
echo   }, >> metro.config.js
echo }; >> metro.config.js

echo.
echo iOS CONNECTION INSTRUCTIONS:
echo ===========================
echo 1. Make sure your iOS device has Expo Go installed from the App Store
echo 2. Your iOS device MUST be connected to the same Wi-Fi as your computer
echo 3. When scanning the QR code fails, try these fixes:
echo    - Enter the URL manually in Expo Go instead of scanning
echo    - Restart the Expo Go app on your iOS device
echo    - Toggle airplane mode on/off on your iOS device
echo    - Check that no iOS restrictions are blocking Expo Go
echo.

echo Starting Expo with optimized settings for iOS...
echo.
echo If this doesn't work, try scanning the QR code with your Camera app instead of Expo Go
echo.
echo Starting tunnel connection (this may take a minute)...

REM Start Metro bundler with specific iOS fixes
npx expo start --tunnel --clear --no-dev --minify 