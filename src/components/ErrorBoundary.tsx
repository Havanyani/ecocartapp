import { ErrorHandlingService } from '@services/ErrorHandlingService';
import React, { Component, ErrorInfo as ReactErrorInfo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { HapticTab } from './ui/HapticTab';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ReactErrorInfo) {
    ErrorHandlingService.logError(error, {
      componentStack: errorInfo.componentStack ?? null,
      digest: errorInfo.digest || undefined
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View 
          testID="error-boundary-container"
          style={styles.container}
          accessibilityRole="alert"
          accessibilityLabel={`Error occurred: ${this.state.error?.message}`}
        >
          <ThemedText style={styles.title}>Something went wrong</ThemedText>
          <ThemedText style={styles.message}>{this.state.error?.message}</ThemedText>
          <HapticTab 
            onPress={this.handleReset}
            accessibilityLabel="Try Again"
            accessibilityHint="Attempts to recover from the error"
          >
            <ThemedText>Try Again</ThemedText>
          </HapticTab>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    marginBottom: 16,
    textAlign: 'center',
  },
}); 