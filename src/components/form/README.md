# Form Components

## Overview
This directory contains form-related components used throughout the EcoCart application. These components provide consistent form functionality, validation, and styling while adhering to the app's design system.

## Components

### FormInput
Basic form input component with label and error handling.

[See detailed documentation](../ui/FormInput.README.md)

### PasswordInput
Password input with visibility toggle and password strength indicator.

[See detailed documentation](../ui/PasswordInput.README.md)

### WeightInput
Specialized numeric input for weight values with appropriate styling and keyboard type.

[See detailed documentation](../ui/WeightInput.README.md)

### SearchBar
Search input with search icon and clear button.

[See detailed documentation](../ui/SearchBar.README.md)

## Form Validation Integration
The form components are designed to work seamlessly with form validation libraries like Formik and Yup, making it easy to create validated forms with consistent UI.

## Accessibility
These components include accessibility features such as:
- Proper labeling for screen readers
- Appropriate keyboard types for different input purposes
- Clear error messaging
- Adequate touch target sizes

## Best Practices
- Use form components consistently throughout the application
- Leverage the built-in error handling for validation feedback
- Follow standard form patterns for related fields
- Group related inputs with appropriate spacing
- Use appropriate keyboard types for different input purposes

## Related Documentation
- [Form Validation Guide](../../../docs/guides/form-validation.md)
- [Accessibility Guidelines](../../../docs/design/accessibility.md)
- [UI Component Standards](../../../docs/design/ui-standards.md)
- [UI Components Overview](../ui/README.md) 