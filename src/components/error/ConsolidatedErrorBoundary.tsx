/**
 * ConsolidatedErrorBoundary.tsx
 * 
 * A unified error boundary component that catches JavaScript errors in its child component tree,
 * reports them to monitoring services, and displays a fallback UI instead of crashing the app.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Simple logger that works without dependencies
const logger = {
  error: (...args: any[]) => {
    console.error('[ErrorBoundary]', ...args);
  }
};

// Simple performance monitor that works without dependencies
const performanceMonitor = {
  captureError: (error: Error, metadata?: any) => {
    console.error('[PerformanceMonitor] Error captured:', error.message);
    console.error('Error details:', {
      name: error.name,
      stack: error.stack,
      ...metadata
    });
  }
};

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKey?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ConsolidatedErrorBoundary component
 * 
 * A unified error boundary component for catching and handling React errors.
 * - Logs errors to console
 * - Displays a user-friendly fallback UI
 * - Provides option to retry/reset
 * - Allows custom error handlers
 */
export class ConsolidatedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    logger.error(error, errorInfo);
    
    // Track error in performance monitoring
    performanceMonitor.captureError(error, {
      componentStack: errorInfo.componentStack,
      componentName: this.props.componentName || 'UnknownComponent'
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props): void {
    // Reset error state when resetKey changes
    if (this.props.resetKey !== prevProps.resetKey && this.state.hasError) {
      this.setState({
        hasError: false,
        error: null
      });
    }
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666'
  },
  button: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default ConsolidatedErrorBoundary; 