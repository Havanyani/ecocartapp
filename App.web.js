import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppInitialization } from './src/hooks/useAppInitialization';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/RootNavigation';
import { WebPerformanceService } from './src/services/WebPerformanceService.web';
import { AppInitializer } from './src/utils/performance/AppInitializer';

// Register the navigation service with the performance monitoring system
WebPerformanceService.registerNavigationContainer(navigationRef);

export default function App() {
  const { isInitialized, error } = useAppInitialization({
    onInitializationStart: () => {
      // Initialize performance monitoring when app starts
      const appInitializer = AppInitializer.getInstance();
      appInitializer.initialize({ 
        trackPerformance: true,
        preloadAssets: true,
        preloadFonts: true,
        registerServiceWorker: true,
        criticalCSS: true,
        trackWebVitals: true
      });

      // Start tracking navigation performance
      WebPerformanceService.trackNavigationPerformance();
    }
  });

  // Handle any initialization errors
  useEffect(() => {
    if (error) {
      console.error('App initialization error:', error);
      
      // Still track the error in the performance monitoring system
      WebPerformanceService.recordError(error);
    }
  }, [error]);

  if (!isInitialized) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
}); 