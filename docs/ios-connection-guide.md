# iOS Connection Guide for EcoCart

This guide provides solutions for common iOS connection issues when testing the EcoCart application from a Windows machine.

## Quick Start Commands

| Command | Description |
|---------|-------------|
| `npm run qr-launch` | Standard QR code launch on same network |
| `npm run tunnel` | Basic tunnel connection (works across networks) |
| `npm run tunnel-enhanced` | Enhanced tunnel with fallback to LAN |
| `npm run ios-fix` | Fixes for "There was a problem running" errors |
| `npm run ios-battery-fix` | Fixes "Unable to resolve expo-battery" errors |

## Connection Methods

### 1. Standard LAN Connection (Same Network)
Best for: When your iOS device and Windows PC are on the same network.

```bash
npm run qr-launch
```

### 2. Tunnel Connection (Different Networks)
Best for: When your iOS device and Windows PC are on different networks or behind firewalls.

```bash
npm run tunnel-enhanced
```

If you encounter ngrok timeout issues:
```bash
npm install -g @expo/ngrok
npm install -g expo-cli
npm run tunnel-enhanced
```

### 3. iOS-Specific Fix (For "Problem Running App" Errors)
Best for: When you see "There was a problem running 'EcoCart'" errors.

```bash
npm run ios-fix
```

## Common iOS Error Solutions

### "There was a problem running 'EcoCart'"

1. Try our dedicated iOS fix:
   ```bash
   npm run ios-fix
   ```

2. On your iOS device:
   - Force close Expo Go app (swipe up)
   - Toggle airplane mode on/off
   - Check for iOS restrictions blocking Expo

3. Try manual URL entry:
   - Open Expo Go
   - Tap "Enter URL manually"
   - Enter the URL shown in the QR code (e.g., `exp://tubbxpi-anonymous-8081.exp.direct`)

4. Try scanning with iOS Camera app instead of Expo Go

### "ngrok tunnel took too long to connect"

1. Install dependencies globally:
   ```bash
   npm install -g @expo/ngrok
   npm install -g expo-cli
   ```

2. Try again with:
   ```bash
   npm run tunnel-enhanced
   ```

3. Check firewall settings to allow ngrok connections

4. If on corporate network, check with IT department

### "Unable to resolve expo-battery" Error

This error occurs during the iOS bundling process:

```
iOS Bundling failed: Unable to resolve "expo-battery" from "src\utils\cross-platform\battery.ts"
```

To fix this issue:

1. Run our dedicated battery fix:
   ```bash
   npm run ios-battery-fix
   ```

   This script will:
   - Create a mock implementation of expo-battery
   - Update package.json to use this mock
   - Clear the Metro bundler cache
   - Launch the app with QR code

2. If the error persists, try these steps manually:
   - Clear the Metro bundler cache: `npm run clear-cache`
   - Create a mock implementation of expo-battery
   - Install expo-battery globally: `npm install -g expo-battery`

## Network Configuration Requirements

For **all** connection methods:
- Allow ports 8081, 19000, 19001, 19002 through your firewall
- Temporarily disable VPNs during testing
- Make sure your computer's firewall allows Node.js/Expo to connect

For **LAN** connections:
- iOS device and Windows PC must be on the same Wi-Fi network
- Some corporate/public networks block device-to-device communication

For **Tunnel** connections:
- Internet access required on both devices
- Some corporate networks block tunnel services

## Troubleshooting Steps

If none of the above solutions work:

1. **Reset Everything**
   ```bash
   npm cache clean --force
   rmdir /s /q node_modules\.cache
   rmdir /s /q %APPDATA%\Expo
   npm install -g @expo/ngrok expo-cli
   npm run ios-fix
   ```

2. **Try Different Networks**
   - Test on a home network rather than corporate/public Wi-Fi
   - Create a mobile hotspot from another device

3. **Reinstall Expo Go**
   - Delete Expo Go from your iOS device
   - Reinstall from App Store
   - Try connecting again

4. **Check iOS Device Compatibility**
   - Ensure iOS version 13.0 or higher
   - Check Expo Go compatibility with your iOS version 