# IconSymbol

## Overview
The `IconSymbol` component is a flexible wrapper around Expo's `MaterialCommunityIcons` that provides a consistent way to display icons throughout the EcoCart application. It supports both static icons and touchable icons with press handlers, making it suitable for various UI requirements.

## Usage

```tsx
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { theme } = useTheme();
  
  // Static icon
  return (
    <IconSymbol 
      name="recycle" 
      size={24} 
      color={theme.colors.primary} 
    />
  );
}

// Touchable icon
function IconButton() {
  const handlePress = () => {
    console.log('Icon pressed');
  };
  
  return (
    <IconSymbol 
      name="bell" 
      size={24} 
      color="#007AFF" 
      onPress={handlePress} 
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `name` | `string` | Yes | - | The name of the icon from MaterialCommunityIcons |
| `size` | `number` | Yes | - | Size of the icon in pixels |
| `color` | `string` | Yes | - | Color of the icon (hex, rgb, or named color) |
| `style` | `StyleProp<ViewStyle>` | No | `undefined` | Custom style to apply to the container |
| `...TouchableOpacityProps` | `TouchableOpacityProps` | No | - | All props from TouchableOpacity are supported |

## Features
- **Dual Behavior**: Functions as both a static and touchable icon based on props
- **Material Community Icons**: Access to 1000+ icon designs from the Material Community Icons collection
- **Customizable**: Control the size, color, and container styling
- **Theme Integration**: Works seamlessly with the app's theming system
- **Accessibility**: Maintains touch target sizes and accessibility props

## Styling
The component has a minimal default style focused on alignment:

```tsx
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

You can apply custom styling to the container:

```tsx
// Add background and padding
<IconSymbol
  name="check"
  size={20}
  color="white"
  style={{
    backgroundColor: 'green',
    borderRadius: 20,
    padding: 8,
  }}
/>
```

## Best Practices
- **Do**: Use consistent icon sizes throughout the application (24px for standard icons)
- **Do**: Apply appropriate touch target sizes (at least 44x44 px) for touchable icons
- **Do**: Use semantic icon names that reflect their purpose
- **Don't**: Use icons without sufficient contrast against their background
- **Accessibility**: Always provide `accessibilityLabel` for touchable icons

## Examples

### Basic Icon
```tsx
<IconSymbol 
  name="recycle" 
  size={24} 
  color={theme.colors.primary} 
/>
```

### Touchable Icon with Accessibility
```tsx
<IconSymbol 
  name="arrow-left" 
  size={24} 
  color={theme.colors.text.primary} 
  onPress={handleGoBack}
  accessibilityLabel="Go back"
  accessibilityRole="button"
/>
```

### Icon with Badge
```tsx
<View style={{ position: 'relative' }}>
  <IconSymbol 
    name="bell" 
    size={24} 
    color={theme.colors.text.primary} 
    onPress={openNotifications}
  />
  {unreadCount > 0 && (
    <View 
      style={{
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ThemedText style={{ fontSize: 12, color: 'white' }}>
        {unreadCount}
      </ThemedText>
    </View>
  )}
</View>
```

### Tab Bar Icon
```tsx
<IconSymbol 
  name={focused ? 'home' : 'home-outline'} 
  size={24} 
  color={focused ? theme.colors.primary : theme.colors.text.secondary} 
/>
```

## Implementation Details
The component automatically uses TouchableOpacity when an onPress handler is provided:

```tsx
export function IconSymbol({ name, size, color, style, ...props }: IconSymbolProps) {
  const Component = props.onPress ? TouchableOpacity : View;

  return (
    <Component style={style} {...props}>
      <MaterialCommunityIcons name={name} size={size} color={color} />
    </Component>
  );
}
```

## Related Components
- `ThemedText`: Text component with theme-aware styling
- `Button`: Themed button component that often uses IconSymbol for icons
- `HapticTab`: Tab component with haptic feedback that uses icons

## Related Documentation
- [Icon Guidelines](../../../docs/design/icons.md)
- [Theming System](../../../docs/design/theming.md)
- [Material Community Icons Reference](https://pictogrammers.com/library/mdi/) 