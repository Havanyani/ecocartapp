# Responsive Layout System

## Overview

This document outlines our approach to responsive design across mobile and web platforms. We've implemented a flexible system that adapts layouts based on screen dimensions while maintaining a consistent user experience.

## Breakpoints

We define standard breakpoints for different device sizes:

```typescript
export const breakpoints = {
  small: 375,  // Small phones
  medium: 768, // Large phones / small tablets
  large: 992,  // Tablets
  xlarge: 1200 // Desktop
};
```

## Responsive Styles

### Creating Responsive Styles

Use the `createResponsiveStyles` utility to define styles that adapt to different screen sizes:

```typescript
import { createResponsiveStyles } from '@/utils/styleUtils';

const styles = createResponsiveStyles({
  // Required base styles for all screen sizes
  base: {
    container: {
      padding: 16,
      backgroundColor: '#ffffff',
    },
    heading: {
      fontSize: 18,
      fontWeight: 'bold',
    },
  },
  
  // Styles for small screens and up (>= 375px)
  small: {
    heading: {
      fontSize: 20,
    },
  },
  
  // Styles for medium screens and up (>= 768px)
  medium: {
    container: {
      padding: 24,
      flexDirection: 'row',
    },
    heading: {
      fontSize: 24,
    },
  },
  
  // Styles for large screens and up (>= 992px)
  large: {
    container: {
      padding: 32,
      maxWidth: 960,
      marginHorizontal: 'auto',
    },
  },
  
  // Styles for extra large screens (>= 1200px)
  xlarge: {
    container: {
      maxWidth: 1140,
    },
  },
});
```

### How It Works

The utility:
1. Starts with the base styles as a foundation
2. Applies styles for each breakpoint if the screen width is greater than or equal to that breakpoint
3. Creates a StyleSheet with the merged styles

## Tracking Screen Dimensions

To respond to screen size changes (especially important for web), use the `useScreenDimensions` hook:

```typescript
import { useScreenDimensions } from '@/utils/styleUtils';

function ResponsiveComponent() {
  const { window, screen } = useScreenDimensions();
  
  // Check if we're on a larger screen
  const isLargeScreen = window.width >= 768;
  
  return (
    <View style={styles.container}>
      {isLargeScreen ? (
        <WideLayoutComponent />
      ) : (
        <NarrowLayoutComponent />
      )}
    </View>
  );
}
```

## Responsive Layout Patterns

### Stack/Row Layout Pattern

For layouts that need to switch between column (vertical) on mobile and row (horizontal) on larger screens:

```typescript
function StackRowLayout({ children }) {
  const { window } = useScreenDimensions();
  const isLargeScreen = window.width >= breakpoints.medium;
  
  return (
    <View
      style={{
        flexDirection: isLargeScreen ? 'row' : 'column',
        alignItems: isLargeScreen ? 'center' : 'stretch',
      }}
    >
      {children}
    </View>
  );
}
```

### Grid System

For creating responsive grids that adapt across screen sizes:

```typescript
function ResponsiveGrid({ items, minItemWidth = 250 }) {
  const { window } = useScreenDimensions();
  
  // Calculate number of columns based on available width
  const numColumns = Math.max(1, Math.floor(window.width / minItemWidth));
  
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {items.map(item => (
        <View key={item.id} style={{ width: `${100 / numColumns}%` }}>
          <ItemComponent item={item} />
        </View>
      ))}
    </View>
  );
}
```

## Platform-Specific Considerations

### Web-Specific Styles

Web often needs additional styles for optimal user experience:

```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  button: {
    padding: 16,
    // Web-specific styles
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'all 0.2s ease',
      ':hover': {
        opacity: 0.9,
      }
    } : {}),
  },
});
```

### Safe Areas

Always account for device safe areas, especially on mobile:

```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function SafeComponent() {
  const insets = useSafeAreaInsets();
  
  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {/* Content */}
    </View>
  );
}
```

## Media Queries for Web

For web-specific media queries, we use a combination of our responsive utilities and platform detection:

```typescript
import { Platform } from 'react-native';
import { createResponsiveStyles, breakpoints } from '@/utils/styleUtils';

// Web-only media query helper
const mediaQuery = (query, styles) => {
  if (Platform.OS !== 'web') return {};
  
  // For web, we attach media query styles via style attribute
  return {
    [`@media ${query}`]: styles
  };
};

// Example usage
const styles = {
  container: {
    padding: 16,
    ...mediaQuery(`(min-width: ${breakpoints.medium}px)`, {
      padding: 32,
      maxWidth: '80%',
      marginHorizontal: 'auto',
    }),
  },
};
```

## Best Practices

1. **Start with mobile-first designs** - Begin with compact layouts and enhance for larger screens
2. **Use relative units** - Prefer percentages and flex over fixed pixel dimensions
3. **Test on multiple devices** - Verify your layouts on various screen sizes
4. **Use conditional rendering** - Render different components based on screen size when appropriate
5. **Leverage StyleSheet.create()** - For performance optimization

## Examples

See the following components for implementation examples:
- `src/components/ui/Card/` - Responsive card with adaptive padding
- `src/components/screens/Dashboard/` - Responsive grid layout
- `src/components/ui/Navigation/` - Adapts between bottom tabs and side navigation 