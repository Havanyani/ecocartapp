# EcoCart Component Standards Guide

## Overview

This guide establishes standards for building cross-platform components in the EcoCart application. Following these guidelines ensures consistency, maintainability, and optimal performance across iOS, Android, and Web platforms.

## Component Structure

### Directory Organization

Components should be organized as follows:

```
ComponentName/
├── ComponentName.tsx        # Shared interface/types
├── ComponentName.native.tsx # Native implementation (iOS/Android)
├── ComponentName.web.tsx    # Web implementation
├── index.ts                 # Exports
├── README.md                # Documentation
└── __tests__/               # Component tests
    ├── ComponentName.test.tsx
    └── ComponentName.web.test.tsx
```

### File Contents

1. **ComponentName.tsx**
   - Contains TypeScript interfaces and types
   - May include shared utility functions
   - Should not contain platform-specific code

2. **ComponentName.native.tsx**
   - Implements the component for iOS/Android
   - Imports types from the base file
   - Uses React Native components

3. **ComponentName.web.tsx**
   - Implements the component for web
   - Imports types from the base file
   - May use web-specific optimizations

4. **index.ts**
   - Exports the component and its types
   - No conditional logic (bundlers handle this)

5. **README.md**
   - Usage examples
   - Props documentation
   - Platform-specific notes

## Naming Conventions

- **Component Files**: PascalCase (e.g., `Button.tsx`)
- **Directories**: Same as component name (e.g., `Button/`)
- **Props Interfaces**: ComponentNameProps (e.g., `ButtonProps`)
- **Style Constants**: camelCase (e.g., `buttonStyles`)
- **Test Files**: ComponentName.test.tsx

## Component Implementation

### Shared Interface

Define props using TypeScript interfaces with JSDoc comments:

```tsx
/**
 * Button component props
 */
export interface ButtonProps {
  /**
   * Button label text
   */
  label: string;
  
  /**
   * Function called when button is pressed
   */
  onPress: () => void;
  
  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline';
}
```

### Native Implementation

```tsx
// Button.native.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { ButtonProps } from './Button';

export function Button({ 
  label, 
  onPress, 
  variant = 'primary' 
}: ButtonProps) {
  const { theme } = useTheme();
  
  // Implementation...
  
  return (
    <TouchableOpacity 
      style={[styles.button, variantStyle]} 
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Styles...
});
```

### Web Implementation

```tsx
// Button.web.tsx
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { ButtonProps } from './Button';

export function Button({ 
  label, 
  onPress, 
  variant = 'primary' 
}: ButtonProps) {
  const { theme } = useTheme();
  
  // Implementation with web-specific optimizations
  
  return (
    <Pressable 
      style={[styles.button, variantStyle]} 
      onPress={onPress}
      accessibilityRole="button"
      // Web-specific props
      accessibilityHint={`Activates ${label}`}
      tabIndex={0}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Web-optimized styles...
});
```

### Exports

```tsx
// index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

## Styling Guidelines

### Cross-Platform Styling

Use our utility functions for cross-platform styling:

```tsx
import { createShadow, createPlatformStyles } from '@/utils/styleUtils';

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    ...createShadow({
      offsetY: 2,
      opacity: 0.1,
      radius: 4,
    }),
  },
});

// Or for platform-specific styles:
const styles = createPlatformStyles({
  common: {
    button: { padding: 16 },
  },
  ios: {
    button: { borderRadius: 8 },
  },
  android: {
    button: { borderRadius: 4 },
  },
  web: {
    button: { cursor: 'pointer' },
  },
});
```

### Theme Integration

Always use the theme system for colors, typography, and spacing:

```tsx
const { theme } = useTheme();

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  text: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text,
  },
});
```

## Accessibility

Ensure all components implement proper accessibility attributes:

- **Native**: Use `accessibilityLabel`, `accessibilityHint`, `accessibilityRole`
- **Web**: Additionally use `tabIndex`, `aria-*` attributes

Example:

```tsx
<Pressable
  accessibilityLabel={`${label} button`}
  accessibilityRole="button"
  accessibilityState={{ disabled }}
  // Web-specific
  aria-disabled={disabled}
  tabIndex={disabled ? -1 : 0}
>
  {/* Content */}
</Pressable>
```

## Performance Considerations

### Memoization

Use memoization for expensive calculations or to prevent rerenders:

```tsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

const MemoizedComponent = React.memo(MyComponent);
```

### Lazy Loading

For larger components, consider lazy loading:

```tsx
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

// Usage
<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

## Testing

Write separate tests for shared logic and platform-specific implementations:

```tsx
// ComponentName.test.tsx - Shared logic tests
// ComponentName.native.test.tsx - Native-specific tests
// ComponentName.web.test.tsx - Web-specific tests
```

Use React Native Testing Library for component testing:

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

test('calls onPress when pressed', () => {
  const onPress = jest.fn();
  const { getByText } = render(<Button label="Press Me" onPress={onPress} />);
  
  fireEvent.press(getByText('Press Me'));
  
  expect(onPress).toHaveBeenCalledTimes(1);
});
```

## Documentation

Every component should include:

1. **Purpose**: What the component does
2. **Usage**: Example code
3. **Props**: Complete prop documentation with types and defaults
4. **Platform Notes**: Any platform-specific behavior

Example README.md:

```md
# Button

A customizable button component that works across all platforms.

## Usage

```tsx
import { Button } from '@/components/ui/Button';

function MyScreen() {
  return (
    <Button 
      label="Press Me" 
      onPress={() => console.log('Pressed!')}
      variant="primary" 
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | Required | Button text |
| onPress | () => void | Required | Function called on press |
| variant | 'primary' \| 'secondary' \| 'outline' | 'primary' | Visual style |

## Platform-Specific Notes

- **Web**: Uses `cursor: pointer` for better UX
- **iOS**: Uses native haptic feedback
- **Android**: Uses Material Design ripple effect
```

## Examples

Reference these components as examples of our standards:

- `Button`
- `Card`
- `TextField`
- `Avatar` 