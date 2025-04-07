# Modal Component

A cross-platform modal dialog component with customizable positioning, animation, and behavior.

## Features

- Animated appearance/disappearance
- Customizable positioning (top, center, bottom)
- Optional header with close button and title
- Backdrop tap handling
- Hardware back button support (Android) and Escape key support (Web)
- Full-screen option
- Platform-specific optimizations

## Usage

```tsx
import { Modal } from './components/ui/Modal';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';

function MyComponent() {
  const [visible, setVisible] = useState(false);
  
  const openModal = () => setVisible(true);
  const closeModal = () => setVisible(false);
  
  return (
    <View>
      <Button title="Open Modal" onPress={openModal} />
      
      <Modal
        visible={visible}
        onClose={closeModal}
        title="Modal Title"
        showHeader
      >
        <Text>This is the modal content</Text>
        <Button title="Close" onPress={closeModal} />
      </Modal>
    </View>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | boolean | Required | Whether the modal is visible |
| `onClose` | function | Required | Callback when the user attempts to close the modal |
| `children` | ReactNode | Required | Modal content |
| `containerStyle` | StyleProp<ViewStyle> | undefined | Custom style for the modal container |
| `contentStyle` | StyleProp<ViewStyle> | undefined | Custom style for the modal content |
| `contentPadding` | boolean | true | Whether to add padding to the modal content |
| `closeOnBackdropPress` | boolean | true | Whether to close the modal when tapping outside |
| `closeOnBackButton` | boolean | true | Whether to close the modal when pressing the hardware back button (Android) or Escape key (Web) |
| `animateTransition` | boolean | true | Whether to animate modal appearance/disappearance |
| `animationDuration` | number | 300 | Duration of the appearance/disappearance animation in milliseconds |
| `backdropColor` | string | 'rgba(0, 0, 0, 0.5)' | Custom backdrop color |
| `presentAboveStatusBar` | boolean | false | Whether to render the modal above the status bar (Native only) |
| `testID` | string | undefined | ID for testing |
| `accessibilityLabel` | string | undefined | Accessibility label |
| `fullScreen` | boolean | false | Whether the modal should span the full width and height of the screen |
| `position` | 'top' \| 'center' \| 'bottom' | 'center' | Position of the modal on screen |
| `showHeader` | boolean | false | Whether the modal has a header with a close button |
| `title` | string | undefined | Title to display in the header |

## Modal Positions

### Center (Default)
Places the modal in the center of the screen, which is ideal for important information or confirmations.

### Top
Positions the modal at the top of the screen, useful for notifications or alerts.

### Bottom
Positions the modal at the bottom of the screen, similar to action sheets or bottom drawers.

## Platform-Specific Implementation Details

### Native (iOS & Android)
- Uses React Native's built-in Modal component
- Safe area insets handling
- Hardware back button support for Android
- Status bar configuration options

### Web
- Uses React portals for proper stacking context
- Keyboard focus management with Escape key support
- Scroll locking on the body when modal is open
- CSS transitions for smoother animations

## Best Practices

- Keep modals focused on a single task or piece of information
- Use clear and concise titles that describe the modal's purpose
- Provide obvious ways to dismiss the modal (buttons, backdrop press)
- Consider using different positions for different types of content:
  - Center for main content and important decisions
  - Bottom for actions or selection menus
  - Top for notifications or quick information
- Avoid nesting modals when possible

## Examples

### Confirmation Modal

```tsx
<Modal
  visible={showConfirmation}
  onClose={() => setShowConfirmation(false)}
  position="center"
  showHeader
  title="Confirm Action"
>
  <Text style={styles.modalText}>
    Are you sure you want to proceed with this action?
  </Text>
  <View style={styles.buttonRow}>
    <Button 
      title="Cancel" 
      onPress={() => setShowConfirmation(false)} 
    />
    <Button 
      title="Confirm" 
      onPress={handleConfirm} 
    />
  </View>
</Modal>
```

### Action Sheet Style

```tsx
<Modal
  visible={showOptions}
  onClose={() => setShowOptions(false)}
  position="bottom"
  contentStyle={styles.actionSheet}
>
  <Text style={styles.actionTitle}>Select an Option</Text>
  <TouchableOpacity 
    style={styles.option}
    onPress={() => handleOptionSelect('option1')}
  >
    <Text>Option 1</Text>
  </TouchableOpacity>
  <TouchableOpacity 
    style={styles.option}
    onPress={() => handleOptionSelect('option2')}
  >
    <Text>Option 2</Text>
  </TouchableOpacity>
  <TouchableOpacity 
    style={[styles.option, styles.cancelOption]}
    onPress={() => setShowOptions(false)}
  >
    <Text style={styles.cancelText}>Cancel</Text>
  </TouchableOpacity>
</Modal>
```

### Full-Screen Modal

```tsx
<Modal
  visible={showFullScreen}
  onClose={() => setShowFullScreen(false)}
  fullScreen
  showHeader
  title="Full Screen Content"
>
  <ScrollView>
    <Text style={styles.heading}>Detailed Information</Text>
    <Text style={styles.paragraph}>
      This is a full-screen modal that provides more space for complex content,
      detailed forms, or rich media experiences.
    </Text>
    {/* More content here */}
  </ScrollView>
</Modal>
``` 