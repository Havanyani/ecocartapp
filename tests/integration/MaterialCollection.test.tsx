import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { CollectionProvider } from '../../src/contexts/CollectionContext';
import { MaterialsProvider } from '../../src/contexts/MaterialsContext';
import { MaterialCollectionFlow } from '../../src/screens/materials/MaterialCollectionFlow';

// Mock API services
jest.mock('../../src/services/api/materials', () => ({
  getMaterialsList: jest.fn().mockResolvedValue([
    { id: 1, name: 'PET Bottles', category: 'Plastic', value: 10, image: 'plastic-bottle.png' },
    { id: 2, name: 'Cardboard', category: 'Paper', value: 5, image: 'cardboard.png' },
    { id: 3, name: 'Glass Bottles', category: 'Glass', value: 8, image: 'glass-bottle.png' }
  ]),
}));

jest.mock('../../src/services/api/collection', () => ({
  scheduleCollection: jest.fn().mockResolvedValue({ success: true, id: 123 }),
  getAvailableSlots: jest.fn().mockResolvedValue([
    { date: '2023-04-15', slots: ['10:00', '13:00', '16:00'] },
    { date: '2023-04-16', slots: ['09:00', '14:00', '17:00'] }
  ]),
}));

// Mock navigation
const Stack = createStackNavigator();
const MockedNavigator = ({ component, params = {} }) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen
        name="MaterialCollectionFlow"
        component={component}
        initialParams={params}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Material Collection Flow Integration', () => {
  it('completes material selection and scheduling process', async () => {
    const { getByText, getByTestId, queryByText } = render(
      <AuthProvider>
        <MaterialsProvider>
          <CollectionProvider>
            <MockedNavigator component={MaterialCollectionFlow} />
          </CollectionProvider>
        </MaterialsProvider>
      </AuthProvider>
    );

    // Wait for materials to load
    await waitFor(() => {
      expect(getByText('PET Bottles')).toBeTruthy();
    });
    
    // Step 1: Select material type
    fireEvent.press(getByText('PET Bottles'));
    fireEvent.press(getByText('Next'));
    
    // Wait for quantity screen to appear
    await waitFor(() => {
      expect(getByText('Select Quantity')).toBeTruthy();
    });
    
    // Step 2: Set quantity
    fireEvent.press(getByTestId('quantity-plus-button'));
    fireEvent.press(getByTestId('quantity-plus-button'));
    // Should now have 3 items
    expect(getByTestId('quantity-value').props.children).toBe('3');
    fireEvent.press(getByText('Next'));
    
    // Wait for date selection screen
    await waitFor(() => {
      expect(getByText('Select Collection Date')).toBeTruthy();
    });
    
    // Step 3: Select date and time
    fireEvent.press(getByText('2023-04-15'));
    fireEvent.press(getByText('13:00'));
    fireEvent.press(getByText('Next'));
    
    // Wait for location screen
    await waitFor(() => {
      expect(getByText('Collection Location')).toBeTruthy();
    });
    
    // Step 4: Confirm location (use default)
    fireEvent.press(getByText('Use Current Location'));
    fireEvent.press(getByText('Next'));
    
    // Wait for review screen
    await waitFor(() => {
      expect(getByText('Review Collection Details')).toBeTruthy();
    });
    
    // Step 5: Review details
    expect(getByText('PET Bottles')).toBeTruthy();
    expect(getByText('Quantity: 3')).toBeTruthy();
    expect(getByText('April 15, 2023 at 13:00')).toBeTruthy();
    
    // Confirm collection
    fireEvent.press(getByText('Confirm Collection'));
    
    // Wait for success screen
    await waitFor(() => {
      expect(getByText('Collection Scheduled!')).toBeTruthy();
      expect(getByText('Your collection has been scheduled successfully')).toBeTruthy();
      expect(getByText('Confirmation #123')).toBeTruthy();
    });
    
    // Return to home
    fireEvent.press(getByText('Return to Home'));
    
    // Should have navigated away
    await waitFor(() => {
      expect(queryByText('Collection Scheduled!')).toBeNull();
    });
  });

  it('handles error during scheduling', async () => {
    // Override the mock to simulate an error
    const collectionApi = require('../../src/services/api/collection');
    const originalSchedule = collectionApi.scheduleCollection;
    collectionApi.scheduleCollection = jest.fn().mockRejectedValue(
      new Error('Network error')
    );
    
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <MaterialsProvider>
          <CollectionProvider>
            <MockedNavigator component={MaterialCollectionFlow} />
          </CollectionProvider>
        </MaterialsProvider>
      </AuthProvider>
    );

    // Wait for materials to load
    await waitFor(() => {
      expect(getByText('PET Bottles')).toBeTruthy();
    });
    
    // Complete all steps quickly
    fireEvent.press(getByText('PET Bottles'));
    fireEvent.press(getByText('Next'));
    
    await waitFor(() => {
      expect(getByText('Select Quantity')).toBeTruthy();
    });
    
    fireEvent.press(getByTestId('quantity-plus-button'));
    fireEvent.press(getByText('Next'));
    
    await waitFor(() => {
      expect(getByText('Select Collection Date')).toBeTruthy();
    });
    
    fireEvent.press(getByText('2023-04-15'));
    fireEvent.press(getByText('13:00'));
    fireEvent.press(getByText('Next'));
    
    await waitFor(() => {
      expect(getByText('Collection Location')).toBeTruthy();
    });
    
    fireEvent.press(getByText('Use Current Location'));
    fireEvent.press(getByText('Next'));
    
    await waitFor(() => {
      expect(getByText('Review Collection Details')).toBeTruthy();
    });
    
    // Confirm collection
    fireEvent.press(getByText('Confirm Collection'));
    
    // Should show error message
    await waitFor(() => {
      expect(getByText('Something went wrong')).toBeTruthy();
      expect(getByText('Network error')).toBeTruthy();
    });
    
    // Try again button should be visible
    expect(getByText('Try Again')).toBeTruthy();
    
    // Restore original mock
    collectionApi.scheduleCollection = originalSchedule;
  });
}); 