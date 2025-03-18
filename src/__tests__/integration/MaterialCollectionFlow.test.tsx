import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { MaterialsProvider } from '../../contexts/MaterialsContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { UserProvider } from '../../contexts/UserContext';
import MaterialCollectionFlow from '../../screens/materials/MaterialCollectionFlow';

// Mock the API service
jest.mock('../../services/API', () => ({
  fetchMaterials: jest.fn().mockResolvedValue([
    { id: '1', name: 'PET Bottles', category: 'Plastic', value: 10, imageUrl: 'https://example.com/pet.jpg' },
    { id: '2', name: 'HDPE Containers', category: 'Plastic', value: 8, imageUrl: 'https://example.com/hdpe.jpg' },
    { id: '3', name: 'Cardboard', category: 'Paper', value: 5, imageUrl: 'https://example.com/cardboard.jpg' }
  ]),
  scheduleCollection: jest.fn().mockResolvedValue({ success: true, id: '123' })
}));

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(({ testID, value, onChange }) => {
      return (
        <div testID={testID}>
          <button
            testID={`${testID}-confirm`}
            onPress={() => onChange({ type: 'set', nativeEvent: { timestamp: value.getTime() } })}
          >
            Confirm
          </button>
        </div>
      );
    }),
  };
});

describe('Material Collection Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('completes material selection and scheduling process', async () => {
    const { getByText, getByTestId, queryByText } = render(
      <UserProvider>
        <MaterialsProvider>
          <NotificationProvider>
            <NavigationContainer>
              <MaterialCollectionFlow />
            </NavigationContainer>
          </NotificationProvider>
        </MaterialsProvider>
      </UserProvider>
    );

    // Wait for materials to load
    await waitFor(() => {
      expect(getByText('Available Materials')).toBeTruthy();
    });

    // Select Plastic category
    fireEvent.press(getByText('Plastic'));

    // Verify plastic materials are shown
    expect(getByText('PET Bottles')).toBeTruthy();
    expect(getByText('HDPE Containers')).toBeTruthy();
    expect(queryByText('Cardboard')).toBeNull();

    // Select a material
    fireEvent.press(getByText('PET Bottles'));
    fireEvent.press(getByText('Next'));

    // Verify we're on the scheduling screen
    await waitFor(() => {
      expect(getByText('Schedule Collection')).toBeTruthy();
    });

    // Select date
    fireEvent.press(getByTestId('date-picker'));
    fireEvent.press(getByTestId('date-picker-confirm'));

    // Select time
    fireEvent.press(getByTestId('time-picker'));
    fireEvent.press(getByTestId('time-picker-confirm'));

    // Enter address
    fireEvent.changeText(getByTestId('address-input'), '123 Test St');

    // Add notes
    fireEvent.changeText(getByTestId('notes-input'), 'Please collect from front door');

    // Submit form
    fireEvent.press(getByText('Schedule Collection'));

    // Verify success message
    await waitFor(() => {
      expect(getByText('Collection Scheduled')).toBeTruthy();
    });

    // Verify API was called with correct data
    expect(require('../../services/API').scheduleCollection).toHaveBeenCalledWith(
      expect.objectContaining({
        materialId: '1',
        address: '123 Test St',
        notes: 'Please collect from front door',
      })
    );

    // Verify navigation to confirmation screen
    expect(mockNavigate).toHaveBeenCalledWith('CollectionConfirmation', { collectionId: '123' });
  });

  it('shows validation errors when form is incomplete', async () => {
    const { getByText, getByTestId, queryByText } = render(
      <UserProvider>
        <MaterialsProvider>
          <NotificationProvider>
            <NavigationContainer>
              <MaterialCollectionFlow />
            </NavigationContainer>
          </NotificationProvider>
        </MaterialsProvider>
      </UserProvider>
    );

    // Wait for materials to load
    await waitFor(() => {
      expect(getByText('Available Materials')).toBeTruthy();
    });

    // Select a material
    fireEvent.press(getByText('Plastic'));
    fireEvent.press(getByText('PET Bottles'));
    fireEvent.press(getByText('Next'));

    // Verify we're on the scheduling screen
    await waitFor(() => {
      expect(getByText('Schedule Collection')).toBeTruthy();
    });

    // Submit form without filling required fields
    fireEvent.press(getByText('Schedule Collection'));

    // Verify validation errors
    await waitFor(() => {
      expect(getByText('Date is required')).toBeTruthy();
      expect(getByText('Time is required')).toBeTruthy();
      expect(getByText('Address is required')).toBeTruthy();
    });

    // API should not be called
    expect(require('../../services/API').scheduleCollection).not.toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    require('../../services/API').scheduleCollection.mockRejectedValueOnce(
      new Error('Network error')
    );

    const { getByText, getByTestId } = render(
      <UserProvider>
        <MaterialsProvider>
          <NotificationProvider>
            <NavigationContainer>
              <MaterialCollectionFlow />
            </NavigationContainer>
          </NotificationProvider>
        </MaterialsProvider>
      </UserProvider>
    );

    // Wait for materials to load
    await waitFor(() => {
      expect(getByText('Available Materials')).toBeTruthy();
    });

    // Select a material and proceed
    fireEvent.press(getByText('Plastic'));
    fireEvent.press(getByText('PET Bottles'));
    fireEvent.press(getByText('Next'));

    // Fill out the form
    await waitFor(() => {
      expect(getByText('Schedule Collection')).toBeTruthy();
    });

    fireEvent.press(getByTestId('date-picker'));
    fireEvent.press(getByTestId('date-picker-confirm'));
    
    fireEvent.press(getByTestId('time-picker'));
    fireEvent.press(getByTestId('time-picker-confirm'));
    
    fireEvent.changeText(getByTestId('address-input'), '123 Test St');
    
    // Submit form
    fireEvent.press(getByText('Schedule Collection'));

    // Verify error message
    await waitFor(() => {
      expect(getByText('Failed to schedule collection')).toBeTruthy();
      expect(getByText('Network error')).toBeTruthy();
    });
  });
}); 