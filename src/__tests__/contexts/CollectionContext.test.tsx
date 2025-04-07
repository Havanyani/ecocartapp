import { act, renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { Alert } from 'react-native';
import { CollectionProvider, useCollection } from '../../contexts/CollectionContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
}));

describe('CollectionContext', () => {
  const mockCollection = {
    id: 'test-collection-id',
    status: 'scheduled',
    materials: ['plastic', 'electronics'],
    weight: 0,
    driverId: 'test-driver-id',
    scheduledDate: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CollectionProvider>{children}</CollectionProvider>
    );

    const { result } = renderHook(() => useCollection(), { wrapper });

    expect(result.current.collections).toEqual([]);
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  it('schedules a new collection', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CollectionProvider>{children}</CollectionProvider>
    );

    const { result } = renderHook(() => useCollection(), { wrapper });

    await act(async () => {
      await result.current.scheduleCollection({
        materials: ['plastic'],
        scheduledDate: new Date().toISOString()
      });
    });

    expect(result.current.collections).toHaveLength(1);
    expect(result.current.collections[0].status).toBe('scheduled');
  });

  it('updates collection weight', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CollectionProvider>{children}</CollectionProvider>
    );

    const { result } = renderHook(() => useCollection(), { wrapper });

    // First, schedule a collection
    await act(async () => {
      await result.current.scheduleCollection({
        materials: ['plastic'],
        scheduledDate: new Date().toISOString()
      });
    });

    // Then update its weight
    await act(async () => {
      await result.current.updateCollectionWeight(result.current.collections[0].id, 10.5);
    });

    expect(result.current.collections[0].weight).toBe(10.5);
  });

  it('handles collection status updates', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CollectionProvider>{children}</CollectionProvider>
    );

    const { result } = renderHook(() => useCollection(), { wrapper });

    // First, schedule a collection
    await act(async () => {
      await result.current.scheduleCollection({
        materials: ['plastic'],
        scheduledDate: new Date().toISOString()
      });
    });

    // Then update its status
    await act(async () => {
      await result.current.updateCollectionStatus(result.current.collections[0].id, 'in_progress');
    });

    expect(result.current.collections[0].status).toBe('in_progress');
  });

  it('handles errors during collection operations', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CollectionProvider>{children}</CollectionProvider>
    );

    const { result } = renderHook(() => useCollection(), { wrapper });

    // Mock a failed operation
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      await result.current.scheduleCollection({
        materials: ['plastic'],
        scheduledDate: new Date().toISOString()
      });
    });

    expect(result.current.error).toBeTruthy();
    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      expect.any(String)
    );
  });

  it('retrieves collection by ID', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CollectionProvider>{children}</CollectionProvider>
    );

    const { result } = renderHook(() => useCollection(), { wrapper });

    // First, schedule a collection
    await act(async () => {
      await result.current.scheduleCollection({
        materials: ['plastic'],
        scheduledDate: new Date().toISOString()
      });
    });

    const collectionId = result.current.collections[0].id;
    const collection = await result.current.getCollectionById(collectionId);

    expect(collection).toBeTruthy();
    expect(collection?.id).toBe(collectionId);
  });

  it('handles driver location updates', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CollectionProvider>{children}</CollectionProvider>
    );

    const { result } = renderHook(() => useCollection(), { wrapper });

    const mockLocation = {
      latitude: 37.7749,
      longitude: -122.4194,
      timestamp: new Date().toISOString()
    };

    await act(async () => {
      await result.current.updateDriverLocation('test-driver-id', mockLocation);
    });

    const driverLocation = await result.current.getDriverLocation('test-driver-id');
    expect(driverLocation).toEqual(mockLocation);
  });
}); 