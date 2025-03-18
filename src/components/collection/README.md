# Collection Components

This directory contains components for managing recycling collection operations, scheduling, and weight tracking in the EcoCart application.

## Components

### CollectionScheduler

Manages collection schedules and time slot selection.

```tsx
import { CollectionScheduler } from './CollectionScheduler';

<CollectionScheduler
  userId={currentUserId}
  availableSlots={timeSlots}
  onSchedule={handleScheduleCollection}
/>
```

#### Features
- Time slot selection
- Schedule management
- Availability checking
- Conflict resolution
- Reminder settings

### CollectionTracker

Tracks collection progress and status.

```tsx
import { CollectionTracker } from './CollectionTracker';

<CollectionTracker
  collectionId={activeCollectionId}
  showRealTimeUpdates={true}
/>
```

### WeightTracker

Manages weight measurements and tracking.

```tsx
import { WeightTracker } from './WeightTracker';

<WeightTracker
  materialType="plastic"
  onWeightUpdate={handleWeightChange}
  useAutoCalibration={true}
/>
```

### MaterialSelector

Component for selecting recycling materials.

```tsx
import { MaterialSelector } from './MaterialSelector';

<MaterialSelector
  availableMaterials={materials}
  onSelect={handleMaterialSelect}
  showCategories={true}
/>
```

### CollectionCard

Displays collection information in a card format.

```tsx
import { CollectionCard } from './CollectionCard';

<CollectionCard
  collection={collectionData}
  showStatus={true}
  onActionPress={handleAction}
/>
```

### CollectionPointCard

Displays collection point information and status.

```tsx
import { CollectionPointCard } from './CollectionPointCard';

<CollectionPointCard
  point={collectionPoint}
  showDistance={true}
  showAvailability={true}
/>
```

### WeightMeasurement

Handles weight measurement input and validation.

```tsx
import { WeightMeasurement } from './WeightMeasurement';

<WeightMeasurement
  initialWeight={0}
  unit="kg"
  onMeasure={handleMeasurement}
/>
```

## Data Types

### Collection
```typescript
interface Collection {
  id: string;
  userId: string;
  scheduledTime: Date;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  materials: Material[];
  totalWeight: number;
  collectionPoint: CollectionPoint;
}
```

### Material
```typescript
interface Material {
  id: string;
  type: string;
  weight: number;
  category: string;
  recyclable: boolean;
}
```

### CollectionPoint
```typescript
interface CollectionPoint {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  availability: {
    days: string[];
    hours: string[];
  };
  capacity: number;
}
```

## Best Practices

1. **User Experience**
   - Implement intuitive scheduling flow
   - Provide clear feedback
   - Show real-time updates
   - Handle edge cases gracefully
   - Support offline operations

2. **Performance**
   - Optimize location services
   - Implement efficient data syncing
   - Cache collection point data
   - Minimize battery usage
   - Handle background updates efficiently

3. **Accessibility**
   - Support screen readers
   - Implement keyboard navigation
   - Provide clear error messages
   - Maintain proper contrast
   - Include haptic feedback

4. **Data Management**
   - Implement proper validation
   - Handle conflicts gracefully
   - Support offline data
   - Implement proper error handling
   - Maintain data consistency

## Contributing

When adding new collection components:

1. Follow the established component structure
2. Include comprehensive documentation
3. Add unit tests
4. Consider offline capabilities
5. Ensure accessibility compliance
6. Add proper type definitions

## Testing

1. **Unit Tests**
   - Test scheduling logic
   - Verify weight calculations
   - Test validation rules
   - Validate data transformations

2. **Integration Tests**
   - Test scheduling flow
   - Verify collection tracking
   - Test weight measurement
   - Validate offline functionality

3. **End-to-End Tests**
   - Test complete collection flow
   - Verify scheduling process
   - Test real-time updates
   - Validate notifications 