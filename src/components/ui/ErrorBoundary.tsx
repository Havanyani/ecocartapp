import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onError?: (error: Error, componentStack: string) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * A component that catches JavaScript errors in its child component tree and displays a fallback UI.
 * Particularly useful for wrapping animation components that might fail in certain edge cases.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Report to application's error tracking system if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo.componentStack ?? '');
    }
  }

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, componentName } = this.props;

    if (hasError) {
      // You can render any custom fallback UI
      if (fallback) {
        return fallback;
      }

      return (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorTitle}>
            Something went wrong in {componentName || 'this component'}
          </ThemedText>
          <ThemedText style={styles.errorMessage}>
            {error?.message || 'An unexpected error occurred'}
          </ThemedText>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    padding: 16,
    backgroundColor: '#fff8f8',
    borderWidth: 1,
    borderColor: '#ffcdd2',
    borderRadius: 8,
    margin: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#333',
  },
});

export default ErrorBoundary; 