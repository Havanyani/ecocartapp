/**
 * AppNavigator.tsx
 * 
 * Main navigation container that conditionally renders authenticated or unauthenticated routes.
 */

import { useTheme } from '@/hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

// Import screens
import ARContainerScanScreen from '@/screens/ARContainerScanScreen';

// Import smart home navigator
import SmartHomeNavigator from './SmartHomeNavigator';

// Define screen components for demonstration 
// (These would be replaced with actual screens in a complete app)
const HomeScreen = () => <React.Fragment />;
const RecycleScreen = () => <React.Fragment />;
const ProfileScreen = () => <React.Fragment />;

// Define navigation types
type MainTabParamList = {
  Home: undefined;
  Recycle: undefined;
  SmartHome: undefined;
  Profile: undefined;
};

type RootStackParamList = {
  MainTabs: undefined;
  ARContainerScan: undefined;
  SmartHomeStack: undefined;
};

// Create navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab navigator component
function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Recycle" 
        component={RecycleScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="recycle" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="SmartHome" 
        component={SmartHomeNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-automation" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Root navigator
export default function AppNavigator() {
  const { theme } = useTheme();
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          cardStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ARContainerScan" 
          component={ARContainerScanScreen}
          options={{ 
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Example of how to navigate to the AR Scanner:
/*
  import { useNavigation } from '@react-navigation/native';

  // Inside your component:
  const navigation = useNavigation();
  
  // Navigate to AR Scanner
  const openARScanner = () => {
    navigation.navigate('ARContainerScan');
  };
*/
