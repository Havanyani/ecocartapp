@echo off
echo Starting minimal EcoCart web version...
set EXPO_PUBLIC_PLATFORM=web
set NODE_OPTIONS=--max-old-space-size=4096
npx expo start --web --dev --clear 