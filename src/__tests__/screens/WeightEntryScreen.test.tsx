import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import { useCollection } from '../../contexts/CollectionContext';
import { WeightEntryScreen } from '../../screens/collection/WeightEntryScreen';

// Mock the CollectionContext
jest.mock('../../contexts/CollectionContext', () => ({
  useCollection: jest.fn()
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn()
};

// Mock route params
const mockRoute = {
  params: {
    collectionId: 'test-collection-id'
  }
};

describe('WeightEntryScreen', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Default mock implementation for useCollection
    (useCollection as jest.Mock).mockReturnValue({
      updateCollectionWeight: jest.fn().mockResolvedValue(true),
      getCollectionById: jest.fn().mockResolvedValue({
        id: 'test-collection-id',
        status: 'in_progress',
        materials: []
      })
    });
  });

  it('renders correctly with initial state', () => {
    const { getByText, getByTestId } = render(
      <WeightEntryScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(getByText('Enter Collection Weight')).toBeTruthy();
    expect(getByTestId('weight-input')).toBeTruthy();
    expect(getByText('Submit Weight')).toBeTruthy();
  });

  it('handles weight submission successfully', async () => {
    const mockUpdateWeight = jest.fn().mockResolvedValue(true);
    (useCollection as jest.Mock).mockReturnValue({
      updateCollectionWeight: mockUpdateWeight,
      getCollectionById: jest.fn().mockResolvedValue({
        id: 'test-collection-id',
        status: 'in_progress',
        materials: []
      })
    });

    const { getByTestId, getByText } = render(
      <WeightEntryScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Enter weight
    const weightInput = getByTestId('weight-input');
    fireEvent.changeText(weightInput, '10.5');

    // Submit weight
    const submitButton = getByText('Submit Weight');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockUpdateWeight).toHaveBeenCalledWith('test-collection-id', 10.5);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('CollectionDetails', {
        collectionId: 'test-collection-id'
      });
    });
  });

  it('handles weight submission error', async () => {
    const mockUpdateWeight = jest.fn().mockRejectedValue(new Error('Failed to update weight'));
    (useCollection as jest.Mock).mockReturnValue({
      updateCollectionWeight: mockUpdateWeight,
      getCollectionById: jest.fn().mockResolvedValue({
        id: 'test-collection-id',
        status: 'in_progress',
        materials: []
      })
    });

    const { getByTestId, getByText } = render(
      <WeightEntryScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Enter weight
    const weightInput = getByTestId('weight-input');
    fireEvent.changeText(weightInput, '10.5');

    // Submit weight
    const submitButton = getByText('Submit Weight');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to update weight. Please try again.'
      );
    });
  });

  it('validates weight input', async () => {
    const { getByTestId, getByText } = render(
      <WeightEntryScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Enter invalid weight
    const weightInput = getByTestId('weight-input');
    fireEvent.changeText(weightInput, '-1');

    // Submit weight
    const submitButton = getByText('Submit Weight');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Invalid Weight',
        'Please enter a valid weight greater than 0.'
      );
    });
  });

  it('handles back navigation', () => {
    const { getByTestId } = render(
      <WeightEntryScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
}); 