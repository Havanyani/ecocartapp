# Component Name

## Overview
A concise (2-3 sentence) description of what this component does and its role in the application.

## Usage

```tsx
import { ComponentName } from '@/components/path/to/ComponentName';

// Basic usage
<ComponentName 
  requiredProp="value"
  optionalProp={42} 
/>

// Advanced usage with all props
<ComponentName 
  requiredProp="value"
  optionalProp={42}
  callback={(value) => console.log(value)}
  children={<SomeChild />}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `requiredProp` | `string` | Yes | - | Description of the prop |
| `optionalProp` | `number` | No | `0` | Description of the prop |
| `callback` | `(value: string) => void` | No | `undefined` | Called when some event occurs |
| `children` | `ReactNode` | No | `undefined` | Child components to render |

## Features
- **Feature 1**: Description of a key feature
- **Feature 2**: Description of another feature
- **Conditional Rendering**: Explanation of how conditional rendering works

## Styling
Describes how the component can be styled, customized, or themed.

```tsx
// Example of styling options
<ComponentName 
  style={{ margin: 10 }}
  variant="primary"
/>
```

## Best Practices
- **Do**: Use the component this way
- **Don't**: Avoid using the component this way
- **Accessibility**: Key accessibility considerations

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

## Internal Structure
Brief explanation of how the component works internally, key state variables, and lifecycle methods.

## Dependent Components
Components that this component depends on:
- `ChildComponent1`: Brief description
- `ChildComponent2`: Brief description

## Related Documentation
- [Feature Documentation](../../features/path/to/relevant-feature.md)
- [Parent Component](../parent-component.md)
- [Design System](../../design-system.md) 