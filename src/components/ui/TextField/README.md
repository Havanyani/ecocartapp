# TextField Component

A cross-platform text input component with support for various visual styles, animations, and validation states.

## Features

- Multiple visual variants: outlined, filled, and underlined
- Animated label that transforms on focus
- Error and helper text support
- Character counting
- Leading and trailing icons
- Disabled state
- Platform-specific optimizations

## Usage

```tsx
import { TextField } from './components/ui/TextField';

// Basic usage
<TextField
  label="Username"
  placeholder="Enter your username"
  onChangeText={(text) => console.log(text)}
/>

// With validation and error state
<TextField
  label="Email"
  error={!isValidEmail ? "Please enter a valid email address" : undefined}
  keyboardType="email-address"
  required
/>

// With character limit and counter
<TextField
  label="Bio"
  placeholder="Tell us about yourself"
  multiline
  maxLength={200}
  showCharacterCount
  numberOfLines={4}
/>

// With icons
<TextField
  label="Password"
  secureTextEntry
  leadingIcon={<Icon name="lock" />}
  trailingIcon={<Icon name="eye" onPress={togglePasswordVisibility} />}
/>

// Different variants
<TextField
  label="Filled Style"
  variant="filled"
/>

<TextField
  label="Underlined Style"
  variant="underlined"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | undefined | Label text to display above or inside the input |
| `helperText` | string | undefined | Helper text displayed below the input |
| `error` | string | undefined | Error message to display (also changes the input to error state) |
| `onFocus` | function | undefined | Callback for when the input is focused |
| `onBlur` | function | undefined | Callback for when the input loses focus |
| `value` | string | undefined | Input value (controlled component) |
| `defaultValue` | string | undefined | Default value for uncontrolled components |
| `onChangeText` | function | undefined | Callback for when the input value changes |
| `variant` | 'outlined' \| 'filled' \| 'underlined' | 'outlined' | Visual variant of the text field |
| `disabled` | boolean | false | Whether the input is disabled |
| `leadingIcon` | ReactNode | undefined | Leading icon to display |
| `trailingIcon` | ReactNode | undefined | Trailing icon to display |
| `containerStyle` | StyleProp<ViewStyle> | undefined | Custom style for the container |
| `inputStyle` | StyleProp<TextStyle> | undefined | Custom style for the input |
| `labelStyle` | StyleProp<TextStyle> | undefined | Custom style for the label |
| `required` | boolean | false | Whether the input is required (adds * to label) |
| `showCharacterCount` | boolean | false | Whether to show the character count |
| `maxLength` | number | undefined | Maximum number of characters allowed |
| `testID` | string | undefined | ID for testing |
| `accessibilityLabel` | string | undefined | Accessibility label |

Additionally, the TextField component accepts all standard TextInput props from React Native.

## Visual Variants

### Outlined (Default)
- Clean, bordered look with a visible outline
- Label animates to the top of the component on focus or when containing text

### Filled
- Background color that differentiates the input from the surrounding UI
- Label animates to the top of the component on focus or when containing text
- Bottom border emphasizes the active state

### Underlined
- Minimalist design with only a bottom border
- Ideal for forms with limited space or cleaner aesthetics

## Platform-Specific Implementation Details

### Native (iOS & Android)
- Uses React Native's Animated API for smooth label transitions
- Optimized for touch interactions
- Platform-specific padding adjustments for better visual alignment

### Web
- Enhanced with web-specific hover states
- Uses CSS transitions for smooth animations
- Optimized keyboard and focus behavior
- Custom cursor handling

## Best Practices

- Always provide clear, concise labels
- Use helper text to provide additional context or instructions
- Apply error validation when appropriate, with clear error messages
- Consider the visual hierarchy when choosing between variants
- Use the same variant consistently throughout your application
- Set appropriate keyboard types for different input requirements

## Examples

### Form with Validation

```tsx
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [emailError, setEmailError] = useState('');
const [passwordError, setPasswordError] = useState('');

const validateEmail = (text) => {
  const isValid = /\S+@\S+\.\S+/.test(text);
  setEmailError(isValid ? '' : 'Please enter a valid email address');
  return isValid;
};

const validatePassword = (text) => {
  const isValid = text.length >= 8;
  setPasswordError(isValid ? '' : 'Password must be at least 8 characters');
  return isValid;
};

return (
  <View style={styles.form}>
    <TextField
      label="Email"
      value={email}
      onChangeText={(text) => {
        setEmail(text);
        validateEmail(text);
      }}
      error={emailError}
      keyboardType="email-address"
      autoCapitalize="none"
      required
    />
    
    <TextField
      label="Password"
      value={password}
      onChangeText={(text) => {
        setPassword(text);
        validatePassword(text);
      }}
      error={passwordError}
      secureTextEntry
      required
    />
    
    <Button 
      title="Submit" 
      onPress={handleSubmit} 
      disabled={!email || !password || !!emailError || !!passwordError}
    />
  </View>
);
``` 