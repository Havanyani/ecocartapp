# Styling and Theming Guide

This guide provides comprehensive information about the styling and theming system in the EcoCart application, including theme structure, component styling, and best practices for maintaining a consistent UI.

## Table of Contents

1. [Overview](#overview)
2. [Theme Structure](#theme-structure)
3. [Using the Theme](#using-the-theme)
4. [Component Styling](#component-styling)
5. [Dark Mode Support](#dark-mode-support)
6. [Responsive Design](#responsive-design)
7. [Accessibility Considerations](#accessibility-considerations)
8. [Best Practices](#best-practices)
9. [Common Issues and Solutions](#common-issues-and-solutions)
10. [Resources](#resources)

## Overview

EcoCart uses a centralized theming system built on top of React's Context API. This approach allows for consistent styling across the app, supports multiple themes (including dark mode), and makes it easy to update the visual design system-wide.

Key features of the styling system:
- Centralized theme definition with typed properties
- Dark mode support with automatic detection
- Responsive design using React Native's Dimensions API
- Accessibility considerations built into the system
- Reusable styled components for common UI patterns

## Theme Structure

The theme is defined in `./src/theme/theme.ts` and consists of the following key sections:

### Colors

```typescript
// Light theme colors
const lightColors: ThemeColors = {
  primary: '#2E7D32',
  secondary: '#00796B',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  error: '#B00020',
  text: {
    primary: '#212121',
    secondary: '#757575',
    hint: '#9E9E9E',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF',
  },
  border: '#E0E0E0',
  // ... additional color definitions
};

// Dark theme colors
const darkColors: ThemeColors = {
  primary: '#4CAF50',
  secondary: '#009688',
  background: '#121212',
  surface: '#1E1E1E',
  error: '#CF6679',
  text: {
    primary: '#E0E0E0',
    secondary: '#AEAEAE',
    hint: '#909090',
    disabled: '#6E6E6E',
    inverse: '#121212',
  },
  border: '#2C2C2C',
  // ... additional color definitions
};
```

### Typography

```typescript
const typography = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 40,
  },
};
```

### Spacing

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};
```

### Shapes

```typescript
const shapes = {
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    round: 9999,
  },
};
```

### Shadows

```typescript
const shadows = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  // ... more shadow definitions
};
```

## Using the Theme

The theme is exposed through the `useTheme` hook, which should be used in all components that need styling:

```tsx
import { useTheme } from '@/hooks/useTheme';

const MyComponent = () => {
  const { colors, typography, spacing, shapes, shadows } = useTheme();
  
  return (
    <View 
      style={{
        backgroundColor: colors.background,
        padding: spacing.md,
        borderRadius: shapes.borderRadius.md,
        ...shadows.md,
      }}
    >
      <Text 
        style={{
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.md,
          color: colors.text.primary,
        }}
      >
        Themed Text
      </Text>
    </View>
  );
};
```

## Component Styling

### Styled Components

For frequently used UI patterns, we use styled components to encapsulate styling logic:

```tsx
// ./src/components/ui/ThemedText.tsx
import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface ThemedTextProps extends TextProps {
  variant?: 'body' | 'caption' | 'title' | 'heading' | 'subheading';
  color?: 'primary' | 'secondary' | 'hint' | 'error' | 'inverse';
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  variant = 'body',
  color = 'primary',
  style,
  ...props
}) => {
  const { colors, typography } = useTheme();
  
  // Define text styles based on variant
  const variantStyles = {
    body: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.md,
      lineHeight: typography.lineHeight.md,
    },
    // ... styles for other variants
  };
  
  // Get text color based on color prop
  const textColor = color === 'inverse' 
    ? colors.text.inverse 
    : colors.text[color] || colors.text.primary;
  
  return (
    <Text
      style={[
        variantStyles[variant],
        { color: textColor },
        style,
      ]}
      {...props}
    />
  );
};
```

### Layout Components

Consistent layout is achieved using reusable layout components:

```tsx
// ./src/components/ui/Container.tsx
import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface ContainerProps extends ViewProps {
  padded?: boolean | 'horizontal' | 'vertical';
  centered?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  padded = false,
  centered = false,
  style,
  children,
  ...props
}) => {
  const { colors, spacing } = useTheme();
  
  // Define padding based on padded prop
  const padding = {
    paddingHorizontal: padded === true || padded === 'horizontal' ? spacing.md : 0,
    paddingVertical: padded === true || padded === 'vertical' ? spacing.md : 0,
  };
  
  // Define centering styles
  const centerStyles = centered ? {
    justifyContent: 'center',
    alignItems: 'center',
  } : {};
  
  return (
    <View
      style={[
        { backgroundColor: colors.background },
        padding,
        centerStyles,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};
```

## Dark Mode Support

EcoCart automatically detects the user's preferred color scheme and applies the appropriate theme. Users can also manually override this preference in the app settings.

### Detecting Color Scheme

```tsx
// ./src/hooks/useTheme.tsx
import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';
import { selectThemePreference } from '@/store/settings';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const themePreference = useSelector(selectThemePreference);
  
  // Determine which theme to use
  const themeMode = themePreference === 'system' 
    ? colorScheme || 'light'
    : themePreference;
    
  // Use the appropriate theme
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  
  return theme;
};
```

### Theme Provider

```tsx
// ./src/providers/ThemeProvider.tsx
import React from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useTheme } from '@/hooks/useTheme';

export const ThemeProvider: React.FC = ({ children }) => {
  const theme = useTheme();
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## Responsive Design

EcoCart uses React Native's Dimensions API and custom hooks to create a responsive design system.

### Responsive Hooks

```tsx
// ./src/hooks/useResponsive.ts
import { useWindowDimensions } from 'react-native';

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  
  const isSmallDevice = width < 375;
  const isMediumDevice = width >= 375 && width < 768;
  const isLargeDevice = width >= 768;
  
  const getResponsiveValue = <T>(options: {
    small: T;
    medium: T;
    large: T;
  }): T => {
    if (isSmallDevice) return options.small;
    if (isMediumDevice) return options.medium;
    return options.large;
  };
  
  return {
    width,
    height,
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    getResponsiveValue,
  };
};
```

### Using Responsive Hooks

```tsx
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/hooks/useTheme';

const ResponsiveComponent = () => {
  const { typography } = useTheme();
  const { getResponsiveValue } = useResponsive();
  
  const fontSize = getResponsiveValue({
    small: typography.fontSize.md,
    medium: typography.fontSize.lg,
    large: typography.fontSize.xl,
  });
  
  return (
    <Text style={{ fontSize }}>
      This text scales based on device size
    </Text>
  );
};
```

## Accessibility Considerations

The theming system includes built-in accessibility features:

### Color Contrast

All theme colors are checked for proper contrast ratios to ensure readability for all users. The theme includes sets of colors that meet WCAG 2.1 AA standards for contrast.

### Text Scaling

Text components support dynamic type scaling to accommodate users who have enabled larger text sizes in their device settings:

```tsx
import { useTheme } from '@/hooks/useTheme';

const AccessibleText = ({ children }) => {
  const { typography } = useTheme();
  
  return (
    <Text 
      style={{ fontSize: typography.fontSize.md }}
      allowFontScaling={true}
      maxFontSizeMultiplier={1.5}
    >
      {children}
    </Text>
  );
};
```

## Best Practices

### General Guidelines

1. **Always use the theme system** - Don't hardcode colors, spacing, or typography values
2. **Use themed components** - Prefer using `ThemedText`, `ThemedView`, etc. over base components
3. **Create reusable styled components** - For UI patterns used in multiple places
4. **Test in both light and dark mode** - Ensure your UI looks good in both themes
5. **Test with different font sizes** - Check how your UI adapts to accessibility settings

### Styling Components

```tsx
// ❌ Don't do this
<View style={{ 
  backgroundColor: '#FFFFFF',
  padding: 16,
  borderRadius: 8,
  marginBottom: 16,
}}>
  <Text style={{ 
    color: '#212121', 
    fontSize: 16, 
    fontFamily: 'Inter-Medium' 
  }}>
    Hello World
  </Text>
</View>

// ✅ Do this instead
const MyComponent = () => {
  const { colors, typography, spacing, shapes } = useTheme();
  
  return (
    <View style={{ 
      backgroundColor: colors.background,
      padding: spacing.md,
      borderRadius: shapes.borderRadius.md,
      marginBottom: spacing.md,
    }}>
      <ThemedText variant="body">Hello World</ThemedText>
    </View>
  );
};
```

### Organizing Styles

For complex components, use StyleSheet.create to organize styles:

```tsx
import { StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

const ComplexComponent = () => {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
      borderRadius: theme.shapes.borderRadius.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontFamily: theme.typography.fontFamily.medium,
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text.primary,
    },
    // ... more styles
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Complex Component</Text>
      </View>
      {/* ... more content */}
    </View>
  );
};
```

## Common Issues and Solutions

### Theme Not Applied Correctly

**Issue**: Component isn't styled according to the theme.

**Solution**: 
- Ensure the component is wrapped in `ThemeProvider`
- Check that you're using the `useTheme` hook correctly
- Verify that theme properties are being accessed with correct path

### Colors Appearing Incorrect in Dark Mode

**Issue**: Colors don't adjust properly when switching to dark mode.

**Solution**:
- Make sure you're using color values from the theme, not hardcoded values
- Check that conditional styling based on theme is working correctly
- Verify the theme toggling logic in settings

### Inconsistent Spacing

**Issue**: UI elements have inconsistent spacing across the app.

**Solution**:
- Always use spacing values from the theme
- Create reusable layout components for common patterns
- Use a consistent approach to margin and padding

## Resources

- [React Native Styling Documentation](https://reactnative.dev/docs/style)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Inter Font Documentation](https://rsms.me/inter/)
- [Expo Dark Mode Support](https://docs.expo.dev/guides/color-schemes/)

## Related Documentation

- [Component Documentation](../../src/components/ui/README.md)
- [Accessibility Guide](./accessibility.md)
- [Performance Optimization](../performance-optimization-guide.md) 