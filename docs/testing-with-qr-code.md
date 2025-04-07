# Testing on iOS Devices with QR Codes from Windows

This guide explains how to test your EcoCart app on iOS devices using Expo Go while developing on a Windows machine.

## Quick Start

Run this command to start the development server with QR code:

```bash
npm run qr-launch
```

Or, for a more reliable connection across different networks:

```bash
npm run tunnel-enhanced  # Recommended: includes fallback options
```

or

```bash
npm run tunnel  # Basic tunnel
```

Scan the QR code with the Expo Go app on your iOS device.

## Step-by-Step Instructions

### 1. Install Expo Go on your iOS device

1. Open the App Store on your iOS device
2. Search for "Expo Go"
3. Download and install the app

### 2. Ensure proper network configuration

Both your Windows development machine and iOS device need to be on the same network:

- Connect both devices to the same Wi-Fi network
- Ensure your Windows firewall allows connections on ports:
  - 8081 (Metro bundler)
  - 19000-19002 (Expo)

### 3. Launch the development server

Run this command from your project directory:

```bash
npm run qr-launch
```

This will:
- Find your Windows machine's IP address
- Configure the development server to be accessible from other devices
- Start the Metro bundler
- Display a QR code

### 4. Connect your iOS device

1. Open the Expo Go app on your iOS device
2. Tap "Scan QR Code"
3. Scan the QR code displayed in your terminal

### 5. Troubleshooting Connection Issues

If your device can't connect after scanning the QR code:

#### Manual URL Entry
1. Note the IP address shown in the terminal (e.g., 192.168.1.5)
2. In the Expo Go app, tap "Enter URL manually"
3. Enter: `exp://192.168.1.5:19000` (replace with your actual IP address)

#### Network Issues
- Make sure both devices are on the same network
- Try disabling Windows Firewall temporarily
- Check if your router has client isolation enabled (prevents devices from seeing each other)
- Try connecting both devices to a mobile hotspot

#### Reset Development Environment
```bash
npm run clear-cache
npm run qr-launch
```

#### Alternative: Use Tunnel Connection (Most Reliable)
If you're having persistent connection issues, especially when your device and computer are on different networks:

1. Use our dedicated enhanced tunnel script (recommended):
```bash
npm run tunnel-enhanced
```

This script:
- Attempts to establish a tunnel connection
- Automatically falls back to LAN mode if the tunnel fails
- Installs required dependencies if missing
- Provides detailed connection instructions

2. Or use the basic tunnel script:
```bash
npm run tunnel
```

3. The tunnel connection creates a secure bridge to your development server that works across networks and bypasses many firewall issues.

4. Note that tunnel connections may take longer to start initially and can be slightly slower than LAN connections.

### 6. Viewing Logs and Debugging

Once connected:
- On iOS, shake the device to open the developer menu
- Select "Show Developer Tools" to see debugging options
- Use Chrome DevTools for more advanced debugging

### Common Errors and Solutions

#### "Could not connect to the development server"

1. Verify IP address is correct
2. Check your firewall settings
3. Try the tunnel method: `npx expo start --tunnel`
4. Restart the Expo Go app
5. Restart development server with `npm run clear-cache`

#### App loads but shows a red error screen

This usually indicates a JavaScript error. Check your terminal for error messages.

#### Changes don't appear after editing code

1. Shake the device to open developer menu
2. Select "Reload" to refresh the app with your changes

## Advanced: Creating a Local Development Build

For testing native features that aren't available in Expo Go:

1. Create a development build
```bash
npx expo prebuild
npx expo run:ios
```

2. Use EAS Build service
```bash
npx eas build --profile development --platform ios
```

This requires an Expo account and an Apple Developer account.

## Troubleshooting Common Errors

### "ngrok tunnel took too long to connect"

This error occurs when the Expo CLI cannot establish a tunnel connection using ngrok. To resolve:

1. Use our enhanced tunnel script which handles this error automatically:
   ```bash
   npm run tunnel-enhanced
   ```

2. Install ngrok globally (this often helps with tunnel stability):
   ```bash
   npm install -g @expo/ngrok
   ```

3. Check your firewall settings to ensure it's not blocking ngrok connections

4. If on a corporate network, check with your IT department as some networks block tunnel services

5. As a fallback, use LAN mode if your device is on the same network:
   ```bash
   npm run qr-launch
   ``` 