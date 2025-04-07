/**
 * CollectionNavigator.tsx
 * 
 * Navigation configuration for collection-related screens.
 */

import { AddressConfirmationScreen } from '@/screens/collection/AddressConfirmationScreen';
import { CollectionDetailsScreen } from '@/screens/collection/CollectionDetailsScreen';
import { CollectionStatusScreen } from '@/screens/collection/CollectionStatusScreen';
import { DriverTrackingScreen } from '@/screens/collection/DriverTrackingScreen';
import { MaterialSelectionScreen } from '@/screens/collection/MaterialSelectionScreen';
import { ScheduleCollectionScreen } from '@/screens/collection/ScheduleCollectionScreen';
import { WeightEntryScreen } from '@/screens/collection/WeightEntryScreen';
import { createStackNavigator } from '@react-navigation/stack';

export type CollectionStackParamList = {
  CollectionStatus: undefined;
  ScheduleCollection: undefined;
  CollectionDetails: { collectionId: string };
  DriverTracking: { collectionId: string };
  WeightEntry: { collectionId: string };
  MaterialSelection: { collectionId?: string };
  AddressConfirmation: { collectionId?: string };
};

const Stack = createStackNavigator<CollectionStackParamList>();

export function CollectionNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="CollectionStatus"
        component={CollectionStatusScreen}
        options={{ title: 'Collection Status' }}
      />
      <Stack.Screen
        name="ScheduleCollection"
        component={ScheduleCollectionScreen}
        options={{ title: 'Schedule Collection' }}
      />
      <Stack.Screen
        name="CollectionDetails"
        component={CollectionDetailsScreen}
        options={{ title: 'Collection Details' }}
      />
      <Stack.Screen
        name="DriverTracking"
        component={DriverTrackingScreen}
        options={{ title: 'Track Driver' }}
      />
      <Stack.Screen
        name="WeightEntry"
        component={WeightEntryScreen}
        options={{ title: 'Enter Weight' }}
      />
      <Stack.Screen
        name="MaterialSelection"
        component={MaterialSelectionScreen}
        options={{ title: 'Select Materials' }}
      />
      <Stack.Screen
        name="AddressConfirmation"
        component={AddressConfirmationScreen}
        options={{ title: 'Confirm Address' }}
      />
    </Stack.Navigator>
  );
} 