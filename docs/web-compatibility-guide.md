# Web Compatibility Guide

This guide provides instructions for ensuring components work correctly across all platforms, including web browsers.

## Shadow Styling

React Native and web browsers handle shadows differently. To ensure consistent shadows across platforms:

### 1. Use the `createShadow()` utility:

```tsx
import { createShadow } from '@/utils/styleUtils';

const styles = StyleSheet.create({
  card: {
    // Other styles...
    ...createShadow({
      offsetY: 2,
      opacity: 0.1, 
      radius: 4,
      elevation: 2
    }),
  }
});
```

### 2. For card-like components, consider using the `ShadowCard` component:

```tsx
import ShadowCard from '@/components/ui/ShadowCard';

function MyComponent() {
  return (
    <ShadowCard shadowLevel={2} borderRadius={8} padded>
      <Text>Card content</Text>
    </ShadowCard>
  );
}
```

### 3. Common shadow levels reference:

| Level | Use Case | Configuration |
|-------|----------|--------------|
| 1 | Subtle shadows (buttons, small elements) | `offsetY: 1, opacity: 0.1, radius: 2, elevation: 1` |
| 2 | Default card shadow | `offsetY: 2, opacity: 0.1, radius: 4, elevation: 2` |
| 3 | Medium elevation (dialogs, floating elements) | `offsetY: 3, opacity: 0.15, radius: 6, elevation: 3` |
| 4 | Prominent UI elements | `offsetY: 4, opacity: 0.2, radius: 8, elevation: 4` |
| 5 | High elevation (modals, popovers) | `offsetY: 5, opacity: 0.25, radius: 10, elevation: 5` |

## Native Module Mocking

When using React Native modules that aren't available in web browsers, create a web-specific mock:

### 1. Create a web-specific mock file:

For a module like `NativeModule.ts`, create `NativeModule.web.ts` that implements a similar API.

### 2. Update package.json to alias the module:

```json
"browser": {
  "./src/utils/NativeModule.ts": "./src/utils/NativeModule.web.ts"
}
```

### 3. Mock types and dependencies available in the project:

- For file system operations: Use `localStorage` (see `expo-file-system.js` mock)
- For device info: Use Web APIs like `navigator.getBattery()` where available
- For UI components: Create simplified web-compatible versions

## Platform Detection

Use platform utilities when you need platform-specific behavior:

```tsx
import { isWeb, isIOS, isAndroid } from '@/utils/platformUtils';

// Platform-specific code
if (isWeb) {
  // Web-only code
} else if (isIOS) {
  // iOS-only code
} else if (isAndroid) {
  // Android-only code
}
```

For styling, use the `createPlatformStyles()` utility:

```tsx
import { createPlatformStyles } from '@/utils/styleUtils';

const styles = createPlatformStyles({
  common: {
    container: {
      flex: 1,
    },
  },
  web: {
    button: {
      cursor: 'pointer',
    },
  },
  // iOS and Android specific styles...
});
```

## Web Performance Considerations

1. **Minimize animations**: Some React Native animations may be processor-intensive on web
2. **Optimize lists**: Use virtualized lists with fixed item heights
3. **Lazy loading**: Implement code splitting for web using dynamic imports
4. **Image optimization**: Use appropriate image formats (WebP) and sizes for web

## Testing Web Compatibility

Before submitting changes, test your components on:

1. **Desktop browsers**: Chrome, Firefox, Safari
2. **Mobile browsers**: iOS Safari, Chrome for Android
3. **Different viewport sizes**: Desktop, tablet, and mobile widths

Use the recommended web launcher to test: `npm run web-launcher` 