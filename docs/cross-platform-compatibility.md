# Cross-Platform Compatibility Documentation

## Overview

This document outlines the strategies implemented to ensure EcoCart works seamlessly across all target platforms: Web, iOS, and Android. The app is now fully cross-platform compatible with a unified codebase.

## Key Implementation Strategies

### 1. Platform-Specific Module Handling

#### Conditional Imports
We've implemented conditional imports for native modules that aren't compatible with web:

```typescript
// Example from app/analytics/reports.tsx
const FileSystem = {
  documentDirectory: 'file://document-directory/',
  writeAsStringAsync: async (path: string, content: string) => {
    try {
      if (Platform.OS !== 'web') {
        // Use the real FileSystem module on native platforms
        const fs = require('expo-file-system');
        return await fs.writeAsStringAsync(path, content);
      } else {
        // Use localStorage for web
        localStorage.setItem(`expo-fs:${path}`, content);
        return;
      }
    } catch (err) {
      console.warn('FileSystem API not available:', err);
    }
  }
};
```

#### Module Mocks
Web-specific mocks for native modules:

```javascript
// From src/mocks/setup-mocks.js
if (Platform.OS === 'web') {
  // Battery mock
  if (!global.ExpoNativeBattery) {
    global.ExpoNativeBattery = {
      getBatteryLevelAsync: async () => 1.0,
      getBatteryStateAsync: async () => 0,
      // ...
    };
  }
  
  // FileSystem mock
  if (!global.ExpoFileSystem) {
    global.ExpoFileSystem = {
      documentDirectory: 'file://document-directory/',
      // ...
    };
  }
}
```

### 2. Routing Structure Optimization

To solve routing conflicts in Expo Router, we:

1. Moved conflicting screens to different paths
2. Implemented redirects for backward compatibility
3. Separated tabs and regular screens properly

Example:
```typescript
// app/profile.tsx - Redirect to details
export default function ProfileRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/profile/details');
  }, [router]);
  
  return <View />;
}
```

### 3. Safe Component Interfaces

Components detect capabilities at runtime:

```typescript
// Battery detection example
let Battery: any;

if (Platform.OS === 'web') {
  // Web-specific implementation with browser APIs
  Battery = {
    // Web implementation
  };
} else {
  // Native implementation with fallback
  try {
    Battery = require('expo-battery');
  } catch (err) {
    // Fallback implementation if module is missing
    Battery = {
      // Fallback implementation
    };
  }
}
```

## Platform Entry Points

The app now provides multiple ways to access the interface:

1. **Web Platform Access (3 options)**
   - Static HTML Version (Option 1): Most reliable web testing
   - Web-Version Folder (Option 2): Standalone web implementation  
   - Mobile Web Version (Option 3): Unified codebase with auto-detection

2. **iOS Platform Access**
   - iOS Version (Option 5): Direct launch on iOS simulator or QR code for devices
   - QR Code Connection (Option 6): For connecting physical iOS devices

3. **Android Platform Access**
   - Android Version (Option 4): Android emulator or device via QR code
   - QR Code Connection (Option 6): For connecting physical Android devices

4. **Support Options**
   - Debug Mode (Option 7): Shows initialization details for troubleshooting
   - Cache Clearing (Option 8): Resets the environment
   - Web-Version Repair (Option 9): Fixes corrupted web implementation

## Key Component Adaptations

1. **BackupManager**: Implemented conditional FileSystem API
2. **TestResultExporter**: Added localStorage fallback for web
3. **Battery Monitoring**: Cross-platform battery API implementation (native/web)
4. **Profile Navigation**: Restructured to avoid routing conflicts

## Future Considerations

1. **Responsive Design**: Further optimize layouts for different screen sizes
2. **Web-Specific Features**: Consider adding web-only features where appropriate
3. **Native Feature Detection**: Continue to improve graceful fallbacks

## Testing Recommendations

Test each platform entry point regularly to ensure cross-platform functionality:

```
npm run platform-menu
```

Then select the appropriate platform option and verify all features work as expected. 