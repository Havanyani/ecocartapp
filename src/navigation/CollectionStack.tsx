/**
 * CollectionStack.tsx
 * 
 * Stack navigator for collection-related screens.
 * Handles navigation between collection listing, scheduling, and details screens.
 */

import { CollectionAnalyticsScreen } from '@/screens/collection/CollectionAnalyticsScreen';
import { CollectionDetailsScreen } from '@/screens/collection/CollectionDetailsScreen';
import { CollectionHistoryScreen } from '@/screens/collection/CollectionHistoryScreen';
import { CollectionRewardsScreen } from '@/screens/collection/CollectionRewardsScreen';
import { CollectionsScreen } from '@/screens/collection/CollectionsScreen';
import { DriverTrackingScreen } from '@/screens/collection/DriverTrackingScreen';
import { MaterialManagementScreen } from '@/screens/collection/MaterialManagementScreen';
import { ScheduleCollectionScreen } from '@/screens/collection/ScheduleCollectionScreen';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

export type CollectionStackParamList = {
  Collections: undefined;
  ScheduleCollection: undefined;
  CollectionDetails: { collectionId: string };
  CollectionHistory: undefined;
  CollectionAnalytics: undefined;
  MaterialManagement: undefined;
  CollectionRewards: undefined;
  DriverTracking: { collectionId: string };
};

const Stack = createStackNavigator<CollectionStackParamList>();

export function CollectionStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Collections"
        component={CollectionsScreen}
        options={{
          title: 'My Collections',
        }}
      />
      <Stack.Screen
        name="ScheduleCollection"
        component={ScheduleCollectionScreen}
        options={{
          title: 'Schedule Collection',
        }}
      />
      <Stack.Screen
        name="CollectionDetails"
        component={CollectionDetailsScreen}
        options={{
          title: 'Collection Details',
        }}
      />
      <Stack.Screen
        name="CollectionHistory"
        component={CollectionHistoryScreen}
        options={{
          title: 'Collection History',
        }}
      />
      <Stack.Screen
        name="CollectionAnalytics"
        component={CollectionAnalyticsScreen}
        options={{
          title: 'Collection Analytics',
        }}
      />
      <Stack.Screen
        name="MaterialManagement"
        component={MaterialManagementScreen}
        options={{
          title: 'Material Management',
        }}
      />
      <Stack.Screen
        name="CollectionRewards"
        component={CollectionRewardsScreen}
        options={{
          title: 'Collection Rewards',
        }}
      />
      <Stack.Screen
        name="DriverTracking"
        component={DriverTrackingScreen}
        options={{
          title: 'Driver Tracking',
        }}
      />
    </Stack.Navigator>
  );
} 