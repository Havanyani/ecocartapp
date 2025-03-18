/**
 * AppNavigator.tsx
 * 
 * Main navigation container that conditionally renders authenticated or unauthenticated routes.
 */

import { IconSymbol } from '@/components/ui/IconSymbol';
import { isFeatureEnabled } from '@/config/featureFlags';
import { useTheme } from '@/hooks/useTheme';
import ARContainerScannerScreen from '@/screens/ARContainerScannerScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { PaymentScreen } from '@/screens/PaymentScreen';
import { ProductListScreen } from '@/screens/ProductListScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { WasteCollectionScreen } from '@/screens/WasteCollectionScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import type { RootStackParamList } from './types';

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.text.secondary,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WasteCollection"
        component={WasteCollectionScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="recycle" size={size} color={color} />
          ),
        }}
      />
      {isFeatureEnabled('enableProductCatalog') && (
        <Tab.Screen
          name="ProductList"
          component={ProductListScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <IconSymbol name="store" size={size} color={color} />
            ),
          }}
        />
      )}
      {isFeatureEnabled('enablePayments') && (
        <Tab.Screen
          name="Payments"
          component={PaymentScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <IconSymbol name="credit-card" size={size} color={color} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ARContainerScanner"
        component={ARContainerScannerScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
