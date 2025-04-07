/**
 * MainNavigator.tsx
 * 
 * Main navigation structure for authenticated users.
 * Includes bottom tabs and nested stack navigators.
 */

import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type {
    NativeStackScreenProps
} from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';

// Import screens
import LazyAnalyticsDashboard from '@/components/LazyAnalyticsDashboard';
import LazyHomeScreen from '@/components/LazyHomeScreen';
import NotificationIcon from '@/components/ui/NotificationIcon';
import { useOfflineStorage } from '@/providers/OfflineStorageProvider';
import AIBenchmarkScreen from '@/screens/AIBenchmarkScreen';
import AIConfigScreen from '@/screens/AIConfigScreen';
import AIPerformanceMonitorScreen from '@/screens/AIPerformanceMonitorScreen';
import { EnvironmentalImpactScreen } from '@/screens/analytics/EnvironmentalImpactScreen';
import BundleOptimizationScreen from '@/screens/BundleOptimizationScreen';
import ARContainerScanScreen from '@/screens/collection/ARContainerScanScreen';
import { CollectionDetailsScreen } from '@/screens/collection/CollectionDetailsScreen';
import { CollectionsScreen } from '@/screens/collection/CollectionsScreen';
import { ScheduleCollectionScreen } from '@/screens/collection/ScheduleCollectionScreen';
import ChallengeDetailsScreen from '@/screens/community/ChallengeDetailsScreen';
import ChallengesScreen from '@/screens/community/ChallengesScreen';
import { FAQDemoScreen } from '@/screens/FAQDemoScreen';
import BarcodeScannerScreen from '@/screens/materials/BarcodeScannerScreen';
import MaterialDetailScreen from '@/screens/materials/MaterialDetailScreen';
import MaterialListScreen from '@/screens/materials/MaterialListScreen';
import ChatScreen from '@/screens/messaging/ChatScreen';
import ConversationsScreen from '@/screens/messaging/ConversationsScreen';
import NotificationListScreen from '@/screens/notifications/NotificationListScreen';
import NotificationPreferencesScreen from '@/screens/notifications/NotificationPreferencesScreen';
import AchievementsScreen from '@/screens/profile/AchievementsScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import SettingsScreen from '@/screens/profile/SettingsScreen';
import { SyncSettingsScreen } from '@/screens/settings/SyncSettingsScreen';
import SmartHomeScreen from '@/screens/SmartHomeScreen';
import TreeShakingScreen from '@/screens/TreeShakingScreen';
import OptimizedImageExample from '../screens/examples/OptimizedImageExample';

// Define navigation types
export type MainStackParamList = {
  MainTabs: undefined;
  MaterialDetail: { materialId: string; material?: any };
  Settings: undefined;
  ScheduleCollection: undefined;
  CollectionDetails: { id: string };
  Analytics: undefined;
  Achievements: undefined;
  FAQDemo: undefined;
  AIConfigScreen: undefined;
  AIPerformanceMonitorScreen: undefined;
  AIBenchmarkScreen: undefined;
  BundleOptimization: undefined;
  OptimizedImageExample: undefined;
  TreeShaking: undefined;
  SmartHome: undefined;
  BarcodeScanner: { onMaterialSelect?: (materialId: string) => void };
  ARContainerScan: { 
    materialId?: string; 
    barcode?: string; 
    onVolumeEstimated?: (volume: number) => void;
  };
  NotificationList: undefined;
  NotificationPreferences: undefined;
  SyncSettings: undefined;
  EnvironmentalImpact: undefined;
  Challenges: undefined;
  ChallengeDetails: { challengeId: string };
  Conversations: undefined;
  Chat: { conversationId: string; title: string };
  NewMessage: undefined;
  ConversationInfo: { conversationId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Materials: undefined;
  Collections: undefined;
  Community: undefined;
  Profile: undefined;
};

// Navigation prop types for each screen
export type MaterialDetailScreenProps = NativeStackScreenProps<MainStackParamList, 'MaterialDetail'>;
export type CollectionDetailsScreenProps = NativeStackScreenProps<MainStackParamList, 'CollectionDetails'>;
export type HomeScreenProps = BottomTabScreenProps<MainTabParamList, 'Home'>;
export type AnalyticsDashboardProps = NativeStackScreenProps<MainStackParamList, 'Analytics'>;
export type ChatScreenProps = NativeStackScreenProps<MainStackParamList, 'Chat'>;
export type ConversationInfoScreenProps = NativeStackScreenProps<MainStackParamList, 'ConversationInfo'>;

// Create navigators
const Stack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder for screens not yet implemented
const PlaceholderScreen = ({ route }: { route: { name: string } }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18 }}>{route.name} Screen Coming Soon</Text>
  </View>
);

// Collections Tab Stack
const CollectionsStack = () => {
  const Stack = createNativeStackNavigator();
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Collections" component={CollectionsScreen} />
      <Stack.Screen name="ScheduleCollection" component={ScheduleCollectionScreen} />
      <Stack.Screen name="CollectionDetails" component={CollectionDetailsScreen} />
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

// Community Tab Stack
const CommunityStack = () => {
  const Stack = createNativeStackNavigator();
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChallengesList" component={ChallengesScreen} />
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
      screenOptions={({ route }: { route: { name: string } }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: string = '';
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Materials') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Collections') {
            iconName = focused ? 'basket' : 'basket-outline';
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
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
        component={LazyHomeScreen} 
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
        name="Community" 
        component={CommunityStack} 
        options={{
          title: 'Community'
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
 * Function to get screen options with notification icon
 */
const getScreenOptionsWithNotification = (title: string) => {
  return {
    headerShown: true,
    title,
    headerRight: () => <NotificationIcon />,
    headerRightContainerStyle: {
      paddingRight: 16
    }
  };
};

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
        options={({ route }: { route: { params?: { material?: { name: string } } } }) => ({
          title: route.params?.material?.name || 'Material Details',
          headerBackTitle: 'Materials'
        })}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerBackTitle: 'Profile'
        }}
      />
      <Stack.Screen
        name="ScheduleCollection"
        component={ScheduleCollectionScreen}
        options={{
          title: 'Schedule Collection',
          headerBackTitle: 'Collections'
        }}
      />
      <Stack.Screen
        name="CollectionDetails"
        component={CollectionDetailsScreen}
        options={({ route }: { route: { params?: { id: string } } }) => ({
          title: 'Collection Details',
          headerBackTitle: 'Collections'
        })}
      />
      <Stack.Screen
        name="Analytics"
        component={LazyAnalyticsDashboard}
        options={getScreenOptionsWithNotification('Analytics')}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{
          title: 'Achievements',
          headerBackTitle: 'Profile'
        }}
      />
      <Stack.Screen
        name="FAQDemo"
        component={FAQDemoScreen}
        options={{
          title: 'Frequently Asked Questions',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="AIConfigScreen"
        component={AIConfigScreen}
        options={{
          title: 'AI Configuration',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="AIPerformanceMonitorScreen"
        component={AIPerformanceMonitorScreen}
        options={{
          title: 'AI Performance',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="AIBenchmarkScreen"
        component={AIBenchmarkScreen}
        options={{
          title: 'AI Benchmark',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="BundleOptimization"
        component={BundleOptimizationScreen}
        options={{
          title: 'Bundle Optimization',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="OptimizedImageExample"
        component={OptimizedImageExample}
        options={{
          title: 'Optimized Images',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="TreeShaking"
        component={TreeShakingScreen}
        options={{
          title: 'Tree Shaking Example',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="SmartHome"
        component={SmartHomeScreen}
        options={{
          title: 'Smart Home Integration',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="BarcodeScanner"
        component={BarcodeScannerScreen}
        options={{
          title: 'Scan Barcode',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="ARContainerScan"
        component={ARContainerScanScreen}
        options={{
          title: 'Container Scan',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="NotificationList"
        component={NotificationListScreen}
        options={{
          title: 'Notifications',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="NotificationPreferences"
        component={NotificationPreferencesScreen}
        options={{
          title: 'Notification Settings',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="SyncSettings"
        component={SyncSettingsScreen}
        options={{
          title: 'Synchronization Settings',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="EnvironmentalImpact"
        component={EnvironmentalImpactScreen}
        options={{
          title: 'Environmental Impact',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="Challenges"
        component={ChallengesScreen}
        options={{
          title: 'Community Challenges',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="ChallengeDetails"
        component={ChallengeDetailsScreen}
        options={{
          title: 'Challenge Details',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="Conversations"
        component={ConversationsScreen}
        options={{
          title: 'Messages',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params.title || 'Chat',
          headerBackTitle: 'Messages'
        })}
      />
      <Stack.Screen
        name="NewMessage"
        component={PlaceholderScreen}
        options={{
          title: 'New Message',
          headerBackTitle: 'Messages'
        }}
      />
      <Stack.Screen
        name="ConversationInfo"
        component={PlaceholderScreen}
        options={{
          title: 'Conversation Info',
          headerBackTitle: 'Chat'
        }}
      />
    </Stack.Navigator>
  );
} 