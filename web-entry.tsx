import { registerRootComponent } from 'expo';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/theme/ThemeProvider';

// Import the entry point for expo-router
import 'expo-router/entry';

// Log that we're using the web-specific entry point
console.log('[DEBUG] Using web-entry.tsx for web platform');

// Create a wrapper component for web platform
function WebRoot() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <View style={{ flex: 1 }} />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

// Register the root component
registerRootComponent(WebRoot); 