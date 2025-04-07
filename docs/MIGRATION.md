# Platform Extension Migration Guide

## Overview

This guide outlines our strategy for migrating to an extension-based structure for cross-platform development. This approach allows us to maintain a single codebase while providing platform-specific implementations where needed.

## Extension Pattern

We use file extensions to differentiate between platform-specific implementations:

- `.tsx` - Shared types, interfaces, and code that works across platforms
- `.native.tsx` - React Native specific code (iOS & Android)
- `.web.tsx` - Web specific code

Bundlers automatically select the right implementation:
- Metro bundler prefers `.native.tsx` over `.tsx` for mobile
- Webpack prefers `.web.tsx` over `.tsx` for web

## Directory Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   │   ├── Button.tsx         # Shared interface
│   │   │   ├── Button.native.tsx  # React Native implementation
│   │   │   ├── Button.web.tsx     # Web implementation
│   │   │   ├── index.ts           # Platform-specific export
│   │   │   └── README.md          # Component documentation
```

## Implementation Guidelines

### 1. Component Interface

Define shared types and interfaces in a base `.tsx` file:

```tsx
// Button.tsx
import { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  // Additional props...
}
```

### 2. Platform-Specific Implementations

Implement the component for each platform:

```tsx
// Button.native.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import type { ButtonProps } from './Button';

export function Button({ label, onPress, variant = 'primary' }: ButtonProps) {
  // Native-specific implementation
}
```

```tsx
// Button.web.tsx
import React from 'react';
import { View, Text } from 'react-native';
import type { ButtonProps } from './Button';

export function Button({ label, onPress, variant = 'primary' }: ButtonProps) {
  // Web-specific implementation with web-optimized code
}
```

### 3. Index Export

Create an index file that exports the implementation:

```tsx
// index.ts
export { Button } from './Button.native'; // Metro will resolve this for native
export type { ButtonProps } from './Button';
```

## Styling Utilities

We've created platform-specific styling utilities to help with cross-platform development:

```tsx
// Using createShadow for cross-platform shadows
import { createShadow } from '@/utils/styleUtils';

const styles = StyleSheet.create({
  card: {
    ...createShadow({
      offsetY: 2,
      opacity: 0.1,
      radius: 4,
    }),
  }
});
```

## Module Mocks

For native modules that don't have web equivalents, we provide web mocks:

```tsx
// In package.json "browser" field
{
  "browser": {
    "react-native-maps": "./src/mocks/react-native-maps.js",
    "expo-file-system": "./src/mocks/expo-file-system.js"
  }
}
```

## Migration Process

1. Identify components that need platform-specific implementations
2. Create shared interface in `.tsx` file
3. Move existing code to `.native.tsx`
4. Implement web version in `.web.tsx`
5. Update exports in `index.ts`
6. Test on all platforms

## Best Practices

1. **Share as much code as possible** - Only use platform-specific code when necessary
2. **Consistent APIs** - Keep prop interfaces identical across platforms
3. **Document differences** - Note platform-specific behaviors in README
4. **Test thoroughly** - Verify behavior on iOS, Android, and Web

## Examples

See the following components for implementation examples:
- `src/components/ui/Button/`
- `src/components/ui/Card/` 