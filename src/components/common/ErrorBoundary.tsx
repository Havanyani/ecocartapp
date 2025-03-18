/**
 * ErrorBoundary.tsx
 * 
 * A component that catches JavaScript errors anywhere in its child component tree
 * and displays a fallback UI instead of crashing the app.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { Component, ErrorInfo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Capture error in performance monitoring
    PerformanceMonitor.captureError(error);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    const { children, fallback } = this.props;
    const { hasError, error, errorInfo } = this.state;

    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color="#FF3B30" />
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              {error?.message || 'An unexpected error has occurred.'}
            </Text>
            
            <ScrollView style={styles.detailsContainer}>
              <Text style={styles.detailsText}>
                {errorInfo?.componentStack || ''}
              </Text>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={this.resetError}
            >
              <Text style={styles.resetButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20
  },
  errorContainer: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#F2F2F7',
    borderRadius: 12
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 16
  },
  message: {
    fontSize: 16,
    color: '#3C3C43',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16
  },
  detailsContainer: {
    width: '100%',
    maxHeight: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20
  },
  detailsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#8E8E93'
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2C76E5',
    borderRadius: 8
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF'
  }
});

export default ErrorBoundary; 