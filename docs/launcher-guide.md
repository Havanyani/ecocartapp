# EcoCart Launcher Guide

This document provides a comprehensive overview of all available launcher options for the EcoCart application.

## Quick Reference

| Platform | Standard Command | Enhanced Command | Fix Command |
|----------|-----------------|------------------|-------------|
| **Web** | `npm run web` | `npm run web-only` | `npm run web-fix` |
| **iOS** | `npm run ios` | `npm run qr-launch` | `npm run ios-fix` |
| **Android** | `npm run android` | - | - |
| **Multi-platform** | `npm run start` | `npm run platform-menu` | `npm run reset-app` |
| **Tunnel** | `npm run tunnel` | `npm run tunnel-enhanced` | - |

## Web Launcher Options

| Command | Description |
|---------|-------------|
| `npm run web` | Standard web launch with Metro bundler |
| `npm run web-only` | Web-only mode (no Metro bundler) |
| `npm run web-debug` | Web launch with debugging enabled |
| `npm run web-fix` | Fixes common web bundling issues |
| `npm run web-bat` | Batch script launcher for web (Windows) |
| `npm run web-basic` | Basic web launch with minimal features |

## iOS Launcher Options

| Command | Description |
|---------|-------------|
| `npm run ios` | Standard iOS launch (requires Mac) |
| `npm run ios-fix` | Fixes common iOS connection issues |
| `npm run ios-bat` | Batch script launcher for iOS (Windows) |
| `npm run qr-launch` | QR code launcher for iOS devices (LAN) |
| `npm run tunnel` | Basic tunnel connection for iOS devices |
| `npm run tunnel-enhanced` | Enhanced tunnel with fallback options |

## Android Launcher Options

| Command | Description |
|---------|-------------|
| `npm run android` | Standard Android launch |
| `npm run qr-launch` | QR code launcher for Android devices (LAN) |
| `npm run tunnel` | Tunnel connection for Android devices |
| `npm run tunnel-enhanced` | Enhanced tunnel with fallback options |

## Cross-Platform Launchers

| Command | Description |
|---------|-------------|
| `npm run start` | Standard Expo launcher |
| `npm run platform-menu` | Interactive CLI platform selector |
| `npm run start-all` | Launcher with all platform options |
| `npm run start-cmd` | Command-line launcher |

## Utility Commands

| Command | Description |
|---------|-------------|
| `npm run clean-start` | Start with cleared cache |
| `npm run reset-app` | Reset cache and node_modules |
| `npm run clear-cache` | Clear Expo cache |
| `npm run patch-cli` | Patch Expo CLI issues |
| `npm run debug-mode` | Start in debug mode |

## Environment Debugging

For advanced debugging, you can also set these environment variables:

```bash
# Debug flags
set EXPO_DEBUG_MODE=1
set EXPO_NO_DOCTOR=true
set EXPO_NO_VALIDATION_WARNINGS=1

# Platform selection
set EXPO_PUBLIC_PLATFORM=web

# Network configuration
set REACT_NATIVE_PACKAGER_HOSTNAME=<your-ip-address>
set EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
```

## Recommended Approaches by Use Case

1. **Standard Development:**
   - Web: `npm run web-only`
   - iOS (Windows): `npm run qr-launch`
   - Android: `npm run android`

2. **Network Issues:**
   - `npm run tunnel-enhanced`

3. **Performance Issues:**
   - `npm run reset-app` followed by platform-specific command

4. **Specific Errors:**
   - Web bundling errors: `npm run web-fix`
   - iOS connection errors: `npm run ios-fix`

See the platform-specific documentation for more detailed troubleshooting:
- [iOS Connection Guide](./ios-connection-guide.md)
- [Web Platform Guide](./web-platform-guide.md) 