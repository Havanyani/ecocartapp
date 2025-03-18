# useRealTimeUpdates

## Overview
The `useRealTimeUpdates` hook provides real-time update capabilities for the EcoCart application. It manages WebSocket connections, subscriptions to collections and delivery personnel, and handles battery optimization for real-time updates. This hook is a core component for enabling features like live location tracking and status updates.

## Usage

```tsx
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';

// Basic usage in a component
function CollectionTrackingScreen({ collectionId }) {
  const { 
    isEnabled, 
    enable, 
    subscribeToCollection, 
    isConnected 
  } = useRealTimeUpdates();

  useEffect(() => {
    // Enable real-time updates if not already enabled
    if (!isEnabled) {
      enable();
    }
    
    // Subscribe to updates for this collection
    subscribeToCollection(collectionId);
  }, [collectionId, isEnabled]);

  return (
    <View>
      <Text>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</Text>
      {/* Rest of your component */}
    </View>
  );
}
```

## Return Value

The hook returns an object with the following properties and methods:

| Property/Method | Type | Description |
|-----------------|------|-------------|
| `isEnabled` | `boolean` | Whether real-time updates are enabled |
| `enable` | `() => void` | Function to enable real-time updates |
| `disable` | `() => void` | Function to disable real-time updates |
| `subscribeToCollection` | `(collectionId: string) => void` | Subscribe to updates for a specific collection |
| `unsubscribeFromCollection` | `(collectionId: string) => void` | Unsubscribe from updates for a specific collection |
| `subscribeToDeliveryPersonnel` | `(personnelId: string) => void` | Subscribe to updates for a specific delivery personnel |
| `unsubscribeFromDeliveryPersonnel` | `(personnelId: string) => void` | Unsubscribe from updates for a specific delivery personnel |
| `isConnected` | `boolean` | Whether the WebSocket connection is currently active |
| `reconnect` | `() => Promise<void>` | Function to manually reconnect if connection is lost |

## Features
- **WebSocket Connection Management**: Establishes and maintains WebSocket connections for real-time updates
- **Collection Subscriptions**: Subscribe to updates for specific collections
- **Personnel Tracking**: Subscribe to location updates for delivery personnel
- **Battery Optimization**: Integrates with battery optimization to adjust update frequency
- **Automatic Reconnection**: Handles connection drops and attempts to reconnect
- **Redux Integration**: Updates Redux state with real-time data
- **Notification Integration**: Triggers notifications for important updates

## Dependencies
- `WebSocketService`: For establishing WebSocket connections
- `NotificationService`: For sending push notifications about updates
- `useBatteryOptimizedUpdates`: For battery-efficient update scheduling
- Redux store with appropriate slices for storing real-time data

## Implementation Details

The hook handles several key operations:

1. **Connection Management**:
   ```tsx
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
   ```

2. **Message Handling**:
   ```tsx
   const handleMessage = useCallback((message: any) => {
     // Process different message types
     switch (message.type) {
       case 'collection_status_update':
         // Update collection status in Redux
         dispatch(updateCollectionStatus({
           collectionId: message.collectionId,
           status: message.status
         }));
         break;
       // Other message types...
     }
   }, [dispatch]);
   ```

## Best Practices
- **Do**: Initialize real-time updates in the main app layout for shared updates
- **Do**: Subscribe to specific collections only when viewing relevant screens
- **Do**: Unsubscribe when leaving screens to reduce unnecessary updates
- **Don't**: Enable real-time updates unconditionally without considering battery impact
- **Don't**: Subscribe to updates for collections that are not relevant to the current view

## Examples

### Basic Real-Time Enablement
```tsx
const { enable, disable, isEnabled } = useRealTimeUpdates();

// In a settings component
function RealTimeSettings() {
  return (
    <Switch
      value={isEnabled}
      onValueChange={(value) => value ? enable() : disable()}
    />
  );
}
```

### Collection Detail Screen with Real-Time Updates
```tsx
function CollectionDetailScreen({ collectionId }) {
  const { 
    subscribeToCollection, 
    unsubscribeFromCollection,
    isEnabled,
    enable
  } = useRealTimeUpdates();
  
  useEffect(() => {
    // Make sure real-time updates are enabled
    if (!isEnabled) {
      enable();
    }
    
    // Subscribe to this collection
    subscribeToCollection(collectionId);
    
    // Unsubscribe when component unmounts
    return () => {
      unsubscribeFromCollection(collectionId);
    };
  }, [collectionId]);
  
  // Rest of component
}
```

### Delivery Tracking with Personnel Subscription
```tsx
function DeliveryTracking({ deliveryPersonnelId }) {
  const { 
    subscribeToDeliveryPersonnel,
    unsubscribeFromDeliveryPersonnel
  } = useRealTimeUpdates();
  
  useEffect(() => {
    subscribeToDeliveryPersonnel(deliveryPersonnelId);
    
    return () => {
      unsubscribeFromDeliveryPersonnel(deliveryPersonnelId);
    };
  }, [deliveryPersonnelId]);
  
  // Rest of component
}
```

## Related Documentation
- [Real-Time Features Overview](../../../docs/features/real-time/overview.md)
- [Delivery Personnel Location Tracking](../../../docs/features/real-time/delivery-personnel-tracking.md)
- [Collection Status Updates](../../../docs/features/real-time/collection-status-updates.md)
- [Battery Optimized Updates Hook](./useBatteryOptimizedUpdates.README.md) 