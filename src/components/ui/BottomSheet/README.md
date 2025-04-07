# BottomSheet Component

A cross-platform bottom sheet component that slides up from the bottom of the screen. It supports various configurations including snap points, gestures, animations, and customizable content.

## Features

- 🔄 **Cross-platform**: Works on both native mobile and web platforms
- 📏 **Snap points**: Configure multiple heights with snap points using pixels, percentages, or content-based sizing
- 🖐️ **Gesture control**: Supports drag gestures to reposition or dismiss the sheet
- 🎭 **Animated transitions**: Smooth animations for opening, closing, and changing positions
- 🎨 **Customizable**: Configurable appearance with support for theming
- 📱 **Safe area support**: Respects device safe areas on native platforms
- 🌐 **Web optimizations**: Uses React portals, prevents body scrolling, and handles keyboard events on web

## Usage Examples

### Basic Usage

```tsx
import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import { BottomSheet } from '../ui/BottomSheet';

function BasicExample() {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <View>
      <Button 
        title="Show Bottom Sheet" 
        onPress={() => setIsVisible(true)} 
      />
      
      <BottomSheet
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
        snapPoints={['50%']}
      >
        <Text>This is the content of the bottom sheet</Text>
      </BottomSheet>
    </View>
  );
}
```

### Multiple Snap Points

Configure the sheet with multiple snap points to allow users to expand or collapse it:

```tsx
<BottomSheet
  isVisible={isVisible}
  onClose={() => setIsVisible(false)}
  snapPoints={['25%', '50%', '90%']}
  initialSnapIndex={1}
  onPositionChange={(index) => console.log(`Snap point changed to index ${index}`)}
>
  <Text>This is the content of the bottom sheet</Text>
</BottomSheet>
```

### Content-Based Height

Let the sheet automatically size based on its content:

```tsx
<BottomSheet
  isVisible={isVisible}
  onClose={() => setIsVisible(false)}
  snapPoints={['content']}
>
  <Text>This sheet will automatically size to fit this content</Text>
</BottomSheet>
```

### With Title and Close Button

Add a title and close button to the sheet:

```tsx
<BottomSheet
  isVisible={isVisible}
  onClose={() => setIsVisible(false)}
  title="Settings"
  showCloseButton={true}
>
  <Text>Content goes here</Text>
</BottomSheet>
```

### Full Screen Expansion

Allow the sheet to expand to full screen:

```tsx
<BottomSheet
  isVisible={isVisible}
  onClose={() => setIsVisible(false)}
  snapPoints={['50%', '100%']}
  expandToFullscreen={true}
>
  <Text>This sheet can expand to full screen</Text>
</BottomSheet>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **isVisible** | `boolean` | *required* | Controls the visibility of the bottom sheet |
| **onClose** | `() => void` | *required* | Callback function called when the sheet is closed |
| **children** | `React.ReactNode` | *required* | Content to display inside the bottom sheet |
| **snapPoints** | `BottomSheetSnapPoint[]` | `['50%']` | Array of snap points defining the heights at which the sheet can rest |
| **initialSnapIndex** | `number` | `0` | Initial snap point index to display when opened |
| **containerStyle** | `StyleProp<ViewStyle>` | `undefined` | Custom styles for the bottom sheet container |
| **contentStyle** | `StyleProp<ViewStyle>` | `undefined` | Custom styles for the bottom sheet content |
| **showHandle** | `boolean` | `true` | Whether to show the drag handle indicator at the top of the sheet |
| **rounded** | `boolean` | `true` | Whether the top corners of the sheet should be rounded |
| **borderRadius** | `number` | `16` | Border radius for the top corners when rounded is true |
| **closeOnBackdropPress** | `boolean` | `true` | Whether pressing the backdrop should close the sheet |
| **backdropColor** | `string` | `'rgba(0, 0, 0, 0.5)'` | Color of the backdrop overlay |
| **animateOnOpen** | `boolean` | `true` | Whether to animate the sheet when opening |
| **animationDuration** | `number` | `300` | Duration of animations in milliseconds |
| **enableDrag** | `boolean` | `true` | Whether dragging to reposition the sheet is enabled |
| **onPositionChange** | `(index: number) => void` | `undefined` | Callback when the sheet changes position |
| **showBackdrop** | `boolean` | `true` | Whether to show the backdrop overlay |
| **testID** | `string` | `undefined` | Test ID for testing frameworks |
| **accessibilityLabel** | `string` | `undefined` | Accessibility label for screen readers |
| **expandToFullscreen** | `boolean` | `false` | Whether the sheet can expand to occupy the full screen |
| **showCloseButton** | `boolean` | `false` | Whether to show a close button in the top right corner |
| **title** | `string` | `undefined` | Optional title to display at the top of the sheet |
| **enableBottomSafeArea** | `boolean` | `true` (native) / `false` (web) | Whether to add padding for the bottom safe area on mobile devices |
| **onDragStart** | `() => void` | `undefined` | Callback when the user starts dragging the sheet |
| **onDragEnd** | `() => void` | `undefined` | Callback when the user stops dragging the sheet |

### BottomSheetSnapPoint Type

The `snapPoints` prop accepts an array of values with the following types:

- `number`: Explicit height in pixels
- `string` ending with `%`: Percentage of screen height (e.g. `'50%'`)
- `'content'`: Automatically size based on content height

## Platform-Specific Implementation Details

### Native (iOS & Android)

The native implementation:
- Uses React Native's `Animated` and `PanResponder` for smooth gesture handling
- Provides haptic feedback on position changes (on supported devices)
- Uses native Modal component for proper stacking and backdrop handling
- Respects safe area insets on devices with notches or system UI elements
- Handles back button press on Android

### Web

The web implementation:
- Uses React portals to render the sheet outside the normal component hierarchy
- Provides proper keyboard navigation (Escape key to close)
- Handles both mouse and touch events for consistent behavior
- Prevents body scrolling when the sheet is open
- Uses CSS transitions for smooth animations
- Constrains the maximum width to maintain readability on large screens

## Accessibility

The BottomSheet component includes the following accessibility features:

- Proper focus management when opened
- Support for screen readers through accessibilityLabel
- Keyboard navigation (Escape to close on web)
- Proper ARIA attributes for web implementation

## Best Practices

- Use snap points that make sense for your content. Consider using the 'content' snap point for dynamic content.
- Provide clear visual cues for interactivity, such as the drag handle.
- Consider the need for a close button for better discoverability.
- Use the onPositionChange callback to update your UI based on the sheet's position.
- For sheets with forms, consider handling keyboard appearance and ensuring inputs are visible.
- Test on different screen sizes to ensure the sheet behaves properly. 