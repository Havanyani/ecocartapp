@echo off
echo Starting EcoCart Web - SuperWeb Mode...

:: Set environment variables
set EXPO_PUBLIC_PLATFORM=web
set EXPO_DEBUG_NO_ROUTER=true
set EXPO_DEBUG_WEB_ONLY=true
set NODE_OPTIONS=--no-warnings

:: Use webpack directly with development configuration
echo Building with webpack directly...
call npx webpack serve --mode development --config webpack.config.js

pause 