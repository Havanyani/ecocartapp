/**
 * RootNavigator.tsx
 * 
 * Main navigation container for the entire app.
 * - Manages authentication state
 * - Provides deep linking capabilities
 * - Handles navigation theming
 */

import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import linking from './linking';

// Define the navigator param list
export type RootNavigatorParamList = {
  Auth: undefined;
  Main: undefined;
};

// Create stack navigator
const Stack = createNativeStackNavigator<RootNavigatorParamList>();

/**
 * The root navigation container for the entire application.
 * Handles authentication state and implements deep linking.
 */
export default function RootNavigator() {
  const { theme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const [initialURL, setInitialURL] = useState<string | null>(null);
  
  // Get initial URL when app is opened from a deep link
  useEffect(() => {
    // Handle deep linking when app is not running
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        setInitialURL(url);
        console.log('App opened with URL:', url);
      }
    };
    
    // Call when mounting
    getInitialURL();
    
    // Listen for incoming links when app is running
    const subscription = Linking.addEventListener('url', (event) => {
      const { url } = event;
      console.log('Incoming URL:', url);
      
      // Handle OAuth callbacks or other special URLs here if needed
      if (url.includes('oauth')) {
        // You might want to extract tokens or handle authentication
        console.log('OAuth callback received:', url);
      }
    });
    
    // Clean up the event listener on unmount
    return () => {
      subscription.remove();
    };
  }, []);

  // Loading screen while authentication state is initializing
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      linking={linking}
      theme={{
        dark: false, // Default to light theme
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card || theme.colors.background,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.primary,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen
            name="Main"
            component={MainNavigator}
            options={{ animationTypeForReplace: 'pop' }}
          />
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{ animationTypeForReplace: 'pop' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 