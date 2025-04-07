# Theme Usage Guide

This guide explains how to use the theme system properly in the EcoCart app.

## Recommended Theme Usage Pattern

When using the theme in your components, always follow this two-step pattern:

```typescript
import { useTheme } from '@/theme';

function MyComponent() {
  // Step 1: Get the theme function
  const themeFunc = useTheme();
  
  // Step 2: Call the function to get the actual theme object
  const theme = themeFunc();
  
  // Now you can use theme properties
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>Hello World</Text>
    </View>
  );
}
```

## Why This Pattern?

This two-step approach ensures type safety and proper separation of concerns. The hook returns a function that, when called, provides the actual theme object with all its properties.

## Using With StyleSheet

```typescript
import { useTheme } from '@/theme';
import { StyleSheet, View, Text } from 'react-native';

function MyComponent() {
  const themeFunc = useTheme();
  const theme = themeFunc();
  
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: theme.colors.text }]}>
        Themed Text
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
  },
});
```

## Common Theme Properties

The theme object provides access to:

- `theme.colors`: Color palette (primary, text, textSecondary, background, etc.)
- `theme.spacing`: Spacing values for consistent layout
- `theme.typography`: Font styles
- `theme.dark`: Boolean indicating if dark mode is active

## ESLint Rule

We have a custom ESLint rule that enforces this pattern. If you use the incorrect pattern (e.g., `const theme = useTheme()`), ESLint will flag it and can automatically fix it for you:

```sh
npx eslint src/**/*.tsx --fix
```

## Theme Provider

The theme system is provided at the app root level:

```typescript
import { ThemeProvider } from '@/theme';

export default function App() {
  return (
    <ThemeProvider>
      {/* Your app components */}
    </ThemeProvider>
  );
}
```

## Theme Switching

To toggle between light and dark themes:

```typescript
import { useTheme } from '@/theme';

function ThemeSwitcher() {
  const themeFunc = useTheme();
  const theme = themeFunc();
  
  return (
    <Button 
      title={`Switch to ${theme.dark ? 'Light' : 'Dark'} Mode`}
      onPress={theme.toggleTheme}
    />
  );
}
``` 