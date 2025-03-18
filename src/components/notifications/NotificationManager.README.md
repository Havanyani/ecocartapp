# NotificationManager

## Overview
The `NotificationManager` component provides a centralized system for managing push notifications in the EcoCart application. It uses React Context to expose notification functionality throughout the app, allowing components to schedule, send, cancel, and manage notifications for various events like collection status updates, achievements, and community challenges.

## Usage

```tsx
import { NotificationProvider, useNotifications } from '@/components/notifications/NotificationManager';

// Wrap your app with the provider
function App() {
  return (
    <NotificationProvider>
      <MainAppContent />
    </NotificationProvider>
  );
}

// Use notifications in any component
function CollectionScreen({ collection }) {
  const notifications = useNotifications();
  
  const handleCompleteCollection = async () => {
    // Send a status update notification
    await notifications.sendCollectionStatusUpdate(
      collection.id,
      collection.materialType,
      'completed'
    );
    // Other logic...
  };
  
  return (
    <Button onPress={handleCompleteCollection} title="Complete Collection" />
  );
}
```

## Context API

The `NotificationContext` provides the following methods:

| Method | Signature | Description |
|--------|-----------|-------------|
| `scheduleCollectionReminder` | `(collectionId: string, materialType: string, scheduledDateTime: Date, address: string) => Promise<string>` | Schedules a reminder notification for an upcoming collection |
| `sendCollectionStatusUpdate` | `(collectionId: string, materialType: string, status: CollectionStatus) => Promise<string>` | Sends a notification about a collection status change |
| `sendAchievementNotification` | `(achievementId: string, title: string, description: string) => Promise<string>` | Sends a notification about an unlocked achievement |
| `sendSyncCompleteNotification` | `(itemCount: number) => Promise<string>` | Notifies when data synchronization is complete |
| `sendCommunityUpdateNotification` | `(challengeId: string, title: string, message: string, progress: number, target: number) => Promise<string>` | Sends updates about community challenges |
| `sendChallengeCompleteNotification` | `(challengeId: string, title: string, reward: string) => Promise<string>` | Notifies when a challenge is completed |
| `cancelNotification` | `(notificationId: string) => Promise<void>` | Cancels a scheduled notification by ID |
| `cancelAllNotifications` | `() => Promise<void>` | Cancels all scheduled notifications |
| `setBadgeCount` | `(count: number) => Promise<void>` | Sets the app badge count on supported platforms |

## Features
- **Centralized Notification System**: Manages all app notifications from a single source
- **Multiple Notification Types**: Support for various notification categories and formats
- **Deep Linking**: Notifications that navigate users to relevant screens when tapped
- **Scheduled Notifications**: Support for scheduling notifications for future delivery
- **Badge Management**: Controls the app's notification badge count
- **Platform Adaptability**: Handles platform-specific behavior for iOS and Android
- **Error Handling**: Graceful fallbacks when notifications fail to send

## Implementation Details

The NotificationManager consists of two main parts:

1. **NotificationProvider**: A React Context provider that initializes the notification service and provides notification methods to the rest of the application.

2. **useNotifications Hook**: A custom hook that provides access to the notification context in any component.

Key implementation details:

```tsx
// Initialization code
const initializeNotifications = async () => {
  try {
    await NotificationService.initialize({
      onNotificationReceived: handleNotificationReceived,
      onNotificationPressed: handleNotificationPressed
    });
    
    // Request permissions
    const hasPermission = await NotificationService.requestPermissions();
    setPermissionsGranted(hasPermission);
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
  }
};
```

## Best Practices
- **Do**: Initialize the `NotificationProvider` at the root of your application
- **Do**: Handle notification permission denials gracefully
- **Do**: Use appropriate notification methods for different scenarios
- **Don't**: Send too many notifications in a short period (avoid notification fatigue)
- **Accessibility**: Ensure notifications are accompanied by appropriate haptic feedback

## Examples

### Schedule a Collection Reminder
```tsx
const scheduleReminder = async () => {
  const reminderDate = new Date(collection.scheduledDate);
  reminderDate.setHours(reminderDate.getHours() - 2); // 2 hours before
  
  const notificationId = await notifications.scheduleCollectionReminder(
    collection.id,
    collection.materialType,
    reminderDate,
    collection.address
  );
  
  // Store the notification ID for later reference
  saveNotificationId(notificationId);
};
```

### Send Achievement Notification
```tsx
const unlockAchievement = async (achievement) => {
  // Update achievement status in backend
  await achievementService.unlockAchievement(achievement.id);
  
  // Send notification
  await notifications.sendAchievementNotification(
    achievement.id,
    achievement.title,
    achievement.description
  );
  
  // Navigate to achievement screen
  navigation.navigate('Achievements');
};
```

### Handle Community Challenge Updates
```tsx
function ChallengeProgressScreen({ challenge }) {
  const notifications = useNotifications();
  const [progress, setProgress] = useState(challenge.progress);
  
  useEffect(() => {
    // When progress changes significantly
    if (progress - challenge.progress > 10) {
      notifications.sendCommunityUpdateNotification(
        challenge.id,
        'Challenge Progress',
        `Your community has made great progress on the ${challenge.title} challenge!`,
        progress,
        challenge.target
      );
    }
    
    // If challenge completed
    if (progress >= challenge.target && challenge.progress < challenge.target) {
      notifications.sendChallengeCompleteNotification(
        challenge.id,
        challenge.title,
        challenge.reward
      );
    }
  }, [progress, challenge]);
  
  // Rest of component
}
```

## Related Documentation
- [Real-Time Notifications](../../../docs/features/real-time/overview.md)
- [Collection Status Updates](../../../docs/features/real-time/collection-status-updates.md)
- [NotificationService Documentation](../../../docs/services/notification-service.md) 