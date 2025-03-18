# EcoCart Push Notification Guide

## Overview

This guide documents the push notification system implemented in the EcoCart application. Push notifications are a critical component for user engagement, providing timely updates about collection schedules, rewards, achievements, and app features. This document outlines the architecture, components, and best practices for implementing and managing push notifications effectively.

## Table of Contents

1. [Notification Architecture](#notification-architecture)
2. [Scheduled Collection Reminders](#scheduled-collection-reminders)
3. [Achievement Notifications](#achievement-notifications)
4. [Community Challenge Updates](#community-challenge-updates)
5. [Sync Completion Notifications](#sync-completion-notifications)
6. [User Preferences & Controls](#user-preferences--controls)
7. [Best Practices](#best-practices)

## Notification Architecture

### System Overview

The push notification system is designed to handle various types of notifications with appropriate timing, relevance, and user preferences:

```
┌─────────────────┐      ┌────────────────┐       ┌─────────────────┐
│                 │      │                │       │                 │
│  Notification   ├─────►│  Notification  ├──────►│  Platform       │
│  Triggers       │      │  Service       │       │  Integration    │
│                 │      │                │       │                 │
└─────────────────┘      └────────────────┘       └─────────────────┘
                                │                        │
                                │                        ▼
┌─────────────────┐      ┌────────────────┐       ┌─────────────────┐
│                 │      │                │       │                 │
│  User           │◄─────┤  Preference    │◄──────┤  Device         │
│  Interaction    │      │  Manager       │       │  Delivery       │
│                 │      │                │       │                 │
└─────────────────┘      └────────────────┘       └─────────────────┘
```

### Key Components

- **NotificationService** (`src/services/NotificationService.ts`): Core service managing all notification functionality
- **NotificationProvider** (`src/providers/NotificationProvider.tsx`): Context provider for notification state
- **NotificationHandler** (`src/utils/NotificationHandler.ts`): Utility for handling notification interactions
- **NotificationScheduler** (`src/utils/NotificationScheduler.ts`): Manages scheduling of future notifications

### Implementation

The notification system uses Expo's notification system with a custom service layer for application-specific logic:

```typescript
// Example notification service implementation
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useNotifications } from '../hooks/useNotifications';

class NotificationService {
  // Initialize notification system
  async initialize(): Promise<void> {
    // Request permissions
    const permissionResult = await this.requestPermissions();
    
    if (!permissionResult.granted) {
      console.log('Notification permissions not granted');
      return;
    }
    
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    
    // Set up notification listeners
    this.setupListeners();
  }
  
  // Request notification permissions
  async requestPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
    
    return Notifications.requestPermissionsAsync();
  }
  
  // Schedule a notification
  async scheduleNotification(
    title: string,
    body: string,
    data: Record<string, any> = {},
    trigger: Notifications.NotificationTriggerInput = null
  ): Promise<string> {
    return Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger,
    });
  }
  
  // Cancel a notification
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
  
  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
  
  // Setup listeners for notification events
  private setupListeners(): void {
    // When a notification is received while the app is in the foreground
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground', notification);
      // Process notification data
    });
    
    // When a user taps on a notification
    Notifications.addNotificationResponseReceivedListener(response => {
      const { notification } = response;
      const data = notification.request.content.data;
      
      // Handle different notification types
      if (data.type === 'collection_reminder') {
        // Navigate to collection screen
        // ...
      } else if (data.type === 'achievement') {
        // Navigate to achievement screen
        // ...
      } else if (data.type === 'challenge') {
        // Navigate to challenge screen
        // ...
      }
    });
  }
}

// Example usage in a component
function NotificationExample() {
  const { scheduleNotification, cancelNotification } = useNotifications();
  
  const handleScheduleReminder = async () => {
    const notificationId = await scheduleNotification(
      'Collection Reminder',
      'Your scheduled collection is tomorrow at 9 AM',
      { type: 'collection_reminder', collectionId: '123' },
      { seconds: 60 * 60 * 24 } // 24 hours from now
    );
    
    // Store notification ID for later reference
    // ...
  };
  
  // Component implementation...
}
```

## Scheduled Collection Reminders

### Reminder Types

Several reminder types ensure users don't miss scheduled pickups:

1. **Initial Confirmation**
   - Sent immediately after scheduling a collection
   - Confirms successful scheduling
   - Includes date, time, and materials

2. **Advance Notice**
   - Sent 24-48 hours before scheduled collection
   - Reminds users to prepare materials
   - Includes preparation instructions

3. **Day-of Reminder**
   - Sent morning of the scheduled collection
   - Final reminder with time window
   - Includes any weather advisories or special instructions

4. **Follow-up Confirmation**
   - Sent after collection is complete
   - Confirms successful pickup
   - Includes earned credits and impact metrics

### Implementation

```typescript
// Example scheduled reminder implementation
class CollectionReminderService {
  // Schedule reminders for a new collection
  async scheduleRemindersForCollection(collection: Collection): Promise<void> {
    const notificationService = new NotificationService();
    
    // 1. Initial confirmation (immediate)
    await notificationService.scheduleNotification(
      'Collection Scheduled',
      `Your collection is scheduled for ${formatDate(collection.date)} at ${formatTime(collection.timeWindow.start)}.`,
      {
        type: 'collection_reminder',
        subtype: 'confirmation',
        collectionId: collection.id
      }
    );
    
    // 2. Advance notice (48 hours before)
    const advanceNoticeTrigger = {
      date: new Date(collection.date.getTime() - (48 * 60 * 60 * 1000))
    };
    
    await notificationService.scheduleNotification(
      'Upcoming Collection',
      `Your collection is scheduled for ${formatDate(collection.date)}. Don't forget to prepare your recyclables!`,
      {
        type: 'collection_reminder',
        subtype: 'advance_notice',
        collectionId: collection.id
      },
      advanceNoticeTrigger
    );
    
    // 3. Day-of reminder (morning of)
    const collectionDay = new Date(collection.date);
    const morningReminder = new Date(
      collectionDay.getFullYear(),
      collectionDay.getMonth(),
      collectionDay.getDate(),
      7, // 7 AM
      0
    );
    
    await notificationService.scheduleNotification(
      'Collection Today',
      `Your collection is today between ${formatTime(collection.timeWindow.start)} and ${formatTime(collection.timeWindow.end)}.`,
      {
        type: 'collection_reminder',
        subtype: 'day_of',
        collectionId: collection.id
      },
      { date: morningReminder }
    );
  }
  
  // Cancel reminders for a cancelled collection
  async cancelRemindersForCollection(collectionId: string): Promise<void> {
    // Implementation details...
  }
}
```

## Achievement Notifications

### Notification Strategy

Achievement notifications inform users about accomplishments and encourage continued engagement:

1. **Achievement Unlocked**
   - Sent when user earns a new achievement
   - Congratulatory message
   - Shows achievement details and points awarded

2. **Progress Updates**
   - Sent when significant progress is made towards achievements
   - Encouragement to continue
   - Shows remaining requirements

3. **Milestone Celebrations**
   - Sent for major recycling milestones
   - Emphasizes environmental impact
   - Includes shareable graphic

### Implementation

```typescript
// Example achievement notification implementation
class AchievementNotificationService {
  // Send notification for a newly unlocked achievement
  async sendAchievementUnlockedNotification(achievement: Achievement, userId: string): Promise<void> {
    const notificationService = new NotificationService();
    
    await notificationService.scheduleNotification(
      'Achievement Unlocked! 🎉',
      `Congratulations! You've earned the "${achievement.title}" achievement and ${achievement.points} points.`,
      {
        type: 'achievement',
        subtype: 'unlocked',
        achievementId: achievement.id,
        userId
      }
    );
  }
  
  // Send notification for achievement progress
  async sendProgressNotification(
    achievement: Achievement,
    progress: number,
    target: number,
    userId: string
  ): Promise<void> {
    // Only send at certain thresholds (e.g., 50%, 75%, 90%)
    const progressPercentage = (progress / target) * 100;
    const thresholds = [50, 75, 90];
    
    if (!thresholds.some(threshold => 
      progressPercentage >= threshold && progressPercentage < threshold + 5
    )) {
      return; // Don't send if not at a milestone threshold
    }
    
    const remaining = target - progress;
    
    const notificationService = new NotificationService();
    await notificationService.scheduleNotification(
      'Achievement Progress',
      `You're ${Math.round(progressPercentage)}% of the way to earning the "${achievement.title}" achievement! Just ${remaining} more to go.`,
      {
        type: 'achievement',
        subtype: 'progress',
        achievementId: achievement.id,
        userId
      }
    );
  }
  
  // Send milestone celebration notification
  async sendMilestoneNotification(milestone: Milestone, userId: string): Promise<void> {
    // Implementation details...
  }
}
```

## Community Challenge Updates

### Update Types

Community challenge notifications keep users engaged with group activities:

1. **New Challenge Announcements**
   - Sent when a new challenge is available
   - Describes challenge goals and rewards
   - Includes join button

2. **Progress Updates**
   - Sent at key progress points (25%, 50%, 75%)
   - Shows community progress
   - Encourages additional participation

3. **Leaderboard Position Changes**
   - Sent when user's position changes significantly
   - Notifies of ranking improvements or slips
   - Motivates continued participation

4. **Challenge Completion**
   - Sent when challenge is completed
   - Congratulates the community
   - Shows final results and rewards

### Implementation

```typescript
// Example community challenge notification implementation
class ChallengeNotificationService {
  // Announce a new challenge
  async sendNewChallengeNotification(challenge: Challenge): Promise<void> {
    const notificationService = new NotificationService();
    const userService = new UserService();
    
    // Get eligible users
    const eligibleUsers = await userService.getUsersEligibleForChallenge(challenge);
    
    // Send to each eligible user
    for (const user of eligibleUsers) {
      // Check if user has enabled this notification type
      if (await this.shouldSendChallengeNotification(user.id, 'new_challenge')) {
        await notificationService.scheduleNotification(
          'New Challenge Available!',
          `Join the "${challenge.title}" challenge and earn rewards! ${challenge.description}`,
          {
            type: 'challenge',
            subtype: 'new',
            challengeId: challenge.id,
            userId: user.id
          }
        );
      }
    }
  }
  
  // Send progress update
  async sendChallengeProgressNotification(challenge: Challenge, progress: number): Promise<void> {
    // Only send at milestone percentages
    const progressPercentage = (progress / challenge.target) * 100;
    const milestones = [25, 50, 75, 90];
    
    if (!milestones.includes(Math.floor(progressPercentage))) {
      return; // Not at a milestone percentage
    }
    
    const notificationService = new NotificationService();
    const participantIds = await this.getChallengeParticipantIds(challenge.id);
    
    for (const userId of participantIds) {
      if (await this.shouldSendChallengeNotification(userId, 'progress')) {
        await notificationService.scheduleNotification(
          'Challenge Progress Update',
          `The "${challenge.title}" challenge is ${Math.floor(progressPercentage)}% complete! Keep up the good work!`,
          {
            type: 'challenge',
            subtype: 'progress',
            challengeId: challenge.id,
            userId
          }
        );
      }
    }
  }
  
  // Send leaderboard position change notification
  async sendLeaderboardPositionNotification(
    userId: string,
    challengeId: string,
    oldPosition: number,
    newPosition: number
  ): Promise<void> {
    // Only notify for significant changes
    if (Math.abs(oldPosition - newPosition) < 3 && newPosition > 10) {
      return; // Change is not significant enough
    }
    
    // Implementation details...
  }
  
  // Send challenge completion notification
  async sendChallengeCompletionNotification(challenge: Challenge): Promise<void> {
    // Implementation details...
  }
  
  // Helper method to check user preferences
  private async shouldSendChallengeNotification(
    userId: string,
    notificationType: 'new_challenge' | 'progress' | 'leaderboard' | 'completion'
  ): Promise<boolean> {
    const preferencesService = new UserPreferencesService();
    const preferences = await preferencesService.getNotificationPreferences(userId);
    
    return preferences.challenges[notificationType] === true;
  }
}
```

## Sync Completion Notifications

### Notification Strategy

Sync completion notifications inform users about offline data synchronization:

1. **Automatic Sync Completion**
   - Sent when pending operations sync after reconnection
   - Confirms successful data transfer
   - Summarizes synced items

2. **Sync Conflict Resolution**
   - Sent when user action is needed to resolve conflicts
   - Explains conflict nature
   - Provides resolution options

3. **Failed Sync Notifications**
   - Sent when sync operations fail
   - Explains failure reason
   - Provides retry options

### Implementation

```typescript
// Example sync notification implementation
class SyncNotificationService {
  // Notify user of successful automatic sync
  async sendSyncCompletionNotification(
    userId: string,
    syncStats: {
      collections: number,
      materials: number,
      achievements: number,
      other: number
    }
  ): Promise<void> {
    // Only notify if significant changes were synced
    const totalChanges = Object.values(syncStats).reduce((sum, count) => sum + count, 0);
    
    if (totalChanges <= 1) {
      return; // Don't notify for minor syncs
    }
    
    const notificationService = new NotificationService();
    await notificationService.scheduleNotification(
      'Data Synced Successfully',
      `Your offline changes have been synced: ${this.formatSyncStats(syncStats)}`,
      {
        type: 'sync',
        subtype: 'completion',
        userId,
        syncStats
      }
    );
  }
  
  // Notify user of sync conflicts requiring resolution
  async sendSyncConflictNotification(
    userId: string,
    conflicts: SyncConflict[]
  ): Promise<void> {
    const notificationService = new NotificationService();
    await notificationService.scheduleNotification(
      'Action Required: Sync Conflicts',
      `${conflicts.length} item(s) need your attention to complete syncing.`,
      {
        type: 'sync',
        subtype: 'conflict',
        userId,
        conflictCount: conflicts.length
      }
    );
  }
  
  // Notify user of sync failure
  async sendSyncFailureNotification(
    userId: string,
    errorMessage: string
  ): Promise<void> {
    const notificationService = new NotificationService();
    await notificationService.scheduleNotification(
      'Sync Failed',
      `We couldn't sync your data: ${errorMessage}. Please try again.`,
      {
        type: 'sync',
        subtype: 'failure',
        userId,
        errorMessage
      }
    );
  }
  
  // Format sync stats into readable string
  private formatSyncStats(stats: any): string {
    const parts = [];
    
    if (stats.collections > 0) {
      parts.push(`${stats.collections} collection${stats.collections === 1 ? '' : 's'}`);
    }
    
    if (stats.materials > 0) {
      parts.push(`${stats.materials} material${stats.materials === 1 ? '' : 's'}`);
    }
    
    if (stats.achievements > 0) {
      parts.push(`${stats.achievements} achievement${stats.achievements === 1 ? '' : 's'}`);
    }
    
    if (stats.other > 0) {
      parts.push(`${stats.other} other item${stats.other === 1 ? '' : 's'}`);
    }
    
    return parts.join(', ');
  }
}
```

## User Preferences & Controls

### Preference Management

Users need control over notification types and frequency:

1. **Preference Categories**
   - Collection Reminders
   - Achievements & Progress
   - Community Challenges
   - Sync & System Notifications
   - Marketing & Promotions

2. **Granular Controls**
   - Enable/disable specific notification types
   - Set quiet hours
   - Control notification frequency
   - Choose notification channels (push, email, in-app)

3. **Default Settings**
   - Critical operational notifications on by default
   - Non-critical notifications require opt-in
   - Respect system-level notification settings

### Implementation

```typescript
// Example notification preferences implementation
interface NotificationPreferences {
  collections: {
    confirmation: boolean;
    advanceNotice: boolean;
    dayOf: boolean;
    followUp: boolean;
  };
  achievements: {
    unlocked: boolean;
    progress: boolean;
    milestones: boolean;
  };
  challenges: {
    newChallenge: boolean;
    progress: boolean;
    leaderboard: boolean;
    completion: boolean;
  };
  sync: {
    completion: boolean;
    conflicts: boolean;
    failures: boolean;
  };
  marketing: {
    newFeatures: boolean;
    promotions: boolean;
    surveys: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  channels: {
    push: boolean;
    email: boolean;
    inApp: boolean;
  };
}

// Example preferences service
class NotificationPreferencesService {
  // Get user's notification preferences
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    const userService = new UserService();
    const user = await userService.getUserById(userId);
    
    // Return default preferences if not yet set
    if (!user.notificationPreferences) {
      return this.getDefaultPreferences();
    }
    
    return user.notificationPreferences;
  }
  
  // Update user's notification preferences
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const userService = new UserService();
    const currentPrefs = await this.getPreferences(userId);
    
    // Merge with current preferences
    const updatedPrefs = {
      ...currentPrefs,
      ...preferences,
      // Handle nested objects with spread
      collections: { ...currentPrefs.collections, ...(preferences.collections || {}) },
      achievements: { ...currentPrefs.achievements, ...(preferences.achievements || {}) },
      challenges: { ...currentPrefs.challenges, ...(preferences.challenges || {}) },
      sync: { ...currentPrefs.sync, ...(preferences.sync || {}) },
      marketing: { ...currentPrefs.marketing, ...(preferences.marketing || {}) },
      quietHours: { ...currentPrefs.quietHours, ...(preferences.quietHours || {}) },
      channels: { ...currentPrefs.channels, ...(preferences.channels || {}) },
    };
    
    // Save to user profile
    await userService.updateUserPreferences(userId, updatedPrefs);
    
    return updatedPrefs;
  }
  
  // Get default notification preferences
  getDefaultPreferences(): NotificationPreferences {
    return {
      collections: {
        confirmation: true,
        advanceNotice: true,
        dayOf: true,
        followUp: true,
      },
      achievements: {
        unlocked: true,
        progress: true,
        milestones: true,
      },
      challenges: {
        newChallenge: true,
        progress: false,
        leaderboard: true,
        completion: true,
      },
      sync: {
        completion: false,
        conflicts: true,
        failures: true,
      },
      marketing: {
        newFeatures: false,
        promotions: false,
        surveys: false,
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
      channels: {
        push: true,
        email: true,
        inApp: true,
      },
    };
  }
  
  // Check if notification should be sent
  async shouldSendNotification(
    userId: string,
    notificationType: string,
    subType: string
  ): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    
    // Check if in quiet hours
    if (prefs.quietHours.enabled && this.isInQuietHours(prefs.quietHours)) {
      return false;
    }
    
    // Check specific notification type
    switch (notificationType) {
      case 'collection':
        return prefs.collections[subType as keyof typeof prefs.collections] === true;
      case 'achievement':
        return prefs.achievements[subType as keyof typeof prefs.achievements] === true;
      case 'challenge':
        return prefs.challenges[subType as keyof typeof prefs.challenges] === true;
      case 'sync':
        return prefs.sync[subType as keyof typeof prefs.sync] === true;
      case 'marketing':
        return prefs.marketing[subType as keyof typeof prefs.marketing] === true;
      default:
        return true;
    }
  }
  
  // Check if current time is in quiet hours
  private isInQuietHours(quietHours: { enabled: boolean; start: string; end: string }): boolean {
    if (!quietHours.enabled) {
      return false;
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const [startHour, startMinute] = quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);
    
    const currentTime = currentHour * 60 + currentMinute;
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    // Handle case where quiet hours cross midnight
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }
}

// Example preferences screen component
function NotificationPreferencesScreen() {
  const { user } = useUser();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const preferencesService = new NotificationPreferencesService();
  
  useEffect(() => {
    loadPreferences();
  }, [user.id]);
  
  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const prefs = await preferencesService.getPreferences(user.id);
      setPreferences(prefs);
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleSetting = async (category: string, setting: string) => {
    if (!preferences) return;
    
    try {
      // Create update object with nested path
      const update = {
        [category]: {
          ...preferences[category as keyof NotificationPreferences],
          [setting]: !preferences[category as keyof NotificationPreferences][setting as any],
        },
      };
      
      // Update locally for immediate UI feedback
      setPreferences({
        ...preferences,
        ...update,
      });
      
      // Save to server
      await preferencesService.updatePreferences(user.id, update as any);
    } catch (error) {
      // Handle error and revert UI state
      // ...
    }
  };
  
  // Component implementation...
}
```

## Best Practices

### Timing & Frequency

- **Appropriate Timing**: Send notifications at relevant times
- **Avoid Notification Fatigue**: Limit frequency to prevent user annoyance
- **Batch Similar Notifications**: Combine related notifications to reduce interruptions
- **Respect Quiet Hours**: Honor user preferences for do-not-disturb periods

### Content Guidelines

- **Clear and Concise**: Keep notifications brief and to the point
- **Actionable**: Include clear actions users can take
- **Personalized**: Use user's name and relevant context
- **Valuable**: Ensure each notification provides meaningful information
- **Localized**: Support multiple languages based on user preferences

### Technical Considerations

- **Delivery Confirmation**: Track whether notifications were delivered
- **Fallback Channels**: Use in-app notifications when push fails
- **Deep Linking**: Enable direct navigation to relevant screens
- **Token Management**: Properly handle expired or invalid tokens
- **Testing**: Test across different devices and OS versions

### Privacy & Compliance

- **Explicit Consent**: Obtain and respect user notification permissions
- **Transparency**: Clearly communicate how notifications are used
- **Data Minimization**: Only include necessary information in notifications
- **Retention Policy**: Define how long notification data is stored
- **Regulatory Compliance**: Adhere to relevant regulations (GDPR, CCPA, etc.)

## References

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)
- [Android Push Notification Guide](https://developer.android.com/guide/topics/ui/notifiers/notifications)
- [Mobile Push Notification Best Practices](https://www.nngroup.com/articles/push-notification/)

## NPM Installation Report Analysis

## Installation Status: ✅ Successful

The installation of `expo-firebase-analytics@latest` completed successfully with the `--legacy-peer-deps` flag. This means the package is now available in your project.

## Summary

- **Added**: 149 packages
- **Changed**: 4 packages
- **Total packages**: 1346 packages
- **Duration**: 2 minutes

## Warnings Analysis

### Deprecated Packages

Several deprecated packages were installed as dependencies:
- `rimraf@2.4.5` - Older versions no longer supported
- Multiple instances of `glob` (versions 6.0.4, 7.1.6, 8.1.0) - Versions prior to v9 no longer supported
- `uuid@3.4.0` (multiple instances) - Using potentially problematic `Math.random()`
- `@types/detox@18.1.3` - Stub types definition not needed
- `detox-copilot@0.0.27` - Renamed to `@wix-pilot/core`

### Vulnerabilities

The installation resulted in:
- 5 low severity issues
- 3 moderate severity issues
- 8 high severity issues

## Recommendations

1. **Address vulnerabilities**: 
   ```
   npm audit fix --force
   ```
   Note: This might update packages to versions that could break compatibility.

2. **Update specific deprecated packages**:
   ```
   npm install uuid@latest rimraf@latest glob@latest
   npm uninstall detox-copilot
   npm install @wix-pilot/core
   ```

3. **For development purposes only**: If this is just for testing, you may continue using the current setup, but production builds should address these issues.

## Next Steps

1. Complete the Firebase Analytics integration by updating your code to use the installed package:

   ```typescript
   import * as Analytics from 'expo-firebase-analytics';
   
   // Track events
   async function trackEvent() {
     await Analytics.logEvent('button_click', {
       screen: 'home',
       action: 'pressed'
     });
   }
   ```

2. Configure Firebase in your `app.json`:

   ```json
   {
     "expo": {
       "plugins": [
         [
           "expo-firebase-analytics",
           {
             "stripPrefix": "dev-",
             "collectionEnabled": true
           }
         ]
       ]
     }
   }
   ```

3. Test the analytics integration by running your app and triggering some events.

Would you like me to help with any specific part of the Firebase Analytics implementation or address any of the package vulnerabilities?