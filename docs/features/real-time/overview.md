# EcoCart Real-Time Features Overview

This document provides an overview of the real-time update features implemented in the EcoCart application, focusing on battery optimization and notification management.

## Completed Features

### Real-Time Settings Screen

- **Battery-Aware Settings**: Interface to control real-time update frequency based on battery status
- **Device Information Display**: Shows current battery level, charging status, and device details
- **Toggle Controls**: Enable/disable real-time updates, battery optimization, and high-accuracy mode
- **Performance Metrics**: Visual display of messaging statistics and connection performance

### Notification History Screen

- **Categorized Notifications**: Groups notifications by type (Collections, Achievements, Tips, etc.)
- **Filtering Capabilities**: Filter notifications by category with count indicators
- **Read/Unread Status**: Visual indication and management of notification read status
- **Time-Based Formatting**: Intelligently formats timestamps ("2 hours ago", "yesterday", etc.)
- **Statistics Display**: Shows total counts, unread counts, and category breakdown

### Battery Optimization Utilities

The battery optimization system adjusts application behavior based on the device's battery level and charging state:

```typescript
// Update frequency configuration based on battery state and level (in milliseconds)
const BATTERY_STATE_INTERVALS = {
  [BatteryState.UNPLUGGED]: {
    [BatteryLevel.NORMAL]: 30000,  // 30 seconds
    [BatteryLevel.LOW]: 60000,     // 1 minute
    [BatteryLevel.CRITICAL]: 180000, // 3 minutes
  },
  [BatteryState.CHARGING]: {
    [BatteryLevel.NORMAL]: 10000,  // 10 seconds
    [BatteryLevel.LOW]: 15000,     // 15 seconds
    [BatteryLevel.CRITICAL]: 30000, // 30 seconds
  },
  [BatteryState.FULL]: {
    [BatteryLevel.NORMAL]: 5000,   // 5 seconds
    [BatteryLevel.LOW]: 10000,     // 10 seconds
    [BatteryLevel.CRITICAL]: 15000, // 15 seconds
  },
};
```

Key components:

- **Dynamic Update Intervals**: Adjusts update frequency based on battery level and charging state
- **Location Accuracy Control**: Reduces GPS precision when battery is low
- **Background Behavior Management**: Suspends or reduces updates when app is in background
- **Network-Aware Optimization**: Adapts data transmission based on connection type (WiFi vs. Cellular)

### Performance Optimization Features

- **Data Usage Management**: Controls data transfer size and frequency based on network conditions
- **Polling Frequency Adjustment**: Dynamic polling rates based on user activity and battery state
- **Background Task Scheduling**: Optimized scheduling of background tasks during idle periods

### Notification Management Service

Our enhanced notification system provides:

```typescript
// Example of retrieving notification history with filtering
async function getNotificationHistory(
  options: {
    category?: NotificationCategory,
    limit?: number,
    onlyUnread?: boolean
  } = {}
): Promise<NotificationHistoryItem[]> {
  const { category, limit = 50, onlyUnread = false } = options;
  
  // Apply filters to retrieve notifications based on options
  const notifications = await retrieveNotificationsFromStorage();
  let filtered = notifications;
  
  if (category) {
    filtered = filtered.filter(n => n.category === category);
  }
  
  if (onlyUnread) {
    filtered = filtered.filter(n => !n.isRead);
  }
  
  // Sort by timestamp (newest first) and apply limit
  return filtered
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}
```

Features include:

- **Push Notification Support**: Integration with Expo's notification system
- **Notification History Storage**: Persistent storage of past notifications
- **Category-Based Organization**: Structured notification taxonomy
- **Read Status Management**: Tracks and updates notification read status
- **Actionable Notifications**: Deep linking to relevant app screens

## Technical Implementation

### Battery-Aware Real-Time Updates

The system uses a singleton `BatteryOptimizer` utility that manages all aspects of battery-optimized behavior:

```typescript
// Example usage of BatteryOptimizer
const batteryOptimizer = BatteryOptimizer.getInstance();
const updateInterval = batteryOptimizer.getOptimalUpdateInterval();

// Schedule a function to run at battery-optimized intervals
const cleanup = batteryOptimizer.scheduleAtOptimalInterval(() => {
  // Perform update operation
  fetchLatestData();
});

// Later, clean up when no longer needed
cleanup();
```

### WebSocket Connection Management

The real-time update system handles:

- Automatic reconnection when connection is lost
- Background connection management
- Subscription to topic-based updates
- Battery-optimized polling intervals

### Custom React Hooks

Two primary hooks manage the real-time functionality:

1. **useBatteryOptimizedUpdates**: Manages battery state monitoring and update interval optimization

2. **useRealTimeUpdates**: Handles WebSocket connections and subscriptions to data streams

## Architecture and Design Patterns

The real-time features implementation uses several design patterns:

- **Singleton Pattern**: For battery optimizer and WebSocket service
- **Observer Pattern**: For battery state and connection state changes
- **Factory Pattern**: For creating optimized location settings
- **Strategy Pattern**: For different update strategies based on battery state
- **Repository Pattern**: For notification storage and retrieval
- **Adapter Pattern**: For WebSocket message handling

## Testing Approach

The implementation includes comprehensive tests:

### Unit Tests
- **Battery Optimization Tests**:
  - Test battery level thresholds and transitions
  - Verify update interval calculations for different battery states
  - Test background mode behavior adjustments
- **WebSocket Service Tests**:
  - Connection establishment and maintenance
  - Subscription management and message routing
  - Reconnection logic and backoff strategies
- **Notification Service Tests**:
  - Notification creation and categorization
  - Filter and query capabilities
  - Storage and retrieval operations

### Integration Tests
- **End-to-End Update Flow**:
  - Verify data flow from WebSocket to UI components
  - Test state updates in Redux store from real-time events
  - Validate notification triggering from status changes
- **Battery-WebSocket Integration**:
  - Confirm WebSocket behavior changes based on battery state
  - Test polling frequency adjustments when battery level changes
  - Verify background behavior when app is minimized
- **Cross-Component Communication**:
  - Test how location updates affect collection status
  - Verify notification generation from real-time events
  - Validate UI updates across multiple screens

### Performance Tests
- **Battery Impact Measurement**:
  - Benchmark battery drain under different update frequencies
  - Compare optimized vs. non-optimized battery usage
  - Long-running tests simulating day-long usage patterns
- **Network Usage Analysis**:
  - Measure data consumption with various optimization settings
  - Test bandwidth usage under different connection types
  - Analyze payload sizes and compression effectiveness
- **Memory and CPU Profiling**:
  - Monitor memory usage during extended WebSocket connections
  - Profile CPU usage during update processing
  - Identify and address performance bottlenecks

### Mock Services
- **WebSocket Server Simulation**:
  - Mock server for simulating various connection scenarios
  - Programmable message sequences for testing handlers
  - Controlled disconnection/reconnection for testing recovery
- **Battery State Simulation**:
  - Mock battery level and charging state changes
  - Simulate rapid transitions between battery states
  - Test extreme battery conditions (very low, rapid discharge)
- **Location Service Mocks**:
  - Simulated movement patterns for delivery personnel
  - Mock location accuracy changes
  - Simulated GPS signal loss scenarios

## Future Improvements

Potential enhancements to the real-time features:

1. **Machine Learning Optimization**: Learn from user patterns to predict optimal update times
2. **Enhanced Network Awareness**: More granular control based on network quality metrics
3. **Custom User Preferences**: Allow users to override default optimization settings
4. **Geofence-Based Updates**: Adjust update frequency based on user location relevance

## Conclusion

The real-time features implementation provides a comprehensive solution for keeping users up-to-date with the latest information while optimizing battery usage. The system is designed to be modular and extensible, allowing for easy addition of new features and improvements to existing ones.

## Related Documentation
- [Delivery Personnel Location Tracking](./delivery-personnel-tracking.md)
- [Collection Status Updates](./collection-status-updates.md)
- [Performance Optimization Guide](../../performance-optimization-guide.md)
- [Push Notification Guide](../../push-notification-guide.md) 