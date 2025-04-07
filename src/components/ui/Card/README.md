# Card Component

A flexible card component that provides a container for content with customizable shadows, borders, and interactions.

## Structure

- `Card.tsx` - Shared types and interface
- `Card.native.tsx` - React Native implementation
- `Card.web.tsx` - Web-specific implementation
- `index.ts` - Exports the appropriate platform-specific implementation

## Usage

```tsx
import { Card } from '@/components/ui/Card';
import { Text, View } from 'react-native';

function CardExample() {
  return (
    <Card 
      shadowLevel={2}
      borderRadius={8}
      padded={true}
      onPress={() => console.log('Card pressed')}
    >
      <Text style={styles.title}>Card Title</Text>
      <Text style={styles.body}>This is a card with customizable shadow and border radius.</Text>
    </Card>
  );
}
```

## Platform-Specific Architecture

This component demonstrates our cross-platform architecture:

1. **Shared Interface**: All components share a single TypeScript interface
2. **Platform-Specific Implementation**: Each platform gets its optimized implementation
3. **Unified Import**: Developers use a single import path that resolves to the correct implementation
4. **Consistent API**: The component works the same way across platforms
5. **Optimal UX**: Each platform gets an implementation that matches platform conventions

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | Required | Content to be rendered inside the card |
| style | StyleProp<ViewStyle> | undefined | Additional styles for the card |
| onPress | () => void | undefined | Function called when card is pressed (makes card interactive) |
| shadowLevel | 1 \| 2 \| 3 \| 4 \| 5 | 2 | Level of shadow from subtle (1) to heavy (5) |
| borderRadius | number | 8 | Border radius of the card |
| padded | boolean | true | Whether to add padding inside the card |
| testID | string | undefined | Test ID for testing |
| accessibilityLabel | string | undefined | Accessibility label for screen readers |

## Shadow Levels

- **Level 1**: Subtle shadow (1px offset, low opacity)
- **Level 2**: Light shadow (2px offset, low-medium opacity)
- **Level 3**: Medium shadow (3px offset, medium opacity) 
- **Level 4**: Pronounced shadow (4px offset, medium-high opacity)
- **Level 5**: Heavy shadow (6px offset, high opacity)

## Platform-Specific Notes

### Native (iOS & Android)
- Uses native shadow properties and elevation for Android
- Interactivity via TouchableOpacity with feedback
- Platform-optimized shadow implementations

### Web
- Uses CSS box-shadow for consistent rendering
- Interactive cards have hover and press effects
- Keyboard navigation support via tabIndex and keyboard events
- Transition animations for smooth interactions

## Examples

### Basic Card
```tsx
<Card>
  <Text>Simple card with default styling</Text>
</Card>
```

### Interactive Card with Custom Shadow
```tsx
<Card 
  onPress={() => handleCardPress()}
  shadowLevel={4}
  borderRadius={12}
>
  <Text>Click me!</Text>
</Card>
```

### Card with Custom Styling
```tsx
<Card
  style={{ backgroundColor: '#f0f8ff', marginVertical: 8 }}
  shadowLevel={3}
  padded={false}
>
  <Image source={imageSource} style={{ width: '100%', height: 200 }} />
  <View style={{ padding: 16 }}>
    <Text>Card with custom styling and no default padding</Text>
  </View>
</Card>
``` 