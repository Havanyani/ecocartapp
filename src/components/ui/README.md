# UI Components

## Overview
This directory contains reusable UI components that form the foundation of the EcoCart application's user interface. These components follow the application's theming system and provide consistent styling, accessibility features, and interactive behaviors throughout the app.

## Components

### ThemedText
Text component that automatically applies the current theme's text color and typography styles.

[See detailed documentation](./ThemedText.README.md)

### ThemedView
Container component that automatically applies the current theme's background color.

[See detailed documentation](./ThemedView.README.md)

### IconSymbol
Icon component wrapper around Expo's vector icons with additional functionality.

[See detailed documentation](./IconSymbol.README.md)

### HapticTab
Tab component with haptic feedback for improved touch interaction.

[See detailed documentation](./HapticTab.README.md)

### Button
Customizable button component with theming support and various style variants.

[See detailed documentation](./Button.README.md)

### FormInput
Input field component with theming support, validation, and error handling.

[See detailed documentation](./FormInput.README.md)

### LoadingState
Component for displaying loading states with customizable spinners and messages.

[See detailed documentation](./LoadingState.README.md)

### Toast
Component for displaying temporary notifications and feedback messages.

[See detailed documentation](./Toast.README.md)

## Theme Integration
All UI components use the `useTheme` hook to access the current theme configuration. Theme changes are automatically reflected in all components without requiring manual prop changes.

## Accessibility
These components are built with accessibility in mind:
- Proper contrast ratios for text components
- Appropriate roles and states for interactive elements
- Support for screen readers and assistive technologies
- Keyboard navigation support

## Best Practices
- Use themed components instead of basic React Native components for consistent styling
- Maintain the component hierarchy (e.g., ThemedText within ThemedView)
- Follow the established prop patterns when extending components
- Use semantic components for their intended purpose

## Related Documentation
- [UI/UX Style Guide](../../../docs/design/style-guide.md)
- [Theming System](../../../docs/design/theming.md)
- [Accessibility Guidelines](../../../docs/design/accessibility.md) 