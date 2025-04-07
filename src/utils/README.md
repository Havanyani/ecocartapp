# Cross-Platform Utilities

This directory contains utilities that help ensure consistent behavior across iOS, Android, and Web platforms.

## Style Utilities

### `styleUtils.ts`

This file contains utilities for handling cross-platform styling:

#### `createShadow({ color, offsetX, offsetY, opacity, radius, elevation })`

Creates shadow styles that work correctly across all platforms:
- On iOS: Uses shadowColor, shadowOffset, shadowOpacity, shadowRadius
- On Android: Uses the same iOS properties plus elevation
- On Web: Converts to CSS boxShadow

Example:
```tsx
import { createShadow } from '@/utils/styleUtils';

const styles = StyleSheet.create({
  card: {
    // Other styles...
    ...createShadow({
      offsetY: 2,
      opacity: 0.1,
      radius: 4,
      elevation: 2
    }),
  }
});
```

#### `createElevation(elevation)`

Utility to add Android elevation:
```tsx
import { createElevation } from '@/utils/styleUtils';

const styles = StyleSheet.create({
  elevatedView: {
    // Other styles...
    ...createElevation(4),
  }
});
```

#### `createPlatformStyles({ common, ios, android, web })`

Creates platform-specific styles:
```tsx
import { createPlatformStyles } from '@/utils/styleUtils';

const styles = createPlatformStyles({
  common: {
    container: {
      flex: 1,
    },
  },
  ios: {
    button: {
      borderRadius: 10,
    },
  },
  android: {
    button: {
      borderRadius: 4,
    },
  },
  web: {
    button: {
      cursor: 'pointer',
    },
  },
});
```

## Components

### `ShadowCard`

A cross-platform card component that handles shadows correctly:

```tsx
import ShadowCard from '@/components/ui/ShadowCard';

function MyComponent() {
  return (
    <ShadowCard 
      shadowLevel={2} 
      borderRadius={8} 
      padded={true}
    >
      <Text>Card content goes here</Text>
    </ShadowCard>
  );
}
```

Shadow levels:
1. Subtle shadow
2. Light shadow (default)
3. Medium shadow
4. Pronounced shadow
5. Heavy shadow

Props:
- `shadowLevel`: 1-5 (default: 2)
- `borderRadius`: Number (default: 8)
- `padded`: Boolean (default: false)
- `containerStyle`: Additional styles
- `shadowConfig`: Custom shadow configuration 