/**
 * MainNavigator.tsx
 * 
 * Main navigation structure for authenticated users.
 * Includes bottom tabs and nested stack navigators.
 */

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

// Import screens
import { useOfflineStorage } from '@/providers/OfflineStorageProvider';
import AIBenchmarkScreen from '@/screens/AIBenchmarkScreen';
import AIConfigScreen from '@/screens/AIConfigScreen';
import AIPerformanceMonitorScreen from '@/screens/AIPerformanceMonitorScreen';
import AnalyticsDashboard from '@/screens/analytics/AnalyticsDashboard';
import CollectionDetailScreen from '@/screens/collections/CollectionDetailScreen';
import CollectionListScreen from '@/screens/collections/CollectionListScreen';
import ScheduleCollectionScreen from '@/screens/collections/ScheduleCollectionScreen';
import { FAQDemoScreen } from '@/screens/FAQDemoScreen';
import HomeScreen from '@/screens/home/HomeScreen';
import MaterialDetailScreen from '@/screens/materials/MaterialDetailScreen';
import MaterialListScreen from '@/screens/materials/MaterialListScreen';
import AchievementsScreen from '@/screens/profile/AchievementsScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import SettingsScreen from '@/screens/profile/SettingsScreen';
import { Text, View } from 'react-native';

// Define navigation types
export type MainStackParamList = {
  MainTabs: undefined;
  MaterialDetail: { materialId: string; material?: any };
  Settings: undefined;
  ScheduleCollection: undefined;
  CollectionDetail: { collectionId: string };
  Analytics: undefined;
  Achievements: undefined;
  FAQDemo: undefined;
  AIConfigScreen: undefined;
  AIPerformanceMonitorScreen: undefined;
  AIBenchmarkScreen: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Materials: undefined;
  Collections: undefined;
  Profile: undefined;
};

// Create navigators
const Stack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder for screens not yet implemented
const PlaceholderScreen = ({ route }: { route: any }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18 }}>{route.name} Screen Coming Soon</Text>
  </View>
);

// Collections Tab Stack
const CollectionsStack = () => {
  const Stack = createNativeStackNavigator();
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CollectionsList" component={CollectionListScreen} />
      <Stack.Screen name="ScheduleCollection" component={ScheduleCollectionScreen} />
      <Stack.Screen name="CollectionDetail" component={CollectionDetailScreen} />
    </Stack.Navigator>
  );
};

// Materials Tab Stack
const MaterialsStack = () => {
  const Stack = createNativeStackNavigator();
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MaterialsList" component={MaterialListScreen} />
    </Stack.Navigator>
  );
};

// Profile Tab Stack
const ProfileStack = () => {
  const Stack = createNativeStackNavigator();
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="FAQDemo" component={FAQDemoScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
function MainTabNavigator() {
  const { isOnline, pendingSyncCount } = useOfflineStorage();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Materials') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Collections') {
            iconName = focused ? 'basket' : 'basket-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#34C759',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingTop: 5
        },
        headerShown: false
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          title: 'Home'
        }}
      />
      <Tab.Screen 
        name="Materials" 
        component={MaterialsStack} 
        options={{
          title: 'Materials'
        }}
      />
      <Tab.Screen 
        name="Collections" 
        component={CollectionsStack} 
        options={{
          title: 'Collections',
          tabBarBadge: !isOnline && pendingSyncCount > 0 ? pendingSyncCount : undefined
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack} 
        options={{
          title: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Main stack navigator that contains the tab navigator and modal screens
 */
export default function MainNavigator() {
  const { isStorageReady } = useOfflineStorage();

  if (!isStorageReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading storage...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen
        name="MaterialDetail"
        component={MaterialDetailScreen}
        options={{
          headerShown: true,
          title: 'Material Details',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="ScheduleCollection"
        component={ScheduleCollectionScreen}
        options={{
          headerShown: true,
          title: 'Schedule Collection',
        }}
      />
      <Stack.Screen
        name="CollectionDetail"
        component={CollectionDetailScreen}
        options={{
          headerShown: true,
          title: 'Collection Details',
        }}
      />
      <Stack.Screen
        name="Analytics"
        component={AnalyticsDashboard}
        options={{
          headerShown: true,
          title: 'Analytics',
        }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{
          headerShown: true,
          title: 'Achievements',
        }}
      />
      <Stack.Screen
        name="FAQDemo"
        component={FAQDemoScreen}
        options={{
          headerShown: true,
          title: 'FAQ',
        }}
      />
      <Stack.Screen
        name="AIConfigScreen"
        component={AIConfigScreen}
        options={{
          headerShown: false,
          title: 'AI Assistant Configuration',
        }}
      />
      <Stack.Screen
        name="AIPerformanceMonitorScreen"
        component={AIPerformanceMonitorScreen}
        options={{
          title: 'AI Performance Monitor',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AIBenchmarkScreen"
        component={AIBenchmarkScreen}
        options={{ title: 'AI Performance Benchmark', headerShown: true }}
      />
    </Stack.Navigator>
  );
} 