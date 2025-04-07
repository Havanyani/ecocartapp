# EcoCart Component Documentation Guide

This guide explains how to create and maintain standardized README documentation for EcoCart components.

## Why Document Components?

Good component documentation provides several benefits:
- Helps team members understand and use components correctly
- Reduces duplication of work
- Supports onboarding of new developers
- Ensures consistent implementation of design patterns
- Makes code maintenance easier

## Component README Structure

All component README files should follow this standardized structure:

### 1. Title and Overview
```markdown
# ComponentName

## Overview
A concise (2-3 sentence) description of what this component does and its role in the application.
```

### 2. Usage Examples
```markdown
## Usage

```tsx
import { ComponentName } from '@/components/path/to/ComponentName';

// Basic usage
<ComponentName 
  requiredProp="value"
/>

// Advanced usage with all props
<ComponentName 
  requiredProp="value"
  optionalProp={42}
  callback={(value) => console.log(value)}
  children={<SomeChild />}
/>
```
```

### 3. Props Documentation
```markdown
## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `requiredProp` | `string` | Yes | - | Description of the prop |
| `optionalProp` | `number` | No | `0` | Description of the prop |
| `callback` | `(value: string) => void` | No | `undefined` | Called when some event occurs |
| `children` | `ReactNode` | No | `undefined` | Child components to render |
```

### 4. Features
```markdown
## Features
- **Feature 1**: Description of a key feature
- **Feature 2**: Description of another feature
- **Conditional Rendering**: Explanation of how conditional rendering works
```

### 5. Styling
```markdown
## Styling
Describes how the component can be styled, customized, or themed.

```tsx
// Example of styling options
<ComponentName 
  style={{ margin: 10 }}
  variant="primary"
/>
```
```

### 6. Best Practices
```markdown
## Best Practices
- **Do**: Use the component this way
- **Don't**: Avoid using the component this way
- **Accessibility**: Key accessibility considerations
```

### 7. Examples
```markdown
## Examples

### Basic Example
```tsx
<ComponentName requiredProp="Example" />
```

### With Custom Styling
```tsx
<ComponentName 
  requiredProp="Example"
  style={{ 
    backgroundColor: 'primaryColor',
    borderRadius: 8
  }} 
/>
```

### Complex Integration
```tsx
const handleCallback = (value) => {
  // Handle the callback
};

<ComponentName 
  requiredProp="Example"
  callback={handleCallback}
>
  <ChildComponent />
</ComponentName>
```
```

### 8. Implementation Details (Optional)
```markdown
## Implementation Details
Brief explanation of how the component works internally, key state variables, and lifecycle methods.
```

### 9. Related Components
```markdown
## Related Components
Components that this component depends on or that are similar:
- `ChildComponent1`: Brief description
- `ChildComponent2`: Brief description
```

### 10. Related Documentation
```markdown
## Related Documentation
- [Feature Documentation](../../features/path/to/relevant-feature.md)
- [Parent Component](../parent-component.md)
- [Design System](../../design-system.md)
```

## Creating Component Documentation

### Manual Creation

1. Create a file named `ComponentName.README.md` in the same directory as your component
2. Use the structure above to document your component
3. Be thorough yet concise in your descriptions
4. Include practical code examples
5. Document all props, including types and defaults

### Using the README Generator

We provide a script to generate README templates for components:

```bash
# Generate a template for a specific component
node scripts/generate-readme.js src/components/ui/YourComponent.tsx

# List all components without README files
node scripts/generate-readme.js

# Generate templates for all components without README files
node scripts/generate-readme.js --all
```

The generator creates a basic template that you should review and enhance with:
- More detailed feature descriptions
- Better code examples
- Improved usage instructions
- Accessibility considerations
- Related component links

## Auditing Documentation Quality

You can run our README audit tool to check the quality of component documentation:

```bash
node scripts/readme-audit.js
```

This tool generates a report showing:
- Components missing documentation
- Documentation missing required sections
- Overall documentation quality scores

## Best Practices

1. **Be specific**: Avoid vague descriptions; clearly state what the component does
2. **Include examples**: Provide multiple usage examples showing different scenarios
3. **Document all props**: Include types, whether they're required, defaults, and descriptions
4. **Keep updated**: When you change a component, update its documentation
5. **Include accessibility info**: Document how to use the component accessibly
6. **Cross-reference**: Link to related components and documentation
7. **Use code blocks**: Include properly formatted and syntax highlighted code examples

## Common Documentation Issues

- **Missing prop descriptions**: All props should have clear descriptions
- **Outdated examples**: Code examples should reflect the current API
- **Too general**: "A button component" is less helpful than "A themed button component with multiple variants and haptic feedback support"
- **Missing accessibility guidance**: Always include accessibility considerations
- **Incomplete styling documentation**: Document all styling options and customization points

## Directory Organization

Component README files should be organized as follows:

- `src/components/ui/ComponentName.tsx` - Component implementation
- `src/components/ui/ComponentName.README.md` - Component documentation
- `src/components/ui/README.md` - Category-level documentation

Category-level README files should provide an overview of all components in that category and common patterns.

## Questions or Issues

If you have questions about component documentation, please contact the documentation team or open an issue in our project management system. 