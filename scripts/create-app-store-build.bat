@echo off
echo EcoCart App Store Build Script
echo ============================
echo.

echo Setting environment to production...
set EXPO_PUBLIC_ENV=production

echo Clearing cache and preparing for build...
npx expo start --clear --no-dev --non-interactive --no-open

echo.
echo Select platform to build for:
echo 1. iOS
echo 2. Android
echo 3. Both
echo.

set /p platform_choice="Enter your choice (1-3): "

if "%platform_choice%"=="1" (
    echo Building for iOS...
    echo.
    npx expo prebuild --platform ios --clean
    npx eas build --platform ios --profile production
) else if "%platform_choice%"=="2" (
    echo Building for Android...
    echo.
    npx expo prebuild --platform android --clean
    npx eas build --platform android --profile production
) else if "%platform_choice%"=="3" (
    echo Building for both iOS and Android...
    echo.
    npx expo prebuild --clean
    echo Building iOS version...
    npx eas build --platform ios --profile production
    echo Building Android version...
    npx eas build --platform android --profile production
) else (
    echo Invalid choice. Please run the script again.
    exit /b 1
)

echo.
echo Build commands completed! Next steps:
echo 1. Check the EAS Dashboard for build status
echo 2. Download the builds when they complete
echo 3. Submit to the respective app stores using the deployment guide
echo.
echo Thank you for using EcoCart App Store Build Script! 