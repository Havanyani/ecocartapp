import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import { useCollection } from '../../contexts/CollectionContext';
import { DriverTrackingScreen } from '../../screens/collection/DriverTrackingScreen';

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

describe('DriverTrackingScreen', () => {
  const mockDriverLocation = {
    latitude: 37.7749,
    longitude: -122.4194,
    timestamp: new Date().toISOString()
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Default mock implementation for useCollection
    (useCollection as jest.Mock).mockReturnValue({
      getDriverLocation: jest.fn().mockResolvedValue(mockDriverLocation),
      getCollectionById: jest.fn().mockResolvedValue({
        id: 'test-collection-id',
        status: 'in_progress',
        driverId: 'test-driver-id'
      })
    });
  });

  it('renders correctly with initial state', () => {
    const { getByText, getByTestId } = render(
      <DriverTrackingScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(getByText('Driver Location')).toBeTruthy();
    expect(getByTestId('map-view')).toBeTruthy();
    expect(getByTestId('refresh-button')).toBeTruthy();
  });

  it('displays driver location on map', async () => {
    const { getByTestId } = render(
      <DriverTrackingScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    await waitFor(() => {
      const mapView = getByTestId('map-view');
      expect(mapView.props.initialRegion).toEqual({
        latitude: mockDriverLocation.latitude,
        longitude: mockDriverLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      });
    });
  });

  it('handles location refresh', async () => {
    const mockGetDriverLocation = jest.fn().mockResolvedValue(mockDriverLocation);
    (useCollection as jest.Mock).mockReturnValue({
      getDriverLocation: mockGetDriverLocation,
      getCollectionById: jest.fn().mockResolvedValue({
        id: 'test-collection-id',
        status: 'in_progress',
        driverId: 'test-driver-id'
      })
    });

    const { getByTestId } = render(
      <DriverTrackingScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    const refreshButton = getByTestId('refresh-button');
    fireEvent.press(refreshButton);

    await waitFor(() => {
      expect(mockGetDriverLocation).toHaveBeenCalledWith('test-driver-id');
    });
  });

  it('handles location fetch error', async () => {
    const mockGetDriverLocation = jest.fn().mockRejectedValue(new Error('Failed to fetch location'));
    (useCollection as jest.Mock).mockReturnValue({
      getDriverLocation: mockGetDriverLocation,
      getCollectionById: jest.fn().mockResolvedValue({
        id: 'test-collection-id',
        status: 'in_progress',
        driverId: 'test-driver-id'
      })
    });

    render(
      <DriverTrackingScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to fetch driver location. Please try again.'
      );
    });
  });

  it('handles back navigation', () => {
    const { getByTestId } = render(
      <DriverTrackingScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('updates map region when driver location changes', async () => {
    const newLocation = {
      latitude: 37.7833,
      longitude: -122.4167,
      timestamp: new Date().toISOString()
    };

    const mockGetDriverLocation = jest.fn()
      .mockResolvedValueOnce(mockDriverLocation)
      .mockResolvedValueOnce(newLocation);

    (useCollection as jest.Mock).mockReturnValue({
      getDriverLocation: mockGetDriverLocation,
      getCollectionById: jest.fn().mockResolvedValue({
        id: 'test-collection-id',
        status: 'in_progress',
        driverId: 'test-driver-id'
      })
    });

    const { getByTestId } = render(
      <DriverTrackingScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    const refreshButton = getByTestId('refresh-button');
    fireEvent.press(refreshButton);

    await waitFor(() => {
      const mapView = getByTestId('map-view');
      expect(mapView.props.region).toEqual({
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      });
    });
  });
}); 