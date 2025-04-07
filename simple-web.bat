@echo off
echo Starting EcoCart Simple Web Launch...
set EXPO_PUBLIC_PLATFORM=web
set EXPO_DEBUG_NO_ROUTER=true
set EXPO_DEBUG_WEB_ONLY=true
call npx expo start --web --clear --no-dev --minify
echo Web launch process completed
pause 