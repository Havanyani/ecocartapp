/**
 * App.tsx
 * 
 * Main application component
 */
import { AuthProvider } from '@/contexts/AuthContext';
import RootNavigator from '@/navigation/RootNavigator';
import { OfflineStorageProvider } from '@/providers/OfflineStorageProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar 
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />
        <AuthProvider>
          <OfflineStorageProvider>
            <RootNavigator />
          </OfflineStorageProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
