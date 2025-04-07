# Error Boundaries Documentation

This document covers the implementation of error boundaries and error handling in navigation for EcoCart using Expo Router.

## Overview

Error boundaries are React components that catch JavaScript errors anywhere in their child component tree and display a fallback UI instead of crashing the app.

## Basic Error Boundary

### 1. Navigation Error Boundary

```typescript
// components/NavigationErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class NavigationErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Navigation error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Something went wrong with navigation.</Text>
          <Button 
            title="Try Again" 
            onPress={() => this.setState({ hasError: false, error: null })} 
          />
        </View>
      );
    }

    return this.props.children;
  }
}
```

### 2. Route-Specific Error Boundary

```typescript
// components/RouteErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RouteErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Route error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Error loading this screen.</Text>
          <Button 
            title="Go Back" 
            onPress={() => this.props.router.back()} 
          />
        </View>
      );
    }

    return this.props.children;
  }
}
```

## Error Handling Patterns

### 1. Navigation Error Handler

```typescript
// hooks/useNavigationErrorHandler.ts
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export function useNavigationErrorHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleError = (error: Error) => {
      console.error('Navigation error:', error);
      // Handle specific navigation errors
      if (error.name === 'NavigationError') {
        router.replace('/error');
      }
    };

    // Add error listener
    const subscription = router.addListener('error', handleError);
    return () => subscription.remove();
  }, []);
}

// Usage in screen
export default function MyScreen() {
  useNavigationErrorHandler();
  
  return (
    <View>
      {/* Screen content */}
    </View>
  );
}
```

### 2. Route Error Handler

```typescript
// hooks/useRouteErrorHandler.ts
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

export function useRouteErrorHandler() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleError = (error: Error) => {
      console.error('Route error:', error);
      // Handle specific route errors
      if (error.name === 'RouteError') {
        router.replace('/error');
      }
    };

    // Add error listener
    const subscription = router.addListener('error', handleError);
    return () => subscription.remove();
  }, [params]);
}

// Usage in screen
export default function MaterialDetailsScreen() {
  useRouteErrorHandler();
  
  return (
    <View>
      {/* Screen content */}
    </View>
  );
}
```

## Error Recovery

### 1. Error Recovery Component

```typescript
// components/ErrorRecovery.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

interface ErrorRecoveryProps {
  error: Error;
  onRetry: () => void;
}

export function ErrorRecovery({ error, onRetry }: ErrorRecoveryProps) {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Something went wrong</Text>
      <Text>{error.message}</Text>
      <Button title="Try Again" onPress={onRetry} />
      <Button title="Go Back" onPress={() => router.back()} />
    </View>
  );
}

// Usage in error boundary
export class MyErrorBoundary extends Component {
  render() {
    if (this.state.hasError) {
      return (
        <ErrorRecovery
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }
    return this.props.children;
  }
}
```

### 2. Error Recovery Hook

```typescript
// hooks/useErrorRecovery.ts
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';

export function useErrorRecovery() {
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((error: Error) => {
    setError(error);
  }, []);

  const recover = useCallback(() => {
    setError(null);
  }, []);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    error,
    handleError,
    recover,
    goBack
  };
}

// Usage in component
export function MyComponent() {
  const { error, handleError, recover, goBack } = useErrorRecovery();

  if (error) {
    return (
      <View>
        <Text>Error: {error.message}</Text>
        <Button title="Try Again" onPress={recover} />
        <Button title="Go Back" onPress={goBack} />
      </View>
    );
  }

  return (
    <View>
      {/* Component content */}
    </View>
  );
}
```

## Best Practices

1. **Error Boundary Placement**
   - Place error boundaries at appropriate levels
   - Use multiple error boundaries for different concerns
   - Handle errors at the right level

2. **Error Handling**
   - Log errors appropriately
   - Provide meaningful error messages
   - Implement proper error recovery

3. **User Experience**
   - Show user-friendly error messages
   - Provide clear recovery options
   - Maintain navigation state

4. **Performance**
   - Handle errors efficiently
   - Implement proper cleanup
   - Avoid unnecessary re-renders

## Common Issues and Solutions

1. **Error Propagation**
   - Handle errors at the right level
   - Prevent error bubbling
   - Implement proper error boundaries

2. **State Management**
   - Handle error state properly
   - Clean up error state
   - Prevent state corruption

3. **Navigation State**
   - Preserve navigation state
   - Handle navigation errors
   - Implement proper fallbacks 