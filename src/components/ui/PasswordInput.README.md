# PasswordInput

## Overview
The `PasswordInput` component is a specialized input field for password entry that extends the base `FormInput` component with additional password-specific features such as toggling password visibility, password strength indicators, and security feedback.

## Usage

```tsx
import { PasswordInput } from '@/components/ui/PasswordInput';

// Basic usage
<PasswordInput
  label="Password"
  placeholder="Enter your password"
/>

// With strength indicator
<PasswordInput
  label="New Password"
  showStrengthIndicator
  onChangeText={setPassword}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | - | The label text displayed above the input |
| `error` | `string` | No | `undefined` | Error message to display below the input |
| `showStrengthIndicator` | `boolean` | No | `false` | Shows password strength meter below the input |
| `minLength` | `number` | No | `8` | Minimum length for password evaluation |
| `requireSpecialChar` | `boolean` | No | `true` | Require at least one special character |
| `requireNumber` | `boolean` | No | `true` | Require at least one number |
| `requireUppercase` | `boolean` | No | `true` | Require at least one uppercase letter |
| `feedbackPosition` | `'bottom' \| 'right'` | No | `'bottom'` | Position of strength feedback text |
| `...TextInputProps` | `TextInputProps` | No | - | All props from React Native's TextInput are supported |

## Features
- **Toggle Password Visibility**: Right-aligned eye icon to show/hide password text
- **Password Strength Indicator**: Visual meter showing password strength (when enabled)
- **Password Requirements Feedback**: Customizable validation rules with visual feedback
- **Theme Integration**: Automatically applies theme colors for consistent styling
- **Full TextInput Support**: Passes through all TextInput props for flexibility

## Styling
The component extends the `FormInput` component's styling with additional elements:

```tsx
const styles = StyleSheet.create({
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  strengthText: {
    fontSize: 12,
    marginTop: 4,
  },
  requirementsContainer: {
    marginTop: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    marginLeft: 6,
  },
});
```

## Best Practices
- **Do**: Clearly communicate password requirements to users
- **Do**: Provide immediate visual feedback on password strength
- **Do**: Allow users to toggle password visibility
- **Don't**: Set overly complex password requirements that frustrate users
- **Do**: Consider using biometric authentication as an alternative
- **Accessibility**: Ensure that all password requirements are clearly communicated to screen readers

## Examples

### Basic Password Input
```tsx
<PasswordInput
  label="Password"
  placeholder="Enter your password"
  secureTextEntry
/>
```

### Password with Strength Indicator
```tsx
<PasswordInput
  label="Create Password"
  placeholder="Create a strong password"
  showStrengthIndicator
  onChangeText={(text) => {
    setPassword(text);
    validatePassword(text);
  }}
/>
```

### Sign Up Form with Password Validation
```tsx
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [confirmError, setConfirmError] = useState('');

const validateConfirmPassword = (text) => {
  setConfirmPassword(text);
  setConfirmError(text !== password ? 'Passwords do not match' : '');
};

return (
  <View style={{ gap: 16 }}>
    <FormInput
      label="Email"
      keyboardType="email-address"
      autoCapitalize="none"
    />
    <PasswordInput
      label="Password"
      showStrengthIndicator
      requireSpecialChar
      requireNumber
      requireUppercase
      minLength={8}
      onChangeText={setPassword}
    />
    <PasswordInput
      label="Confirm Password"
      error={confirmError}
      onChangeText={validateConfirmPassword}
    />
  </View>
);
```

### Custom Validation Rules
```tsx
<PasswordInput
  label="New Password"
  showStrengthIndicator
  minLength={10}
  requireSpecialChar={false}
  requireNumber
  requireUppercase
  feedbackPosition="right"
/>
```

## Implementation Details
The component uses a toggle button for password visibility and calculates password strength based on the provided criteria:

```tsx
export function PasswordInput({ 
  label, 
  error, 
  showStrengthIndicator = false,
  minLength = 8,
  requireSpecialChar = true,
  requireNumber = true,
  requireUppercase = true,
  feedbackPosition = 'bottom',
  style,
  ...props 
}: PasswordInputProps) {
  const { theme } = useTheme();
  const [secure, setSecure] = useState(true);
  const [strength, setStrength] = useState(0);
  
  const calculateStrength = (text: string) => {
    if (!text) return 0;
    
    let score = 0;
    const hasMinLength = text.length >= minLength;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(text);
    const hasNumber = /\d/.test(text);
    const hasUppercase = /[A-Z]/.test(text);
    
    if (hasMinLength) score += 1;
    if (hasSpecialChar && requireSpecialChar) score += 1;
    if (hasNumber && requireNumber) score += 1;
    if (hasUppercase && requireUppercase) score += 1;
    
    // Calculate percentage based on active requirements
    let maxScore = 1; // Min length is always required
    if (requireSpecialChar) maxScore += 1;
    if (requireNumber) maxScore += 1;
    if (requireUppercase) maxScore += 1;
    
    return (score / maxScore) * 100;
  };
  
  const handleChangeText = (text: string) => {
    if (showStrengthIndicator) {
      setStrength(calculateStrength(text));
    }
    
    if (props.onChangeText) {
      props.onChangeText(text);
    }
  };
  
  const toggleSecure = () => setSecure(!secure);
  
  return (
    <FormInput
      label={label}
      error={error}
      secureTextEntry={secure}
      style={style}
      rightIcon={
        <Pressable onPress={toggleSecure}>
          <Feather 
            name={secure ? 'eye' : 'eye-off'} 
            size={18} 
            color={theme.colors.text.secondary}
          />
        </Pressable>
      }
      onChangeText={handleChangeText}
      {...props}
    />
    {/* Strength indicator implementation */}
  );
}
```

## Related Components
- `FormInput`: Base input component that this extends
- `WeightInput`: Specialized input for weight values
- `SearchBar`: Specialized input for search functionality
- `AuthScreen`: Often uses this component for login/signup

## Related Documentation
- [Form Components](../../components/form/README.md)
- [Form Validation Guide](../../../docs/guides/form-validation.md)
- [Authentication Flow](../../../docs/guides/authentication.md)
- [Security Guidelines](../../../docs/guides/security.md)
- [FormInput Component](./FormInput.README.md)
- [UI Components Overview](../README.md) 