# EcoCart Unified Launch System

## Overview

The EcoCart app has been configured with a unified launch system that supports Web, iOS, and Android platforms from a single codebase. This documentation explains how to use each launch option and addresses known issues.

## Launch Options

### Option 1: Node.js Unified Launcher (New Recommended Approach)

The most user-friendly and reliable option is to use our Node.js-based unified launcher:

```bash
npm run platform-menu
```

This provides a colorful, interactive menu with all platform options:
1. Web Version (Static HTML - Works Reliably)
2. Web Version (Web-Version Folder - Separate Implementation)
3. Mobile Web Version (Expo Router - May Have Issues)
4. Android Version (Requires Android Device/Emulator)
5. iOS Version (Requires macOS)

The Node.js launcher handles platform detection, environment setup, and provides a better user experience than other launch methods.

### Option 2: Batch File Launcher

For Windows users, there's also a batch file launcher:

```bash
./launch-all.bat
```

This provides the same options as the Node.js launcher.

### Option 3: Command-line Launcher

This is a simple CLI tool that lets you select which platform to run:

```bash
npm run start-all
```

This script will display a menu with the following options:
1. Web
2. Android 
3. iOS
4. All platforms
5. Exit

Select the desired platform by entering the corresponding number.

### Option 4: Development Mode Platform Selector

When running in development mode, a "DEV" button appears in the top-right corner of the app. Clicking this button opens a platform selector modal that allows you to switch between:
- Web
- iOS
- Android

The development mode selector is automatically enabled when the app detects that it's running in a development environment.

### Option 5: Standard Scripts

You can also use the standard npm scripts directly:

```bash
# Start on all platforms
npm start

# Start on web only
npm run web

# Start on Android only
npm run android

# Start on iOS only
npm run ios
```

### Option 6: Web-Specific Launch Options

Due to challenges with the Metro bundler and web compatibility, we have additional web launch options:

```bash
# Basic web launch with cleared cache
npm run web-debug

# Production-mode web launch
npm run web-only

# Web launch without router
npm run web-basic

# Two-step automated launcher
npm run web-launcher
```

### Option 7: Static HTML Testing

For isolated testing of web functionality without Metro bundler dependencies:

```bash
# Open basic HTML test page
.\open-basic.bat
```

## Architecture

The unified launch system is built on the following components:

1. **Root Entry Point (`App.tsx`)**
   - Detects the current platform
   - Loads the appropriate version (Web or Mobile)
   - Conditionally renders development tools

2. **Web Entry Point (`App.web.js`)**
   - Provides web-specific implementation
   - Uses web-compatible components

3. **Platform Launcher (`scripts/platform-launcher.js`)**
   - Provides a CLI for selecting platforms
   - Uses npm scripts to launch the selected platform

4. **Development Platform Selector (`src/components/development/PlatformSelector.tsx`)**
   - Shows a UI for switching platforms in development mode
   - Only appears when `isDevelopment()` returns true

5. **Platform Utilities (`src/utils/platformUtils.ts`)**
   - Provides helper functions for platform detection
   - Exports `isDevelopment()`, `isWeb()`, etc.

6. **Web Mocks (`src/mocks/`)**
   - Contains web-specific implementations of native modules
   - Provides fallbacks for functionality not available in browsers

## Separation of Concerns

The app architecture follows a clear separation of concerns:

1. **Platform-Specific Code**
   - Located in `src/platforms/{web,ios,android}` 
   - Contains UI optimized for each platform

2. **Shared Core**
   - Located in `src/core`
   - Contains business logic and data models

3. **Cross-Platform UI Components**
   - Located in `src/components`
   - Adapts to different screen sizes

4. **Navigation**
   - Centralized in `src/navigation`
   - Implements platform-specific patterns

5. **Utils & Services**
   - Located in `src/utils` and `src/services`
   - Provides environment detection

## Web Platform Strategy

The web version of EcoCart uses several approaches to ensure compatibility:

1. **Static HTML Implementation** (Most Reliable)
   - Self-contained HTML/CSS/JS files that run without bundling
   - Accessed via `open-basic.bat` or the unified launcher
   - Provides basic app functionality without Metro bundler dependencies

2. **Separate Web Version** (New Approach)
   - Located in the `./web-version/` folder
   - Independent implementation optimized for web
   - Uses React and React Native Web directly
   - No dependency on Expo Router or problematic native modules

3. **Expo Web with Mocks** (Original Approach)
   - Uses the main codebase with web-specific mocks
   - Replaces native modules with web-compatible implementations
   - Configured via package.json's browser field and webpack config
   - May encounter bundling issues with certain polyfills

See the detailed web platform guide in `docs/web-platform-guide.md` for more information.

## Known Issues

1. **Error-guard Polyfill Issue**: The Metro bundler fails with an "Unexpected token '-'" error when building for web. This is related to the `@react-native/js-polyfills/error-guard` module.

2. **Dependency Conflicts**: There are dependency conflicts between `expo-camera` and `@tensorflow/tfjs-react-native` packages. The TensorFlow package requires `expo-camera@^13.4.4` while the project is using `expo-camera@^16.0.18`.

3. **Style Deprecation Warnings**: Shadow* style props are deprecated in React Native Web. Use the `createShadow()` utility or `ShadowCard` component for cross-platform shadow styling.

4. **iOS Simulator**: The iOS simulator option only works on macOS. On Windows, this option will show an error message explaining that iOS development requires macOS.

## Troubleshooting

If you encounter issues with the platform launcher:

1. **Dependency Issues**
   ```bash
   # Install with legacy peer deps to bypass conflicts
   npm install --legacy-peer-deps
   ```

2. **Metro Bundler Issues**
   ```bash
   # Clear Metro bundler cache
   npx expo start --clear --reset-cache
   ```

3. **Error-guard Polyfill Issues**
   - Use the static HTML test files for basic web testing:
   ```bash
   # Open the basic HTML test
   .\open-basic.bat
   
   # Or use the unified launcher and select option 1
   .\launch-all.bat
   ```

4. **Web Version Access**
   - Access the separated web version directly:
   ```bash
   # Direct browser access
   start web-version/index.html
   
   # Or use the unified launcher and select option 2
   .\launch-all.bat
   ```

5. **Complete Reset**
   ```bash
   # Remove node modules
   rm -rf node_modules
   # Clear npm cache
   npm cache clean --force
   # Reinstall dependencies
   npm install --legacy-peer-deps
   ```

## Testing Results

See the detailed testing report in `docs/launch-options-testing.md` for:
- Current status of each launch option
- Platform-specific test results
- Solutions to known issues
- Next steps for further investigation

## Conclusion

The unified launch system architecture is sound and provides a good separation of concerns. The implementation correctly handles platform detection and provides appropriate UI for platform selection in development mode.

Native platforms (Android and iOS) are working correctly with the Metro bundler. The web version faces challenges with the Metro bundler but can be tested using alternative approaches including static HTML implementations.

We are actively working on resolving the web bundling issues while providing multiple ways to test and develop the web version of the application. 