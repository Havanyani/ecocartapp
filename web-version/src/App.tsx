import { patchThemeSystem } from '@/utils/webFallbacks';
import { StatusBar } from 'expo-status-bar';
import React, { ReactNode, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Apply theme patching on import
patchThemeSystem();

// Import components from main app - these will now work with our theme patch
import { Button } from '@/components/ui/Button';
import { Text as ThemedText } from '@/components/ui/Text';

// Error boundary props and state interfaces
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Simple error boundary component
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { 
    hasError: false, 
    error: null 
  };
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error("Error in web app:", error, info);
  }
  
  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong!</Text>
          <Text style={styles.errorText}>
            {this.state.error?.toString() || 'Unknown error'}
          </Text>
          <Button
            onPress={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: 20 }}
          >
            Try Again
          </Button>
        </View>
      );
    }
    return this.props.children;
  }
}

// Basic web-specific component without navigation dependencies
function BasicWebComponent() {
  return (
    <View style={styles.basicContainer}>
      <ThemedText variant="h1" style={styles.heading}>EcoCart Web Version</ThemedText>
      <ThemedText variant="body" style={styles.paragraph}>
        Welcome to the EcoCart web application. This is a simplified version for testing purposes.
      </ThemedText>
      
      <View style={styles.card}>
        <ThemedText variant="h3" style={styles.cardTitle}>Eco Impact</ThemedText>
        <ThemedText variant="body" style={styles.cardText}>
          Tracking your environmental impact through sustainable shopping.
        </ThemedText>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          onPress={() => alert('Feature coming soon!')}
          style={styles.button}
          variant="primary"
        >
          Explore Features
        </Button>
        
        <Button 
          onPress={() => alert('Dashboard will be available in the next release')}
          style={styles.button}
          variant="outline"
        >
          View Dashboard
        </Button>
      </View>
    </View>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    console.log('Web App loaded');
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log('Web App loading complete');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Web App...</Text>
      </View>
    );
  }
  
  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <BasicWebComponent />
        <StatusBar style="auto" />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#2a9d8f',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffcccc',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#cc0000',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#660000',
  },
  basicContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    marginBottom: 16,
    color: '#2a9d8f',
  },
  paragraph: {
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 400,
  },
  card: {
    backgroundColor: '#f0f9f8',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  cardTitle: {
    marginBottom: 8,
    color: '#2a9d8f',
  },
  cardText: {
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  button: {
    minWidth: 150,
  }
}); 