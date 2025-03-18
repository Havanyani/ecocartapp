# EcoCart Components

This directory contains all the React Native components used in the EcoCart application. The components are organized by their purpose and functionality.

## Directory Structure

```
components/
├── common/           # Common components used across the app
├── ui/              # Basic UI components (buttons, inputs, etc.)
├── offline/         # Components for handling offline functionality
├── performance/     # Performance-related components
└── README.md        # This file
```

## Component Categories

### Common Components
Components that are used across multiple features:
- `ErrorBoundary`: Error handling wrapper component
- `LoadingSpinner`: Loading state component
- `EmptyState`: Empty state display component

### UI Components
Basic UI building blocks:
- `OptimizedFlatList`: Performance-optimized list component
- `Button`: Custom button component
- `Input`: Form input component
- `Card`: Card container component

### Offline Components
Components for handling offline functionality:
- `OfflineAwareList`: List component with offline support
- `OfflineBanner`: Offline status indicator
- `SyncIndicator`: Data synchronization status

### Performance Components
Components for monitoring and optimizing performance:
- `PerformanceMonitor`: Performance tracking component
- `LazyLoader`: Component for lazy loading content
- `MemoryOptimizer`: Memory usage optimization wrapper

## Component Documentation

Each component should include:
1. JSDoc comments describing its purpose and usage
2. Props interface with type definitions
3. Usage examples
4. Performance considerations
5. Accessibility features

## Best Practices

1. **Component Structure**
   ```typescript
   /**
    * Component description
    * @component
    */
   export const MyComponent: React.FC<MyComponentProps> = ({
     prop1,
     prop2,
     children,
   }) => {
     // Implementation
   };
   ```

2. **Props Definition**
   ```typescript
   interface MyComponentProps {
     /** Description of prop1 */
     prop1: string;
     /** Description of prop2 */
     prop2?: number;
   }
   ```

3. **Testing**
   - Write unit tests for all components
   - Include snapshot tests
   - Test edge cases and error states

4. **Performance**
   - Use React.memo for pure components
   - Implement useMemo and useCallback where appropriate
   - Avoid unnecessary re-renders

5. **Accessibility**
   - Include ARIA labels
   - Support screen readers
   - Handle keyboard navigation

## Contributing

When adding new components:
1. Follow the established directory structure
2. Add comprehensive documentation
3. Include unit tests
4. Consider performance implications
5. Ensure accessibility compliance 