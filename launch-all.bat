@echo off
color 0A
cls

:start
echo =======================================================
echo           EcoCart Unified Platform Launcher
echo =======================================================
echo.
echo This launcher provides access to all versions of EcoCart:
echo.
echo 1. Web Version (Static HTML - Works Reliably)
echo 2. Web Version (Web-Version Folder - Separate Implementation)
echo 3. Mobile Web Version (Expo Router - May Have Issues)
echo 4. Android Version (Requires Android Device/Emulator)
echo 5. iOS Version (Requires macOS)
echo 6. Exit
echo.
echo =======================================================

set /p choice=Enter your choice (1-6): 

if "%choice%"=="1" goto web_static
if "%choice%"=="2" goto web_folder
if "%choice%"=="3" goto web_mobile
if "%choice%"=="4" goto android
if "%choice%"=="5" goto ios
if "%choice%"=="6" goto exit

echo Invalid choice. Please try again.
pause
goto start

:web_static
echo.
echo Launching EcoCart Static Web Version...
start "" "%~dp0basic-test.html"
goto end

:web_folder
echo.
echo Launching EcoCart Web Version from web-version folder...
start "" "%~dp0web-version\index.html"
goto end

:web_mobile
echo.
echo Launching EcoCart Mobile Web Version (Expo Router)...
echo This may encounter bundling errors. If it fails, try option 1 instead.
echo.
set EXPO_PUBLIC_PLATFORM=web
echo Starting Metro bundler with web configuration...
start cmd /k "npx expo start --web --clear"
goto end

:android
echo.
echo Launching EcoCart Android Version...
if exist "%ANDROID_HOME%" (
  echo Android SDK found. Starting Android version.
  start cmd /k "npx expo start --android"
) else (
  echo Android SDK not found or not configured properly.
  echo Please make sure you have Android SDK installed and ANDROID_HOME environment variable set.
  pause
)
goto end

:ios
echo.
echo Attempting to launch EcoCart iOS Version...
if /i "%OS%"=="Windows_NT" (
  echo Warning: iOS development requires macOS.
  echo You are currently running Windows, so iOS version cannot be launched.
  pause
) else (
  echo Starting iOS version...
  start cmd /k "npx expo start --ios"
)
goto end

:exit
echo.
echo Exiting EcoCart Launcher...
exit /b

:end
echo.
echo Launcher completed successfully.
echo You can close this window or return to the menu.
echo.
set /p restart=Return to menu? (Y/N): 
if /i "%restart%"=="Y" goto start
exit /b 