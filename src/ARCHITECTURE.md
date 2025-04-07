# EcoCart Cross-Platform Architecture

This document outlines the architecture for the EcoCart application, which targets both mobile (iOS/Android) and web platforms from a shared codebase.

## Core Principles

1. **Write Once, Render Anywhere**: Share as much code as possible between platforms
2. **Platform-Specific Adaptations**: Use platform-specific implementations when necessary
3. **Consistent User Experience**: Maintain a cohesive UX across platforms
4. **Maximize Code Reuse**: Share business logic, state management, and utilities

## Directory Structure

```
src/
├── components/
│   ├── ui/                    # UI components
│   │   ├── Button/            # Example component
│   │   │   ├── Button.tsx     # Shared interface
│   │   │   ├── Button.native.tsx  # React Native implementation
│   │   │   ├── Button.web.tsx # Web implementation
│   │   │   ├── index.ts       # Platform-specific export
│   │   │   └── README.md      # Component documentation
│   │   └── Card/              # Similar pattern for other components
│   ├── screens/               # Screen components (shared when possible)
│   └── navigation/            # Navigation components
├── hooks/                     # Custom hooks (shared)
├── contexts/                  # Context providers (shared)
├── services/                  # API services (shared)
├── utils/                     # Utility functions (shared)
├── assets/                    # Static assets
└── types/                     # TypeScript type definitions (shared)
```

## Component Pattern

Components follow a specific pattern to enable cross-platform development:

1. **Shared Interface**: Define props and types in a `.tsx` file
2. **Platform Implementations**: Implement with `.native.tsx` and `.web.tsx` files
3. **Unified Export**: Use `index.ts` to export the correct implementation
4. **Documentation**: Include a README with usage examples and props

## Extension-Based Platform Selection

We use file extensions to differentiate between platform-specific implementations:

- `.tsx` - Shared code/interfaces
- `.native.tsx` - React Native specific code
- `.web.tsx` - Web specific code

This approach lets bundlers automatically select the right implementation:
- Metro bundler prefers `.native.tsx` over `.tsx`
- Webpack prefers `.web.tsx` over `.tsx`

### How It Works

1. **Import Resolution**: When a module is imported, the bundler checks for platform-specific versions first:
   ```js
   import { Button } from './Button';
   ```

2. **Resolution Order**:
   - On Native (Metro): `Button.native.tsx` → `Button.tsx` → `Button.js`
   - On Web (Webpack): `Button.web.tsx` → `Button.tsx` → `Button.js`

3. **Export Pattern**: Components use a consistent export pattern:
   ```js
   // index.ts
   export { Button } from './Button'; // Platform-specific version will be selected
   export type { ButtonProps } from './Button'; // Types are shared
   ```

4. **Module Mocks**: Native-only modules are mocked for web using the browser field in package.json:
   ```json
   {
     "browser": {
       "react-native-maps": "./src/mocks/react-native-maps.js",
       "expo-file-system": "./src/mocks/expo-file-system.js"
     }
   }
   ```

### Implementation Workflow

When implementing cross-platform components:

1. Define the shared interface/types in a base `.tsx` file
2. Implement the native version in `.native.tsx`
3. Implement the web version in `.web.tsx`
4. Export from an `index.ts` file

### Styling Strategies

We use a combination of approaches for cross-platform styling:

1. **Shared Styles**: Common styles defined in the base component
2. **Platform-Specific Styles**: Specialized styling for each platform
3. **Utility Functions**: Helpers for common patterns:
   - `createShadow()`: Cross-platform shadows
   - `createResponsiveStyles()`: Screen-size adaptations
   - `createPlatformStyles()`: Platform-specific style sets

## Shared State Management

State management is shared across platforms:
- React Context for global state
- React Query for data fetching and caching
- Local component state with hooks

## Shared Business Logic

Business logic is implemented once and shared:
- Validation logic
- Calculations and algorithms
- Data transformation
- Service interactions

## Platform-Specific Considerations

Some areas require platform-specific implementations:

1. **Navigation**: 
   - Mobile: Expo Router or React Navigation
   - Web: Expo Router with web adaptation

2. **Storage**:
   - Mobile: AsyncStorage, Expo SecureStore
   - Web: LocalStorage, SessionStorage

3. **Authentication**:
   - Shared logic with platform-specific storage

4. **Styling**:
   - Mobile: StyleSheet
   - Web: CSS-in-JS or stylesheet

## Testing Strategy

- **Unit Tests**: Shared for business logic (Jest)
- **Component Tests**: Platform-specific (React Native Testing Library)
- **E2E Tests**: Platform-specific (Detox for mobile, Cypress for web)

## Best Practices

1. **Component Design**:
   - Define consistent interfaces in shared `.tsx` files
   - Implement platform-specific UX patterns
   - Document usage and props

2. **Code Organization**:
   - Keep related files together
   - Use clear naming conventions
   - Maintain consistent structure

3. **Performance**:
   - Share heavy computation logic
   - Optimize rendering for each platform
   - Use platform-specific optimizations

4. **Accessibility**:
   - Implement platform-specific a11y features
   - Test with screen readers on each platform

## Example Implementation

See the Button and Card components for examples of this architecture in practice:
- `src/components/ui/Button/`
- `src/components/ui/Card/`

## Conclusion

This architecture enables efficient development across platforms while maintaining platform-specific optimizations where needed. The balance of code sharing and platform adaptation allows for rapid feature development without sacrificing user experience quality. 