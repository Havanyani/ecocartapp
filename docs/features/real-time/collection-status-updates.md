# Collection Status Updates

## Overview
The Collection Status Updates feature provides real-time notifications and status tracking for recycling collections. It enables users to monitor the progress of their scheduled collections from initial scheduling through pickup completion, enhancing transparency and allowing users to plan accordingly.

## User-Facing Functionality
- **Status Timeline**: Visual representation of collection progress through various stages
- **Push Notifications**: Automatic alerts for status changes (scheduled, en route, nearby, completed)
- **Estimated Collection Times**: Dynamic ETA updates based on collection personnel location and schedule
- **Collection Details**: Comprehensive information about scheduled collections including items, weight, and personnel
- **History View**: Log of past collections with status progression timestamps

## Technical Implementation

### Architecture
- **Design Pattern(s)**: Observer Pattern for status updates, State Pattern for collection status management
- **Key Components**: 
  - `CollectionStatusService`: Manages WebSocket connections for real-time updates
  - `CollectionTimeline`: Component for visualizing collection status
  - `useCollectionStatus`: Custom hook for subscribing to status updates
- **Dependencies**: 
  - WebSocket service for real-time updates
  - Notification service for push notifications
  - Location tracking service for ETA calculations

### Code Structure
```typescript
// Collection status types
enum CollectionStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  EN_ROUTE = 'en_route',
  NEARBY = 'nearby',
  AT_LOCATION = 'at_location',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled'
}

// Status transition model
interface StatusTransition {
  from: CollectionStatus;
  to: CollectionStatus;
  timestamp: number;
  metadata?: {
    reason?: string;
    personnelId?: string;
    estimatedArrival?: number;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
}

// Example subscription to collection status updates
function subscribeToCollectionUpdates(collectionId: string): () => void {
  const wsConnection = WebSocketService.getInstance();
  
  const subscription = wsConnection.subscribe(
    `collections/${collectionId}/status`,
    (statusUpdate: StatusTransition) => {
      // Update Redux store with new status
      dispatch(updateCollectionStatus(collectionId, statusUpdate));
      
      // Trigger notification if appropriate
      if (shouldNotifyOnStatus(statusUpdate.to)) {
        notificationService.sendStatusNotification(collectionId, statusUpdate);
      }
      
      // Update ETA if status is en_route or nearby
      if (statusUpdate.to === CollectionStatus.EN_ROUTE || 
          statusUpdate.to === CollectionStatus.NEARBY) {
        updateCollectionEta(collectionId, statusUpdate.metadata?.estimatedArrival);
      }
    }
  );
  
  // Return unsubscribe function
  return () => wsConnection.unsubscribe(subscription);
}
```

### Key Files
- `src/components/collections/CollectionTimeline.tsx`: Timeline visualization of collection status
- `src/hooks/useCollectionStatus.ts`: Hook for subscribing to status updates
- `src/services/CollectionStatusService.ts`: Service for managing collection status
- `src/utils/collectionUtils.ts`: Utilities for handling collection status logic

## Integration Points
- **Related Features**: 
  - Delivery personnel location tracking
  - Notification system
  - Scheduling system
- **API Endpoints**: 
  - WebSocket endpoint: `wss://api.ecocart.com/ws/collections`
  - REST endpoints: 
    - `GET /api/collections/{id}/status` (current status)
    - `GET /api/collections/{id}/history` (status history)
- **State Management**: 
  - Redux slice for collection status
  - Local storage for status history when offline

## Performance Considerations
- **Optimization Techniques**: 
  - Batched status updates to reduce WebSocket traffic
  - Status change throttling (minimum 5-second intervals)
  - Background update suspension for non-critical status changes
- **Potential Bottlenecks**: 
  - WebSocket reconnection during poor connectivity
  - Multiple simultaneous collection updates
- **Battery/Resource Impact**: 
  - Reduced update frequency when battery is low
  - Variable polling intervals based on collection proximity

## Testing Strategy
- **Unit Tests**: 
  - Status transition validation
  - Notification trigger logic
  - ETA calculation accuracy
- **Integration Tests**: 
  - Status flow through the system
  - UI updates from WebSocket events
  - Offline status handling and recovery
- **Mock Data**: 
  - Simulated collection status sequences
  - Various timing scenarios
  - Edge cases (cancellations, reschedules)

## Accessibility
- **Keyboard Navigation**: 
  - Tab navigation through collection timeline
  - Keyboard shortcuts for common actions
- **Screen Reader Compatibility**: 
  - ARIA labels for status changes
  - Descriptive status announcements
- **Color Contrast**: 
  - Status colors meet WCAG AA standards
  - Alternative indicators beyond color (icons, text)

## Future Improvements
- Implement predictive status updates based on route efficiency analysis
- Add customer confirmation step for completed collections
- Enhance rescheduling capabilities with suggested alternate times
- Implement status-based gamification rewards

## Related Documentation
- [Delivery Personnel Location Tracking](./delivery-personnel-tracking.md)
- [Real-Time Features](../../real-time-features.md)
- [Notification System](../../push-notification-guide.md) 