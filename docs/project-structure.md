# EcoCart Project Structure

This document outlines the project structure for the EcoCart application, which uses an extension-based approach for cross-platform development.

## Overview

The EcoCart project follows a platform-specific extension pattern that allows for sharing code between platforms while optimizing components for each platform's unique capabilities:

- Shared interfaces and types (`Component.tsx`)
- Platform-specific implementations:
  - Native: iOS and Android (`Component.native.tsx`)
  - Web (`Component.web.tsx`)

This approach enables us to maintain a consistent API across platforms while optimizing the implementation for each platform's unique capabilities and constraints.

## Directory Structure

```
ecocartapp/
├── app/                  # Expo Router app directory
├── assets/               # Static assets (images, fonts, etc.)
├── docs/                 # Project documentation
├── node_modules/         # Dependencies (git-ignored)
├── public/               # Public web assets
├── scripts/              # Build and utility scripts
└── src/                  # Source code
    ├── components/       # UI components
    │   ├── navigation/   # Navigation components
    │   └── ui/           # Reusable UI components
    ├── contexts/         # React context providers
    ├── hooks/            # Custom React hooks
    ├── screens/          # Screen components
    ├── services/         # API and service layer
    ├── store/            # State management
    ├── styles/           # Global styles
    ├── types/            # TypeScript type definitions
    └── utils/            # Utility functions and helpers
        ├── navigation/   # Navigation utilities
        ├── seo/          # SEO utilities (web-specific)
        └── testing/      # Testing utilities
```

## Extension-Based Pattern

### Component File Structure

Each cross-platform component follows this structure:

1. **Shared Interface** (`Component.tsx`):
   - Contains the component props interface
   - Type definitions
   - Platform-agnostic logic
   - Default implementation that warns if platform-specific version is not imported

2. **Native Implementation** (`Component.native.tsx`):
   - Optimized for iOS and Android
   - Uses React Native components and APIs
   - Implements platform-specific features like haptic feedback

3. **Web Implementation** (`Component.web.tsx`):
   - Optimized for web browsers
   - Implements web-specific features (SEO, keyboard navigation)
   - Uses web-specific optimizations

4. **Index File** (`index.ts`):
   - Exports the component with the correct platform-specific implementation
   - Ensures correct imports throughout the application

5. **README** (`README.md`):
   - Documents component usage, props, and platform-specific behaviors

### Example Component Structure

```
src/components/ui/Button/
├── Button.tsx           # Shared interface and types
├── Button.native.tsx    # Native implementation (iOS & Android)
├── Button.web.tsx       # Web implementation
├── index.ts             # Exports the platform-specific implementation
├── README.md            # Documentation
└── __tests__/           # Component tests
    ├── Button.test.tsx              # Shared tests
    ├── Button.native.test.tsx       # Native-specific tests
    └── Button.web.test.tsx          # Web-specific tests
```

## Utilities

### Navigation Utilities

The project includes platform-specific navigation utilities:

- `WebLinkHandler.web.ts`: Web-specific navigation helpers
- `WebLinkHandler.native.ts`: Native stub implementations
- Consistent API that works across platforms

### SEO Utilities

For web-specific SEO optimizations:

- `MetadataEnhancer.tsx`: Component and hooks for enhancing SEO metadata
- Integration with React Helmet for managing document head

### Testing Utilities

Cross-platform testing utilities:

- `CrossPlatformTesting.ts`: Platform-specific test utilities
- `ComponentTestSetup.tsx`: Setup helpers for component testing

## Platform-Specific Modules

When a module is only needed on one platform or needs different implementations:

1. Create a `.web.ts` and `.native.ts` version
2. Use default exports
3. Import from the base path without specifying the extension

Example:
```typescript
// This will import the correct version based on platform
import { NavigationLink } from '../components/navigation/NavigationLink';
```

## Styling Approach

Styling follows a consistent pattern:

1. Use `StyleSheet.create()` for static styles
2. Use theme context for dynamic styles based on theme
3. Platform-specific styles are defined in their respective files
4. Shared styles are defined in the base component file

## Best Practices

### When to Use Platform-Specific Files

Create platform-specific files when:

1. The component needs significantly different implementations on each platform
2. Platform-specific APIs or components need to be used
3. Performance optimizations differ between platforms
4. The component needs to behave differently on each platform

### When to Use Conditional Code

Use inline platform checks (`Platform.OS === 'web'`) when:

1. The differences are minimal (just a few lines)
2. The overall component structure is the same
3. Only a few properties need to be adjusted

### Code Sharing

Maximize code sharing by:

1. Extracting common logic to shared functions or hooks
2. Using the same props interface across platforms
3. Centralizing business logic in platform-agnostic files
4. Using utility functions for platform-specific behavior

## Migration Strategy

When migrating components to the extension-based pattern:

1. Create the shared interface first
2. Move existing implementation to the native file
3. Create the web implementation
4. Update the index file to export the component correctly
5. Add comprehensive tests
6. Document in the component README

## Conclusion

This project structure enables effective cross-platform development by providing:

1. Consistent component APIs across platforms
2. Platform-specific optimizations where needed
3. Clear separation of concerns
4. Better developer experience with explicit platform support
5. Improved maintainability with isolated platform-specific code