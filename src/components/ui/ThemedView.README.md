# ThemedView

## Overview
The `ThemedView` component is a wrapper around React Native's View component that automatically applies the current theme's background color. It provides a consistent container element that adapts to the user's theme preferences, making it ideal for creating themed UI sections throughout the application.

## Usage

```tsx
import { ThemedView } from '@/components/ui/ThemedView';

// Basic usage
<ThemedView>
  <ThemedText>Content with themed background</ThemedText>
</ThemedView>

// With custom styling
<ThemedView style={{ padding: 16, borderRadius: 8, elevation: 2 }}>
  <ThemedText>Card-like container</ThemedText>
</ThemedView>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `style` | `StyleProp<ViewStyle>` | No | `undefined` | Custom style to apply to the view component |
| `...ViewProps` | `ViewProps` | No | - | All props from React Native's View component are supported |

## Features
- **Automatic Theming**: Applies the current theme's background color without manual configuration
- **Style Composition**: Combines theme styles with custom styles provided via props
- **Complete View Support**: Supports all React Native View component features and props
- **Dark Mode Support**: Automatically adjusts background color based on dark/light theme
- **Layout Flexibility**: Maintains all layout capabilities of the standard View component

## Styling
The component applies the theme's background color as its base style:

```tsx
<View 
  {...props} 
  style={[
    { backgroundColor: theme.colors.background }, 
    props.style
  ]} 
/>
```

You can override or extend these styles with custom styling:

```tsx
// Add padding and border radius
<ThemedView style={{ padding: 20, borderRadius: 12 }}>
  {/* Content */}
</ThemedView>

// Create a card-like container
<ThemedView 
  style={{ 
    padding: 16, 
    borderRadius: 8, 
    elevation: 2,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  }}
>
  {/* Card content */}
</ThemedView>
```

## Best Practices
- **Do**: Use `ThemedView` instead of React Native's `View` component for container elements
- **Do**: Nest `ThemedText` components within `ThemedView` for consistent theming
- **Don't**: Override theme colors directly in the style prop; use theme variables instead
- **Accessibility**: Ensure sufficient contrast between background and text colors
- **Layout**: Follow React Native's layout best practices with Flexbox

## Examples

### Basic Container
```tsx
<ThemedView>
  <ThemedText>Content with themed background</ThemedText>
</ThemedView>
```

### Card Container
```tsx
<ThemedView 
  style={{ 
    padding: 16, 
    borderRadius: 8, 
    elevation: 2,
    margin: 8
  }}
>
  <ThemedText style={{ fontWeight: 'bold', marginBottom: 8 }}>
    Card Title
  </ThemedText>
  <ThemedText>Card content goes here</ThemedText>
</ThemedView>
```

### Screen Container
```tsx
<ThemedView style={{ flex: 1, padding: 16 }}>
  <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>
    Screen Title
  </ThemedText>
  
  <ThemedView style={{ marginTop: 16 }}>
    <ThemedText>Screen content goes here</ThemedText>
  </ThemedView>
  
  <ThemedView style={{ marginTop: 'auto' }}>
    <Button title="Continue" onPress={handleContinue} />
  </ThemedView>
</ThemedView>
```

### List Item
```tsx
<ThemedView 
  style={{ 
    flexDirection: 'row', 
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  }}
>
  <IconSymbol name="check" size={24} color={theme.colors.primary} />
  <ThemedView style={{ marginLeft: 12 }}>
    <ThemedText style={{ fontWeight: 'bold' }}>Item Title</ThemedText>
    <ThemedText style={{ fontSize: 14, opacity: 0.7 }}>Item description</ThemedText>
  </ThemedView>
</ThemedView>
```

## Implementation Details
The component uses the `useTheme` hook to access the current theme configuration:

```tsx
export function ThemedView(props: ViewProps): JSX.Element {
  const { theme } = useTheme();
  return <View {...props} style={[{ backgroundColor: theme.colors.background }, props.style]} />;
}
```

## Related Components
- `ThemedText`: Text component with theme-aware text color
- `Button`: Themed button component that often uses ThemedView internally
- `Card`: Complex component built with ThemedView

## Related Documentation
- [Theming System](../../../docs/design/theming.md)
- [Layout Guidelines](../../../docs/design/layout.md)
- [Accessibility Guidelines](../../../docs/design/accessibility.md) 