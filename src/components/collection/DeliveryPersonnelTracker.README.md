# DeliveryPersonnelTracker

## Overview
The `DeliveryPersonnelTracker` component provides real-time tracking of delivery personnel on a map. It displays the current location, route path, and estimated arrival time of personnel assigned to a collection. This component is essential for providing users with visibility into the status of their collection requests.

## Usage

```tsx
import { DeliveryPersonnelTracker } from '@/components/collection/DeliveryPersonnelTracker';
import { Collection } from '@/types/Collection';
import { DeliveryPersonnel } from '@/types/DeliveryPersonnel';

// Basic usage
<DeliveryPersonnelTracker
  collection={collectionData}
  deliveryPersonnel={personnelData}
/>

// With callback for contacting personnel
<DeliveryPersonnelTracker
  collection={collectionData}
  deliveryPersonnel={personnelData}
  onCallPersonnel={() => callDeliveryPerson(personnelData.phoneNumber)}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `collection` | `Collection` | Yes | - | The collection object being tracked |
| `deliveryPersonnel` | `DeliveryPersonnel` | Yes | - | The delivery personnel assigned to the collection |
| `onCallPersonnel` | `() => void` | No | `undefined` | Callback function when the user opts to call the delivery personnel |

## Features
- **Real-time Location Tracking**: Shows the current location of delivery personnel on a map
- **Route Visualization**: Displays the path taken by the delivery personnel
- **Estimated Arrival Time**: Shows expected arrival time, updated in real-time
- **Interactive Map**: Allows users to zoom and pan to explore the route
- **Contact Capability**: Option to call or message the delivery personnel
- **Status Information**: Shows current status (en route, nearby, arrived)
- **Error Handling**: Graceful fallbacks when location data is unavailable

## Styling
The component uses React Native's `StyleSheet` for styling and adapts to the app's theme:

```tsx
// Example of custom styling
<DeliveryPersonnelTracker
  collection={collectionData}
  deliveryPersonnel={personnelData}
  style={{ height: 400, borderRadius: 16 }}
/>
```

## Best Practices
- **Do**: Ensure appropriate permissions are requested for location services
- **Do**: Handle offline scenarios gracefully with cached data
- **Do**: Implement battery-optimized updates to conserve user device power
- **Don't**: Keep the tracking active when not in view to preserve battery and data
- **Accessibility**: Provide alternative text descriptions of location and status for screen readers

## Examples

### Basic Tracking View
```tsx
<DeliveryPersonnelTracker
  collection={collectionData}
  deliveryPersonnel={personnelData}
/>
```

### With Contact Options and Custom Styling
```tsx
const handleContactPersonnel = () => {
  // Implementation for contacting personnel
  Linking.openURL(`tel:${personnelData.phoneNumber}`);
};

<DeliveryPersonnelTracker
  collection={collectionData}
  deliveryPersonnel={personnelData}
  onCallPersonnel={handleContactPersonnel}
  style={{
    height: 350,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 20
  }}
/>
```

### With Error Handling and Loading States
```tsx
function TrackingScreen({ collectionId }) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [personnel, setPersonnel] = useState<DeliveryPersonnel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch data and handle states...
  
  if (isLoading) return <LoadingIndicator />;
  if (error) return <ErrorView message={error} />;
  if (!collection || !personnel) return <NoDataView />;
  
  return (
    <DeliveryPersonnelTracker
      collection={collection}
      deliveryPersonnel={personnel}
      onCallPersonnel={() => callDeliveryPerson(personnel.phoneNumber)}
    />
  );
}
```

## Internal Structure
The component uses several key internal elements:

- **MapView**: The main map component from `react-native-maps`
- **Marker**: Indicates the delivery personnel's current position
- **Polyline**: Shows the route path from starting point to current location
- **Status Panel**: Displays ETAs and delivery status information
- **Action Buttons**: For contacting personnel or refreshing data

Key state variables:
- `personnelLocation`: Current coordinates
- `routePath`: Array of coordinates making up the route
- `estimatedArrival`: Calculated arrival time
- `isLoading`: Loading state indicator
- `error`: Error state for handling failure cases

## Dependent Components
- `MapView` and related components from `react-native-maps`
- `ThemedView` and `ThemedText` for consistent styling
- `IconSymbol` for map markers and buttons
- `WebSocketService` for real-time updates

## Related Documentation
- [Delivery Personnel Location Tracking](../../../docs/features/real-time/delivery-personnel-tracking.md)
- [Real-Time Features Overview](../../../docs/features/real-time/overview.md)
- [useRealTimeUpdates Hook](../../hooks/useRealTimeUpdates.README.md) 