import { notificationService } from '@/services/NotificationService';
import { WebSocketService } from '@/services/WebSocketService';
import { updateDeliveryPersonnelLocation } from '@/store/slices/collectionSlice';
import { act, renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { useRealTimeUpdates } from '../useRealTimeUpdates';

// Mock dependencies
jest.mock('@/services/WebSocketService', () => ({
  WebSocketService: {
    getInstance: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    isConnected: jest.fn(),
  },
}));

jest.mock('@/services/NotificationService', () => ({
  notificationService: {
    scheduleNotification: jest.fn(),
  },
}));

jest.mock('@/store/slices/collectionSlice', () => ({
  setDeliveryPersonnel: jest.fn(() => ({ type: 'SET_DELIVERY_PERSONNEL' })),
  updateDeliveryPersonnelLocation: jest.fn(() => ({ type: 'UPDATE_DELIVERY_PERSONNEL_LOCATION' })),
  updateDeliveryPersonnelStatus: jest.fn(() => ({ type: 'UPDATE_DELIVERY_PERSONNEL_STATUS' })),
  setRealtimeEnabled: jest.fn(() => ({ type: 'SET_REALTIME_ENABLED' })),
}));

// Create mock store
const mockStore = configureMockStore([thunk]);

describe('useRealTimeUpdates', () => {
  let store: any;
  let mockWebSocketInstance: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock WebSocket instance
    mockWebSocketInstance = {
      connect: jest.fn(() => Promise.resolve()),
      disconnect: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      isConnected: jest.fn(() => true),
    };

    (WebSocketService.getInstance as jest.Mock).mockReturnValue(mockWebSocketInstance);

    // Initialize mock store
    store = mockStore({
      collections: {
        realtimeEnabled: false,
        deliveryPersonnel: [],
      },
    });
  });

  it('should initialize with correct default values', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useRealTimeUpdates(), { wrapper });

    expect(result.current.isEnabled).toBe(false);
    expect(result.current.isConnected).toBe(false);
    expect(typeof result.current.enableRealTimeUpdates).toBe('function');
    expect(typeof result.current.disableRealTimeUpdates).toBe('function');
    expect(typeof result.current.subscribeToCollection).toBe('function');
    expect(typeof result.current.subscribeToPersonnel).toBe('function');
  });

  it('should enable real-time updates', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useRealTimeUpdates(), { wrapper });

    await act(async () => {
      await result.current.enableRealTimeUpdates();
    });

    expect(mockWebSocketInstance.connect).toHaveBeenCalled();
    expect(store.getActions()).toContainEqual({ type: 'SET_REALTIME_ENABLED' });
  });

  it('should disable real-time updates', async () => {
    store = mockStore({
      collections: {
        realtimeEnabled: true,
        deliveryPersonnel: [],
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useRealTimeUpdates(), { wrapper });

    await act(async () => {
      result.current.disableRealTimeUpdates();
    });

    expect(mockWebSocketInstance.disconnect).toHaveBeenCalled();
    expect(store.getActions()).toContainEqual({ type: 'SET_REALTIME_ENABLED' });
  });

  it('should subscribe to collection updates', async () => {
    store = mockStore({
      collections: {
        realtimeEnabled: true,
        deliveryPersonnel: [],
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useRealTimeUpdates(), { wrapper });

    const collectionId = 'test-collection-id';

    await act(async () => {
      await result.current.subscribeToCollection(collectionId);
    });

    expect(mockWebSocketInstance.subscribe).toHaveBeenCalledWith(
      `collection:${collectionId}`,
      expect.any(Function)
    );
  });

  it('should subscribe to personnel updates', async () => {
    store = mockStore({
      collections: {
        realtimeEnabled: true,
        deliveryPersonnel: [],
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useRealTimeUpdates(), { wrapper });

    const personnelId = 'test-personnel-id';

    await act(async () => {
      await result.current.subscribeToPersonnel(personnelId);
    });

    expect(mockWebSocketInstance.subscribe).toHaveBeenCalledWith(
      `personnel:${personnelId}`,
      expect.any(Function)
    );
  });

  it('should handle collection update events', async () => {
    store = mockStore({
      collections: {
        realtimeEnabled: true,
        deliveryPersonnel: [],
      },
    });

    // Setup mock subscription handler
    let collectionUpdateHandler: Function;
    mockWebSocketInstance.subscribe.mockImplementation((channel: string, handler: Function) => {
      if (channel.startsWith('collection:')) {
        collectionUpdateHandler = handler;
      }
      return Promise.resolve();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useRealTimeUpdates(), { wrapper });

    const collectionId = 'test-collection-id';

    await act(async () => {
      await result.current.subscribeToCollection(collectionId);
    });

    // Simulate collection update event
    await act(async () => {
      collectionUpdateHandler({
        type: 'status_update',
        data: {
          status: 'in_progress',
          timestamp: new Date().toISOString(),
        },
      });
    });

    // Verify notification was scheduled
    expect(notificationService.scheduleNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.any(String),
        body: expect.any(String),
      })
    );
  });

  it('should handle personnel location update events', async () => {
    store = mockStore({
      collections: {
        realtimeEnabled: true,
        deliveryPersonnel: [
          { id: 'test-personnel-id', name: 'Test Personnel', location: null },
        ],
      },
    });

    // Setup mock subscription handler
    let personnelUpdateHandler: Function;
    mockWebSocketInstance.subscribe.mockImplementation((channel: string, handler: Function) => {
      if (channel.startsWith('personnel:')) {
        personnelUpdateHandler = handler;
      }
      return Promise.resolve();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useRealTimeUpdates(), { wrapper });

    const personnelId = 'test-personnel-id';

    await act(async () => {
      await result.current.subscribeToPersonnel(personnelId);
    });

    // Simulate personnel location update event
    const newLocation = { latitude: 42.123, longitude: -71.456 };
    
    await act(async () => {
      personnelUpdateHandler({
        type: 'location_update',
        data: {
          location: newLocation,
          timestamp: new Date().toISOString(),
        },
      });
    });

    // Verify updateDeliveryPersonnelLocation was dispatched
    expect(updateDeliveryPersonnelLocation).toHaveBeenCalledWith(
      personnelId,
      expect.objectContaining(newLocation)
    );
  });

  it('should clean up WebSocket subscriptions on unmount', async () => {
    store = mockStore({
      collections: {
        realtimeEnabled: true,
        deliveryPersonnel: [],
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result, unmount } = renderHook(() => useRealTimeUpdates(), { wrapper });

    const collectionId = 'test-collection-id';
    const personnelId = 'test-personnel-id';

    await act(async () => {
      await result.current.subscribeToCollection(collectionId);
      await result.current.subscribeToPersonnel(personnelId);
    });

    expect(mockWebSocketInstance.subscribe).toHaveBeenCalledTimes(2);

    // Unmount hook
    unmount();

    // Verify unsubscriptions occurred
    expect(mockWebSocketInstance.unsubscribe).toHaveBeenCalledWith(`collection:${collectionId}`);
    expect(mockWebSocketInstance.unsubscribe).toHaveBeenCalledWith(`personnel:${personnelId}`);
  });
}); 