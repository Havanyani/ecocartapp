import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppInitialization } from './src/hooks/useAppInitialization';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/RootNavigation';
import { AppInitializer } from './src/utils/performance/AppInitializer';

// Keep the splash screen visible while we initialize the app
SplashScreen.preventAutoHideAsync().catch(() => {
  // If this fails, the app will still work but the SplashScreen will hide immediately
  console.warn('Failed to prevent auto hide of splash screen');
});

export default function App() {
  const { isInitialized, error } = useAppInitialization({
    onInitializationStart: () => {
      // Initialize performance monitoring when app starts
      const appInitializer = AppInitializer.getInstance();
      appInitializer.initialize({ 
        trackPerformance: true,
        preloadAssets: true,
        preloadFonts: true,
        manageSplashScreen: true
      });
    },
    onInitializationComplete: async () => {
      // Hide the splash screen once initialization is complete
      await SplashScreen.hideAsync().catch(err => {
        console.warn('Failed to hide splash screen', err);
      });
    }
  });

  // Handle any initialization errors
  useEffect(() => {
    if (error) {
      console.error('App initialization error:', error);
    }
  }, [error]);

  if (!isInitialized) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
        <StatusBar style="auto" />
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