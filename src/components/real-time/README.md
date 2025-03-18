# Real-Time Components

## Overview
This directory contains components that handle real-time updates and interactions in the EcoCart application. These components enable features like live tracking, status updates, and push notifications that provide users with immediate feedback on their recycling activities.

## Components

### DeliveryPersonnelTracker
Displays real-time location tracking of delivery personnel on a map, showing current position, route path, and estimated arrival time.

[See detailed documentation](../collection/DeliveryPersonnelTracker.README.md)

### NotificationManager
Provides a centralized system for managing push notifications throughout the application using React Context.

[See detailed documentation](../notifications/NotificationManager.README.md)

## Related Hooks

### useRealTimeUpdates
Core hook that manages WebSocket connections and subscriptions for real-time updates.

[See detailed documentation](../../hooks/useRealTimeUpdates.README.md)

### useBatteryOptimizedUpdates
Hook that optimizes real-time update frequency based on device battery status.

[See detailed documentation](../../hooks/useBatteryOptimizedUpdates.README.md)

## Integration Points
These components integrate with the following features:
- Delivery Personnel Tracking
- Collection Status Updates
- Real-Time Notifications
- Battery Optimization

## Best Practices
- Initialize real-time services at the app root level
- Subscribe to specific updates only when needed
- Unsubscribe from updates when components unmount
- Adjust update frequency based on battery status
- Handle connection failures gracefully
- Provide visual feedback for connection status

## Related Documentation
- [Real-Time Features Overview](../../../docs/features/real-time/overview.md)
- [Delivery Personnel Location Tracking](../../../docs/features/real-time/delivery-personnel-tracking.md)
- [Collection Status Updates](../../../docs/features/real-time/collection-status-updates.md)
- [WebSocketService Documentation](../../../docs/services/websocket-service.md)
- [NotificationService Documentation](../../../docs/services/notification-service.md) 