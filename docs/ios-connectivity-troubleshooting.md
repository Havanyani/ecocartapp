# iOS Connectivity Troubleshooting Guide

This document provides solutions for common connectivity issues between the development server and iOS simulators/devices.

## Common Errors

### "Could not connect to the development server"

This is the most common error when running an Expo/React Native app on iOS. It indicates that the iOS app cannot communicate with the Metro bundler running on your development machine.

## Quick Solutions

1. **Run our enhanced iOS launcher script**:
   ```
   npm run ios-fix
   ```
   
   On Windows:
   ```
   npm run ios-bat
   ```

## Step-by-Step Troubleshooting

If the quick solution doesn't work, follow these steps:

### 1. Check Network Configuration

- Ensure your iOS device/simulator and development computer are on the same network
- Temporarily disable firewalls or add exceptions for the following ports:
  - 8081 (Metro Bundler)
  - 19000-19002 (Expo)

### 2. Verify Metro Bundler is Running

- Look for "Metro waiting on exp://..." message in your terminal
- Ensure no other process is using port 8081
- To check for and kill processes on port 8081:
  ```
  # Windows
  netstat -ano | findstr :8081
  taskkill /F /PID <PID>
  
  # macOS/Linux
  lsof -i:8081
  kill -9 <PID>
  ```

### 3. Use Correct IP Address

The iOS app needs to know the IP address of your development machine:

1. Find your development machine's IP address:
   ```
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig | grep inet
   ```

2. Set the environment variable before starting:
   ```
   # Windows
   set REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.x
   
   # macOS/Linux
   export REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.x
   ```

3. Manually configure in the app:
   - Shake the iOS device or press `⌘+D` in simulator
   - Select "Dev Settings" → "Debug server host & port for device"
   - Enter `192.168.1.x:8081` (replace with your actual IP)

### 4. Clear Caches and Reset

```
npm run clear-cache
```

Or manually:
```
watchman watch-del-all
rm -rf node_modules/.cache
npm cache clean --force
```

### 5. Check Proxy Settings

- Make sure your development machine is not behind a proxy
- If you need a proxy, configure it properly in Metro:
  ```
  // metro.config.js
  module.exports = {
    server: {
      port: 8081,
      proxy: {
        '/api': {
          target: 'http://your-api.com',
          changeOrigin: true
        }
      }
    }
  };
  ```

### 6. USB Debugging (Physical Device)

If using a physical device:

1. Connect device via USB
2. Enable USB debugging
3. Run the app with the `--device` flag:
   ```
   npx expo run:ios --device
   ```

### 7. Update Expo CLI and SDK

Ensure you have the latest versions:
```
npm install -g expo-cli
npm install expo@latest
```

## Advanced Troubleshooting

### Custom Metro Configuration

Create or modify `metro.config.js` in your project root:

```js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow connections from all network interfaces
config.server = {
  ...config.server,
  host: '0.0.0.0',
};

module.exports = config;
```

### Developer Menu Access

- **iOS Simulator**: `⌘+D` or Hardware menu > Shake
- **iOS Device**: Shake the device
- From the developer menu, you can:
  - Reload JS Bundle
  - Configure Bundle Location
  - Show Inspector
  - Debug JS Remotely

## Specific Error Codes

### ECONNREFUSED

This means the Metro server isn't running or is unreachable.
- Verify Metro is running
- Check firewall settings
- Ensure proper IP address is configured

### ETIMEDOUT

This suggests a network connectivity issue.
- Check your network speed and reliability
- Ensure network doesn't block the required ports
- Try connecting both device and computer to an alternative network

## Getting Help

If these steps don't resolve your issue:

1. Gather information:
   - Expo SDK version
   - iOS version
   - Development machine OS
   - Log output from Metro
   
2. Check the GitHub issues for similar problems:
   - [Expo Issues](https://github.com/expo/expo/issues)
   - [React Native Issues](https://github.com/facebook/react-native/issues) 