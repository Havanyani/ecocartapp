/**
 * Router.native.tsx
 * 
 * Native-specific implementation of the Router component.
 * Uses React Navigation for native platform navigation.
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
    DarkTheme,
    DefaultTheme,
    NavigationContainer,
    NavigationState,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import type { Route, RouterProps } from './Router';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export function Router({
  routes,
  initialRouteId,
  restoreSession = true,
  onUnauthorized,
  isAuthenticated,
  theme: navigationTheme,
  animated = true,
  onNavigationStateChange,
  onReady,
  showLoadingIndicator = true,
}: RouterProps): JSX.Element {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [initialState, setInitialState] = useState<NavigationState | undefined>();
  
  // Determine if there are any tab-based routes
  const hasTabRoutes = routes.some(route => route.children && route.children.length > 0);
  
  // Set up navigation theme
  let navTheme;
  if (navigationTheme === 'light') {
    navTheme = DefaultTheme;
  } else if (navigationTheme === 'dark') {
    navTheme = DarkTheme;
  } else if (typeof navigationTheme === 'object') {
    navTheme = navigationTheme;
  } else {
    // Use app theme to determine navigation theme
    navTheme = theme.dark ? DarkTheme : DefaultTheme;
    
    // Extend the theme with app theme colors
    navTheme = {
      ...navTheme,
      colors: {
        ...navTheme.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.border,
      },
    };
  }
  
  // Restore navigation state if needed
  useEffect(() => {
    if (restoreSession) {
      // Here you would restore navigation state from storage
      // This is a simplified example
      const restoreState = async () => {
        try {
          // For a real implementation, load from AsyncStorage or similar
          // const savedState = await AsyncStorage.getItem('navigationState');
          // if (savedState) {
          //   setInitialState(JSON.parse(savedState));
          // }
          
          // Simulate a delay to show loading
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.warn('Failed to restore navigation state:', error);
        } finally {
          setLoading(false);
        }
      };
      
      restoreState();
    } else {
      setLoading(false);
    }
  }, [restoreSession]);
  
  // Custom state persistence
  const handleStateChange = (state: NavigationState | undefined) => {
    if (state) {
      // For a real implementation, save to AsyncStorage
      // AsyncStorage.setItem('navigationState', JSON.stringify(state));
      
      // Call custom handler if provided
      if (onNavigationStateChange) {
        // Get previous state (if available)
        const prevState = initialState;
        onNavigationStateChange(prevState, state);
        
        // Update stored state reference
        setInitialState(state);
      }
    }
  };
  
  // Render loading indicator if still loading
  if (loading && showLoadingIndicator) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size="large" 
          color={theme.colors.primary} 
        />
      </View>
    );
  }
  
  // Authentication guard for protected routes
  const renderRoute = (route: Route) => {
    const RouteComponent = route.component;
    
    if (route.requiresAuth && isAuthenticated && !isAuthenticated()) {
      // Handle unauthorized access
      return (
        <Stack.Screen
          key={route.id}
          name={route.id}
          options={{ title: route.title }}
        >
          {() => {
            if (onUnauthorized) onUnauthorized();
            return null;
          }}
        </Stack.Screen>
      );
    }
    
    return (
      <Stack.Screen
        key={route.id}
        name={route.id}
        options={{ 
          title: route.title,
          // Animation can be disabled per-component
          animationEnabled: animated,
        }}
      >
        {props => <RouteComponent {...props} {...route.initialParams} />}
      </Stack.Screen>
    );
  };
  
  // Render tab-based navigator if we have nested routes
  const renderTabs = () => {
    return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {routes.map(route => {
          if (!route.children || route.children.length === 0) {
            // Render single route as a tab if no children
            return (
              <Tab.Screen
                key={route.id}
                name={route.id}
                component={route.component}
                options={{
                  title: route.title,
                  tabBarIcon: ({ color, size }) => {
                    // Render icon based on the route configuration
                    if (typeof route.icon === 'string') {
                      // For string icons, you could use a common IconComponent
                      return null; // Replace with your icon component
                    } else if (route.icon) {
                      // For React node icons, just return the node
                      return route.icon;
                    }
                    return null;
                  },
                }}
                initialParams={route.initialParams}
              />
            );
          }
          
          // Create a stack navigator for each tab with children
          return (
            <Tab.Screen
              key={route.id}
              name={route.id}
              options={{
                title: route.title,
                tabBarIcon: ({ color, size }) => {
                  if (typeof route.icon === 'string') {
                    return null; // Replace with your icon component
                  } else if (route.icon) {
                    return route.icon;
                  }
                  return null;
                },
              }}
            >
              {() => (
                <Stack.Navigator>
                  {route.children.map(childRoute => renderRoute(childRoute))}
                </Stack.Navigator>
              )}
            </Tab.Screen>
          );
        })}
      </Tab.Navigator>
    );
  };
  
  // Find initial route if specified
  const initialRouteName = initialRouteId || (routes[0] && routes[0].id);
  
  return (
    <NavigationContainer
      theme={navTheme}
      initialState={initialState}
      onStateChange={handleStateChange}
      onReady={onReady}
    >
      {hasTabRoutes ? (
        renderTabs()
      ) : (
        <Stack.Navigator initialRouteName={initialRouteName}>
          {routes.map(route => renderRoute(route))}
        </Stack.Navigator>
      )}
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