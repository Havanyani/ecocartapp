# Button Component

This is a cross-platform button component that works seamlessly on both React Native mobile and web platforms.

## Structure

- `Button.tsx` - Shared types and interface
- `Button.native.tsx` - React Native implementation
- `Button.web.tsx` - Web-specific implementation
- `index.ts` - Exports the appropriate platform-specific implementation

## Usage

```tsx
import { Button } from '@/components/ui/Button';

function MyComponent() {
  return (
    <Button
      label="Click Me"
      onPress={() => console.log('Button pressed')}
      variant="primary"
      size="medium"
    />
  );
}
```

## Platform-Specific Architecture

This component demonstrates our cross-platform architecture:

1. **Shared Interface**: All components share a single TypeScript interface
2. **Platform-Specific Implementation**: Each platform gets its optimized implementation
3. **Unified Import**: Developers use a single import path that resolves to the correct implementation
4. **Consistent API**: The component works the same way across platforms
5. **Web Optimization**: The web version uses native web elements for better performance and SEO

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | Required | Button text content |
| `onPress` | () => void | Required | Function to call when button is pressed |
| `variant` | 'primary' \| 'secondary' \| 'outline' \| 'text' | 'primary' | Visual style variant of the button |
| `size` | 'small' \| 'medium' \| 'large' | 'medium' | Size variant of the button |
| `isLoading` | boolean | false | Whether the button is in a loading state |
| `disabled` | boolean | false | Whether the button is disabled |
| `leftIcon` | React.ReactNode | undefined | Optional icon to display before the label |
| `rightIcon` | React.ReactNode | undefined | Optional icon to display after the label |
| `style` | StyleProp<ViewStyle> | undefined | Additional styles for the button container |
| `textStyle` | StyleProp<TextStyle> | undefined | Additional styles for the button text |
| `accessibilityLabel` | string | undefined | Accessibility label for screen readers |
| `testID` | string | undefined | Test ID for testing |

## Example

See `src/components/ui/ButtonShowcase.tsx` for a complete example of all button variants. 