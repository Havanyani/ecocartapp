@echo off
echo Starting EcoCart Web Version...
set EXPO_PUBLIC_PLATFORM=web
npx expo start --web --clear
if %ERRORLEVEL% NEQ 0 (
  echo Failed with initial settings, trying alternative approach...
  npx expo start --web-only --clear --no-dev
)
pause 