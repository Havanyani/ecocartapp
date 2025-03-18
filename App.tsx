import { ThemeProvider } from '@/hooks/useTheme';
import MainNavigator from '@/navigation/MainNavigator';
import LoginScreen from '@/screens/auth/LoginScreen';
import SplashScreen from '@/screens/SplashScreen';
import initializePerformanceMonitoring from '@/utils/performance/initializePerformanceMonitoring';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Create the root stack navigator
const Stack = createStackNavigator();

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function prepare() {
      try {
        // Initialize performance monitoring
        await initializePerformanceMonitoring();
        
        // Simulate loading resources and checking authentication
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demo purposes, automatically authenticate
        setIsAuthenticated(true);
        setIsInitialized(true);
      } catch (e) {
        console.warn('Initialization error:', e);
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    }
    
    prepare();
  }, []);
  
  if (isLoading) {
    // Show splash screen while loading
    return <SplashScreen />;
  }
  
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator 
            screenOptions={{ 
              headerShown: false,
              animationEnabled: true,
            }}
          >
            {!isAuthenticated ? (
              // Auth screens
              <Stack.Screen name="Login" component={LoginScreen} />
            ) : (
              // Main app screens
              <Stack.Screen name="Main" component={MainNavigator} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
} 