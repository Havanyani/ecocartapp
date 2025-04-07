@echo off
setlocal enabledelayedexpansion
echo === EcoCart Enhanced Tunnel Launcher ===
echo.
echo This launcher uses multiple connection methods for reliable remote testing

echo Checking for processes using port 8081...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 2^>nul') do (
    echo Found process on port 8081: %%a
    echo Terminating process...
    taskkill /F /PID %%a 2>nul
    echo Process terminated.
)

REM Get local IP address for fallback
set LOCAL_IP=127.0.0.1
FOR /F "tokens=2 delims=:" %%i IN ('ipconfig ^| findstr /c:"IPv4 Address"') DO (
    set LOCAL_IP=%%i
    set LOCAL_IP=!LOCAL_IP:~1!
    goto :found_ip
)
:found_ip

echo.
echo Your development machine's IP address: !LOCAL_IP!
echo.

echo CONNECTION INSTRUCTIONS:
echo =======================
echo 1. This script will first try to establish a tunnel connection (works across networks)
echo 2. If the tunnel fails, it will fall back to LAN mode (requires same network)
echo 3. When prompted, install the Expo CLI globally if needed
echo.

echo Setting up environment...
set EXPO_NO_DOCTOR=true
set REACT_NATIVE_PACKAGER_HOSTNAME=!LOCAL_IP!

echo Checking if @expo/ngrok is installed...
npm list -g @expo/ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing @expo/ngrok globally to improve tunnel stability...
    npm install -g @expo/ngrok
)

echo.
echo Starting tunnel connection attempt (timeout: 60 seconds)...
echo If this fails, the script will fall back to LAN mode automatically.
echo.

REM Try tunnel with timeout
set TUNNEL_TIMEOUT=60
set START_TIME=%time%

echo npx expo start --tunnel --clear

REM Start in new window so we can monitor and kill if needed
start cmd /c "npx expo start --tunnel --clear > tunnel_output.log 2>&1"

REM Wait and check for success/failure
echo Waiting for tunnel to establish (this may take a minute)...
timeout /t 5 /nobreak > nul

:check_tunnel
set /a ELAPSED=1
if %ELAPSED% gtr %TUNNEL_TIMEOUT% goto :tunnel_failed

REM Check if tunnel is established by looking for QR code generation in log
findstr /c:"Metro waiting on" tunnel_output.log > nul 2>&1
if %errorlevel% equ 0 (
    echo Tunnel established successfully!
    goto :tunnel_success
)

REM Check for specific error
findstr /c:"ngrok tunnel took too long to connect" tunnel_output.log > nul 2>&1
if %errorlevel% equ 0 goto :tunnel_failed

echo Waiting for tunnel connection... (%ELAPSED%/%TUNNEL_TIMEOUT% seconds)
timeout /t 2 /nobreak > nul
goto :check_tunnel

:tunnel_failed
echo.
echo Tunnel connection failed or timed out.
echo Stopping any running Metro processes...

REM Kill any Metro processes
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 2^>nul') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo Falling back to LAN mode connection:
echo ===================================
echo 1. Make sure your device and computer are on the same Wi-Fi network
echo 2. When the QR code appears, scan it with the Expo Go app
echo 3. If scanning fails, manually enter: exp://!LOCAL_IP!:19000
echo.

REM Start in LAN mode
echo Starting Expo in LAN mode...
npx expo start --clear
goto :end

:tunnel_success
echo.
echo Tunnel is running! Check the other command window for the QR code.
echo.
echo If you close this window, the tunnel will continue running.
echo To stop the tunnel, close the other command window or press Ctrl+C there.

:end
if exist tunnel_output.log del /f /q tunnel_output.log
echo. 