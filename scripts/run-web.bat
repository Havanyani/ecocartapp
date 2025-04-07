@echo off
echo === EcoCart Web Launcher ===
echo Setting environment variables to fix CLI issues...

set EXPO_PUBLIC_PLATFORM=web
set EXPO_DEBUG_WEB_ONLY=true
set EXPO_SKIP_MODULE_CHECK=true
set EXPO_NO_DOCTOR=true
set NODE_OPTIONS=--no-warnings

echo.
echo Starting web app on http://localhost:19006
echo.

npx expo start --web --clear --no-dev 