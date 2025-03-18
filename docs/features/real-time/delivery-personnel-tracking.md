# Delivery Personnel Location Tracking

## Overview
The Delivery Personnel Location Tracking feature provides real-time location updates of delivery personnel to users, enhancing transparency and allowing accurate estimation of collection times. This feature is critical for improving the user experience by reducing uncertainty about when recycling collections will occur.

## User-Facing Functionality
- **Live Map Tracking**: Interactive map showing the real-time location of assigned delivery personnel
- **ETA Updates**: Dynamic estimated time of arrival calculations based on current location and traffic conditions
- **Personnel Information**: Display of delivery personnel name, photo, and contact information
- **Status Indicators**: Visual indicators showing whether personnel are en route, nearby, or at the collection point
- **Collection History**: Record of previous collection locations with timestamps

## Technical Implementation

### Architecture
- **Design Pattern(s)**: Observer Pattern for location updates, Repository Pattern for data storage
- **Key Components**: 
  - `LocationTrackingService`: Manages WebSocket connections for real-time updates
  - `DeliveryMapComponent`: Renders the map and location markers
  - `useTravelTime`: Custom hook for ETA calculations
- **Dependencies**: 
  - Expo Location
  - React Native Maps
  - WebSocket connection service

### Code Structure
```typescript
// Key interfaces
interface DeliveryPersonnel {
  id: string;
  name: string;
  photoUrl: string;
  phoneNumber: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy: number;
  };
  status: 'inactive' | 'en_route' | 'nearby' | 'at_location';
}

// Example of location subscription
function subscribeToPersonnelLocation(personnelId: string): () => void {
  const wsConnection = WebSocketService.getInstance();
  
  const subscription = wsConnection.subscribe(
    `delivery-personnel/${personnelId}/location`,
    (locationUpdate) => {
      // Update Redux store with new location
      dispatch(updatePersonnelLocation(personnelId, locationUpdate));
      
      // Calculate new ETA if personnel is assigned to user
      if (isPersonnelAssignedToUser(personnelId)) {
        calculateAndUpdateETA(locationUpdate);
      }
    }
  );
  
  // Return unsubscribe function
  return () => wsConnection.unsubscribe(subscription);
}
```

### Key Files
- `src/components/tracking/DeliveryMap.tsx`: Map component for displaying personnel location
- `src/hooks/usePersonnelTracking.ts`: Hook for subscribing to location updates
- `src/services/LocationTrackingService.ts`: Service for managing location tracking
- `src/utils/locationUtils.ts`: Utilities for location calculations and formatting

## Integration Points
- **Related Features**: 
  - Collection status updates
  - Notification system (for proximity alerts)
  - Battery optimization (for location accuracy adjustments)
- **API Endpoints**: 
  - WebSocket endpoint: `wss://api.ecocart.com/ws/delivery-tracking`
  - REST endpoint: `GET /api/delivery-personnel/{id}/location` (fallback)
- **State Management**: 
  - Redux slice for personnel locations
  - Local component state for UI-specific elements

## Performance Considerations
- **Optimization Techniques**: 
  - Throttled location updates (minimum 5-second intervals)
  - Map marker clustering for areas with multiple personnel
  - Lazy loading of map until needed
- **Potential Bottlenecks**: 
  - WebSocket connection stability on poor networks
  - Map rendering performance with multiple markers
- **Battery/Resource Impact**: 
  - Reduced location accuracy when app is in background
  - Decreased update frequency when user battery is low

## Testing Strategy
- **Unit Tests**: 
  - Location calculation utilities
  - ETA prediction algorithm
  - WebSocket message handling
- **Integration Tests**: 
  - Map component rendering with mock location data
  - Redux store updates from location service
- **Mock Data**: 
  - Simulated routes with timestamped coordinates
  - Various personnel statuses and scenarios

## Accessibility
- **Keyboard Navigation**: 
  - Full keyboard support for map controls
  - Keyboard shortcuts for common actions
- **Screen Reader Compatibility**: 
  - ARIA labels for map elements
  - Descriptive announcements for location changes
- **Color Contrast**: 
  - High-contrast map markers
  - Alternative map styles for colorblind users

## Future Improvements
- Implement predictive ETA using historical traffic patterns
- Add support for sharing personnel location with other household members
- Enhance offline support with cached route information
- Implement augmented reality view for precise location identification

## Related Documentation
- [Real-Time Features](./real-time-features.md)
- [Notification System](./push-notification-guide.md)
- [Battery Optimization](./performance-optimization-guide.md) 