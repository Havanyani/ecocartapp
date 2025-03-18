import { notificationService } from '@/services/NotificationService';
import { WebSocketService } from '@/services/WebSocketService';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    selectRealtimeEnabled,
    setDeliveryPersonnel,
    setRealtimeEnabled,
    updateCollectionLocation,
    updateCollectionStatus,
    updateDeliveryPersonnelLocation,
    updateDeliveryPersonnelStatus
} from '@/store/slices/collectionSlice';
import { CollectionStatus } from '@/types/Collection';
import { useCallback, useEffect, useState } from 'react';
import { useBatteryOptimizedUpdates } from './useBatteryOptimizedUpdates';

// Storage key for real-time update settings
const REALTIME_SETTINGS_KEY = 'ecocart_realtime_settings';

interface UseRealTimeUpdatesReturn {
  isEnabled: boolean;
  enable: () => void;
  disable: () => void;
  subscribeToCollection: (collectionId: string) => void;
  unsubscribeFromCollection: (collectionId: string) => void;
  subscribeToDeliveryPersonnel: (personnelId: string) => void;
  unsubscribeFromDeliveryPersonnel: (personnelId: string) => void;
  isConnected: boolean;
  reconnect: () => Promise<void>;
}

export function useRealTimeUpdates(): UseRealTimeUpdatesReturn {
  const dispatch = useAppDispatch();
  const isEnabled = useAppSelector(selectRealtimeEnabled);
  const [isConnected, setIsConnected] = useState(false);
  const [subscribedCollections, setSubscribedCollections] = useState<string[]>([]);
  const [subscribedPersonnel, setSubscribedPersonnel] = useState<string[]>([]);
  const { updateInterval, isEnabled: isBatteryOptimizationEnabled } = useBatteryOptimizedUpdates();

  // Initialize real-time updates
  useEffect(() => {
    if (isEnabled) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isEnabled]);

  // Connect to WebSocket
  const connectWebSocket = useCallback(async () => {
    try {
      // Initialize WebSocket connection
      WebSocketService.initialize('user123'); // In a real app, use actual userId
      
      // Set up event handlers for collection updates
      WebSocketService.subscribe('collection_update', (data) => {
        if (data.collectionId && data.status) {
          dispatch(updateCollectionStatus({
            collectionId: data.collectionId,
            status: data.status as CollectionStatus
          }));

          // Show notification if needed
          notificationService.sendCollectionStatusChangeNotification(
            data.collectionId,
            data.status as CollectionStatus,
            data.address || 'your address'
          );
        }
      });
      
      // Set up event handlers for location updates
      WebSocketService.subscribe('location_update', (data) => {
        if (data.collectionId && data.location) {
          dispatch(updateCollectionLocation({
            collectionId: data.collectionId,
            location: data.location
          }));
        }
        
        if (data.personnelId && data.location) {
          dispatch(updateDeliveryPersonnelLocation({
            collectionId: data.collectionId,
            personnelId: data.personnelId,
            location: data.location
          }));
          
          // Show notification for personnel location update if needed
          notificationService.sendPersonnelLocationUpdate(
            data.personnelId,
            data.location
          );
        }
      });
      
      // Set up event handlers for personnel updates
      WebSocketService.subscribe('personnel_update', (data) => {
        if (data.collectionId && data.personnel) {
          dispatch(setDeliveryPersonnel({
            collectionId: data.collectionId,
            personnel: data.personnel
          }));
        }
        
        if (data.collectionId && data.personnelId && data.status) {
          dispatch(updateDeliveryPersonnelStatus({
            collectionId: data.collectionId,
            personnelId: data.personnelId,
            status: data.status
          }));
        }
      });
      
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setIsConnected(false);
    }
  }, [dispatch]);

  // Disconnect from WebSocket
  const disconnectWebSocket = useCallback(() => {
    WebSocketService.disconnect();
    setIsConnected(false);
    setSubscribedCollections([]);
    setSubscribedPersonnel([]);
  }, []);

  // Enable real-time updates
  const enable = useCallback(() => {
    dispatch(setRealtimeEnabled(true));
    // Enable notification preferences
    notificationService.updatePreferences({
      deliveryStatusUpdates: true,
      locationUpdates: true,
      collectionUpdates: true,
      collectionStatusChanges: true,
      personnelLocationUpdates: true
    }).catch(error => {
      console.error('Failed to update notification preferences:', error);
    });
  }, [dispatch]);

  // Disable real-time updates
  const disable = useCallback(() => {
    dispatch(setRealtimeEnabled(false));
    // Disable notification preferences (optional, user might still want notifications)
    notificationService.updatePreferences({
      locationUpdates: false,
      personnelLocationUpdates: false
    }).catch(error => {
      console.error('Failed to update notification preferences:', error);
    });
  }, [dispatch]);

  // Subscribe to updates for a specific collection
  const subscribeToCollection = useCallback((collectionId: string) => {
    if (!isConnected) {
      return;
    }
    
    if (!subscribedCollections.includes(collectionId)) {
      WebSocketService.sendMessage('subscribe_collection', {
        collectionId
      }).catch(error => {
        console.error(`Failed to subscribe to collection ${collectionId}:`, error);
      });
      
      setSubscribedCollections(prev => [...prev, collectionId]);
    }
  }, [isConnected, subscribedCollections]);

  // Unsubscribe from updates for a specific collection
  const unsubscribeFromCollection = useCallback((collectionId: string) => {
    if (!isConnected) {
      return;
    }
    
    if (subscribedCollections.includes(collectionId)) {
      WebSocketService.sendMessage('unsubscribe_collection', {
        collectionId
      }).catch(error => {
        console.error(`Failed to unsubscribe from collection ${collectionId}:`, error);
      });
      
      setSubscribedCollections(prev => prev.filter(id => id !== collectionId));
    }
  }, [isConnected, subscribedCollections]);

  // Subscribe to updates for a specific delivery personnel
  const subscribeToDeliveryPersonnel = useCallback((personnelId: string) => {
    if (!isConnected) {
      return;
    }
    
    if (!subscribedPersonnel.includes(personnelId)) {
      WebSocketService.sendMessage('subscribe_personnel', {
        personnelId
      }).catch(error => {
        console.error(`Failed to subscribe to personnel ${personnelId}:`, error);
      });
      
      setSubscribedPersonnel(prev => [...prev, personnelId]);
    }
  }, [isConnected, subscribedPersonnel]);

  // Unsubscribe from updates for a specific delivery personnel
  const unsubscribeFromDeliveryPersonnel = useCallback((personnelId: string) => {
    if (!isConnected) {
      return;
    }
    
    if (subscribedPersonnel.includes(personnelId)) {
      WebSocketService.sendMessage('unsubscribe_personnel', {
        personnelId
      }).catch(error => {
        console.error(`Failed to unsubscribe from personnel ${personnelId}:`, error);
      });
      
      setSubscribedPersonnel(prev => prev.filter(id => id !== personnelId));
    }
  }, [isConnected, subscribedPersonnel]);

  // Reconnect to WebSocket
  const reconnect = useCallback(async () => {
    if (!isEnabled) {
      return;
    }
    
    await disconnectWebSocket();
    await connectWebSocket();
    
    // Resubscribe to collections
    subscribedCollections.forEach(collectionId => {
      WebSocketService.sendMessage('subscribe_collection', {
        collectionId
      }).catch(error => {
        console.error(`Failed to resubscribe to collection ${collectionId}:`, error);
      });
    });
    
    // Resubscribe to personnel
    subscribedPersonnel.forEach(personnelId => {
      WebSocketService.sendMessage('subscribe_personnel', {
        personnelId
      }).catch(error => {
        console.error(`Failed to resubscribe to personnel ${personnelId}:`, error);
      });
    });
  }, [isEnabled, connectWebSocket, disconnectWebSocket, subscribedCollections, subscribedPersonnel]);

  return {
    isEnabled,
    enable,
    disable,
    subscribeToCollection,
    unsubscribeFromCollection,
    subscribeToDeliveryPersonnel,
    unsubscribeFromDeliveryPersonnel,
    isConnected,
    reconnect
  };
} 