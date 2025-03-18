# ThemedText

## Overview
The `ThemedText` component is a wrapper around React Native's Text component that automatically applies the current theme's text styling. It ensures consistent typography and text colors throughout the application while respecting the user's theme preferences.

## Usage

```tsx
import { ThemedText } from '@/components/ui/ThemedText';

// Basic usage
<ThemedText>Hello World</ThemedText>

// With custom styling
<ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>
  Heading Text
</ThemedText>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `style` | `StyleProp<TextStyle>` | No | `undefined` | Custom style to apply to the text component |
| `...TextProps` | `TextProps` | No | - | All props from React Native's Text component are supported |

## Features
- **Automatic Theming**: Applies the current theme's text colors without manual configuration
- **Style Composition**: Combines theme styles with custom styles provided via props
- **Complete Text Support**: Supports all React Native Text component features and props
- **Responsive Typography**: Works with the app's responsive design system
- **Dark Mode Support**: Automatically adjusts text color based on dark/light theme

## Styling
The component applies the following base styling:

```tsx
const styles = StyleSheet.create({
  text: {
    fontSize: 16,
  },
});
```

You can override or extend these styles:

```tsx
// Override base fontSize
<ThemedText style={{ fontSize: 20 }}>Larger text</ThemedText>

// Add additional styling
<ThemedText style={{ fontStyle: 'italic', marginBottom: 8 }}>
  Emphasized text with margin
</ThemedText>
```

## Best Practices
- **Do**: Use `ThemedText` instead of React Native's `Text` component throughout the app
- **Do**: Keep custom styling minimal, leveraging the theme system for consistency
- **Don't**: Override theme colors directly in the style prop; use theme variables instead
- **Accessibility**: Set appropriate `accessibilityLabel` props for screen readers
- **Accessibility**: Avoid using very small font sizes (keep above 14px for readability)

## Examples

### Basic Text
```tsx
<ThemedText>Normal text that follows theme colors</ThemedText>
```

### Custom Styled Text
```tsx
<ThemedText 
  style={{ 
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16
  }}
>
  Styled Heading
</ThemedText>
```

### With Accessibility Props
```tsx
<ThemedText
  accessibilityLabel="Important notification message"
  accessibilityRole="alert"
>
  Your collection has been scheduled successfully!
</ThemedText>
```

### Rich Text Formatting
```tsx
<ThemedText>
  Normal text with <ThemedText style={{ fontWeight: 'bold' }}>bold</ThemedText> and{' '}
  <ThemedText style={{ fontStyle: 'italic' }}>italic</ThemedText> parts.
</ThemedText>
```

## Implementation Details
The component uses the `useTheme` hook to access the current theme configuration:

```tsx
export function ThemedText({ style, ...props }: ThemedTextProps) {
  const { theme } = useTheme();

  return (
    <Text
      style={[
        styles.text,
        {
          color: theme.colors.text.primary,
        },
        style,
      ]}
      {...props}
    />
  );
}
```

## Related Components
- `ThemedView`: Container component with theme-aware background color
- `IconSymbol`: Themed icon component
- `Button`: Themed button component that uses ThemedText for labels

## Related Documentation
- [Theming System](../../../docs/design/theming.md)
- [Typography Guidelines](../../../docs/design/typography.md)
- [Accessibility Guidelines](../../../docs/design/accessibility.md) 