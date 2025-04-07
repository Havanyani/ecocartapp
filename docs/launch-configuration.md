# EcoCart Launch Configuration Guide

## Environment Variables
The following environment variables are crucial for proper platform launching:

- `EXPO_NO_DOCTOR=1` - Bypasses Expo Doctor checks
- `EXPO_DEBUG_NO_ROUTER=true` - Disables Expo Router for simplified launching
- `REACT_NATIVE_PACKAGER_HOSTNAME=192.168.68.110` - Sets the development server IP
- `EXPO_PLATFORM=[ios|android]` - Specifies target platform
- `NO_FLIPPER=1` - Disables Flipper for better performance
- `EXPO_USE_PATH_ALIASES=1` - Enables path alias resolution
- `EXPO_NO_ASSETS_PROCESSING=1` - Prevents asset processing issues

## Launch Prerequisites

### iOS Launch
1. Expo Go installed on iOS device
2. Device connected to same network as development machine
3. iOS device able to scan QR codes
4. No conflicting Metro processes running

### Android Launch
1. Android Studio installed
2. Android emulator running or physical device connected
3. ADB working properly
4. No conflicting Metro processes running

## Common Issues and Solutions

### Connection Issues
- Ensure device and development machine are on same network
- Verify correct IP address in REACT_NATIVE_PACKAGER_HOSTNAME
- Check if ports 8081, 19000-19002 are not blocked

### Bundling Issues
- Clear Metro cache if bundling fails
- Ensure all dependencies are properly installed
- Use --legacy-peer-deps for dependency conflicts

### Asset Loading
- EXPO_NO_ASSETS_PROCESSING=1 helps with asset resolution issues
- Verify asset registry mock is properly configured
- Clear .expo cache if assets fail to load

## Launch Process
1. Kill any existing Metro/Node processes
2. Optional clean install of dependencies
3. Set environment variables
4. Clear Metro cache
5. Start Metro bundler
6. Wait for initial bundling
7. Scan QR code with appropriate method per platform

## Next Steps
1. Address navigation issues
2. Optimize performance per platform
3. Handle platform-specific UI adjustments 