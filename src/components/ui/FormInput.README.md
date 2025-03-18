# FormInput

## Overview
The `FormInput` component provides a standardized text input with built-in label and error handling for forms throughout the EcoCart application. It automatically applies theme styles for consistency and includes layout styling for proper spacing in forms.

## Usage

```tsx
import { FormInput } from '@/components/ui/FormInput';

// Basic usage
<FormInput
  label="Email Address"
  placeholder="Enter your email"
  keyboardType="email-address"
  autoCapitalize="none"
/>

// With error handling
<FormInput
  label="Username"
  value={username}
  onChangeText={setUsername}
  error={errors.username}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | - | The label text displayed above the input |
| `error` | `string` | No | `undefined` | Error message to display below the input |
| `rightIcon` | `React.ReactNode` | No | `undefined` | Icon or component to display on the right side of the input |
| `style` | `StyleProp<TextInputProps>` | No | `undefined` | Custom styles for the text input |
| `...TextInputProps` | `TextInputProps` | No | - | All props from React Native's TextInput are supported |

## Features
- **Integrated Labeling**: Built-in label positioned above the input
- **Error Handling**: Displays error messages with appropriate styling
- **Theme Integration**: Automatically applies theme colors for text, background, and borders
- **Right Icon Support**: Optional icon on the right side for additional functionality
- **Full TextInput Support**: Passes through all TextInput props for complete flexibility

## Styling
The component applies the following base styling:

```tsx
const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
  },
});
```

You can override or extend the input styles:

```tsx
<FormInput
  label="Custom Input"
  style={{
    height: 56,
    fontSize: 18,
    paddingHorizontal: 16,
  }}
/>
```

## Best Practices
- **Do**: Use consistent labels that clearly describe the input purpose
- **Do**: Provide specific error messages that help users correct their input
- **Do**: Set appropriate keyboard types for different input types
- **Don't**: Use placeholder text as a replacement for labels
- **Accessibility**: Ensure error messages are clear and descriptive

## Examples

### Basic Text Input
```tsx
<FormInput
  label="Full Name"
  placeholder="Enter your full name"
  autoCapitalize="words"
/>
```

### Email Input with Validation
```tsx
const [email, setEmail] = useState('');
const [error, setError] = useState('');

const validateEmail = (text) => {
  const isValid = /\S+@\S+\.\S+/.test(text);
  setEmail(text);
  setError(isValid ? '' : 'Please enter a valid email address');
};

return (
  <FormInput
    label="Email Address"
    value={email}
    onChangeText={validateEmail}
    error={error}
    placeholder="name@example.com"
    keyboardType="email-address"
    autoCapitalize="none"
    autoComplete="email"
  />
);
```

### Input with Icon
```tsx
<FormInput
  label="Search"
  placeholder="Search items..."
  rightIcon={
    <IconSymbol 
      name="magnify" 
      size={20} 
      color={theme.colors.text.secondary} 
    />
  }
/>
```

### Form with Multiple Inputs
```tsx
<View style={{ gap: 8 }}>
  <FormInput
    label="First Name"
    autoCapitalize="words"
  />
  <FormInput
    label="Last Name"
    autoCapitalize="words"
  />
  <FormInput
    label="Email"
    keyboardType="email-address"
    autoCapitalize="none"
  />
  <PasswordInput
    label="Password"
    showStrengthIndicator
  />
</View>
```

## Implementation Details
The component uses the `ThemedText` component for labels and error messages, and applies theme colors to the input:

```tsx
export function FormInput({ label, error, style, ...props }: FormInputProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText variant="body" style={styles.label}>{label}</ThemedText>
      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: theme.colors.card,
            borderColor: error ? theme.colors.error : theme.colors.border,
            color: theme.colors.text.primary,
          },
          style,
        ]}
        placeholderTextColor={theme.colors.text.secondary}
        {...props}
      />
      {error && (
        <ThemedText 
          variant="body" 
          style={[styles.error, { color: theme.colors.error }]}
        >
          {error}
        </ThemedText>
      )}
    </View>
  );
}
```

## Related Components
- `PasswordInput`: Specialized input for password entry
- `WeightInput`: Specialized input for weight values
- `SearchBar`: Specialized input for search functionality
- `ThemedText`: Used for labels and error messages

## Related Documentation
- [Form Components](../../components/form/README.md)
- [Form Validation Guide](../../../docs/guides/form-validation.md)
- [Accessibility Guidelines](../../../docs/design/accessibility.md)
- [UI Components Overview](../README.md)
- [ThemedText Component](./ThemedText.README.md) 