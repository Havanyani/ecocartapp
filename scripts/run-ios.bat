@echo off
setlocal enabledelayedexpansion
echo === EcoCart iOS Launcher with Connection Fix ===
echo.

echo Checking for previous Metro processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 2^>nul') do (
    echo Found process on port 8081: %%a
    echo Terminating process...
    taskkill /F /PID %%a 2>nul
    echo Process terminated.
)

echo.
echo Setting up environment for better connectivity...

set DEBUG=true
set EXPO_NO_DOCTOR=true
rem Don't use RCT_METRO_PORT as environment variable since it's parsed as string
rem Instead, pass it directly to the command with --port flag

REM Get local IP address for development server
set LOCAL_IP=127.0.0.1
FOR /F "tokens=2 delims=:" %%i IN ('ipconfig ^| findstr /c:"IPv4 Address"') DO (
    set LOCAL_IP=%%i
    set LOCAL_IP=!LOCAL_IP:~1!
    goto :found_ip
)
:found_ip

echo.
echo Your development machine's IP address: !LOCAL_IP!
echo If iOS cannot connect, manually set this IP in the Expo dev menu.
echo.

REM Set this as the hostname for the packager
set REACT_NATIVE_PACKAGER_HOSTNAME=!LOCAL_IP!

echo Connectivity Troubleshooting Tips:
echo 1. Make sure your iOS device and computer are on the same network
echo 2. Check your firewall settings - allow ports 8081, 19000-19001
echo 3. Shake your device or press Cmd+D in simulator to access dev menu
echo 4. Select "Configure Bundler" and enter http://!LOCAL_IP!:8081
echo.

echo Launching Metro bundler and iOS simulator...
echo.

REM Start the Metro bundler and iOS app with explicit port number
npx expo start --ios --port 8081 