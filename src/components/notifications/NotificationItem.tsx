/**
 * NotificationItem.tsx
 * 
 * Component to display an individual notification in the NotificationList.
 * Features:
 * - Visual indication of read/unread status
 * - Displays notification time in relative format
 * - Category-specific icons
 * - Swipe-to-delete functionality
 */

import { Ionicons } from '@expo/vector-icons';
import { format, formatDistance } from 'date-fns';
import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/theme';
import { Notification } from '@/types/Notification';
import { NotificationCategory } from '@/types/NotificationPreferences';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
  onDelete: () => void;
}

export default function NotificationItem({ notification, onPress, onDelete }: NotificationItemProps) {
  const theme = useTheme();
  
  // Get category icon based on notification category
  const getCategoryIcon = useCallback((category?: NotificationCategory) => {
    switch (category) {
      case NotificationCategory.COLLECTION:
        return 'basket';
      case NotificationCategory.DELIVERY:
        return 'car';
      case NotificationCategory.REWARDS:
        return 'trophy';
      case NotificationCategory.COMMUNITY:
        return 'people';
      case NotificationCategory.SYSTEM:
        return 'settings';
      default:
        return 'notifications';
    }
  }, []);
  
  // Get formatted time
  const getFormattedTime = useCallback((timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      
      // Check if it's today
      if (date.toDateString() === now.toDateString()) {
        return format(date, 'h:mm a'); // Today at 10:23 AM
      }
      
      // Check if it's yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      
      // Check if it's within the last week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      if (date >= oneWeekAgo) {
        return formatDistance(date, now, { addSuffix: true });
      }
      
      // Otherwise, show date
      return format(date, 'MMM d');
    } catch (e) {
      return '';
    }
  }, []);
  
  // Render right actions (delete)
  const renderRightActions = useCallback(() => {
    return (
      <TouchableOpacity
        style={[styles.deleteAction, { backgroundColor: theme.theme.colors.error }]}
        onPress={onDelete}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
      </TouchableOpacity>
    );
  }, [onDelete, theme.theme.colors.error]);

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
    >
      <TouchableOpacity
        style={[
          styles.container,
          { backgroundColor: notification.read ? 'transparent' : theme.theme.colors.primary + '10' },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Unread indicator */}
        {!notification.read && (
          <View style={[styles.unreadIndicator, { backgroundColor: theme.theme.colors.primary }]} />
        )}
        
        {/* Icon */}
        <View 
          style={[
            styles.iconContainer, 
            { 
              backgroundColor: notification.read 
                ? theme.theme.colors.border + '50'
                : theme.theme.colors.primary + '20'
            }
          ]}
        >
          <Ionicons
            name={getCategoryIcon(notification.category) as any}
            size={20}
            color={notification.read ? theme.theme.colors.text : theme.theme.colors.primary}
          />
        </View>
        
        {/* Content */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <ThemedText 
              style={[
                styles.title,
                notification.read ? styles.readTitle : styles.unreadTitle
              ]}
              numberOfLines={1}
            >
              {notification.title}
            </ThemedText>
            <ThemedText style={styles.time}>
              {getFormattedTime(notification.createdAt)}
            </ThemedText>
          </View>
          
          <ThemedText 
            style={styles.body}
            numberOfLines={2}
          >
            {notification.body}
          </ThemedText>
          
          {/* Optional meta information */}
          {notification.data && Object.keys(notification.data).length > 0 && (
            <NotificationMeta notification={notification} />
          )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

// Component to render meta information based on notification type
function NotificationMeta({ notification }: { notification: Notification }) {
  const theme = useTheme();
  
  // Collection status notification
  if (notification.category === NotificationCategory.COLLECTION && notification.data?.status) {
    return (
      <View style={styles.metaContainer}>
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(notification.data.status, theme) }
          ]}
        >
          <ThemedText style={styles.statusText}>
            {notification.data.status}
          </ThemedText>
        </View>
      </View>
    );
  }
  
  // Rewards notification with points
  if (notification.category === NotificationCategory.REWARDS && notification.data?.points) {
    return (
      <View style={styles.metaContainer}>
        <View 
          style={[
            styles.pointsBadge, 
            { backgroundColor: theme.theme.colors.success + '20' }
          ]}
        >
          <Ionicons name="leaf" size={14} color={theme.theme.colors.success} />
          <ThemedText 
            style={[styles.pointsText, { color: theme.theme.colors.success }]}
          >
            +{notification.data.points} points
          </ThemedText>
        </View>
      </View>
    );
  }
  
  return null;
}

// Helper function to get status color
function getStatusColor(status: string, theme: any): string {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return theme.theme.colors.primary + '60';
    case 'in progress':
      return theme.theme.colors.warning + '60';
    case 'completed':
      return theme.theme.colors.success + '60';
    case 'cancelled':
      return theme.theme.colors.error + '60';
    default:
      return theme.theme.colors.border;
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  unreadIndicator: {
    position: 'absolute',
    left: 4,
    top: '50%',
    marginTop: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  readTitle: {
    fontWeight: '400',
  },
  time: {
    fontSize: 12,
    opacity: 0.6,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  metaContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteAction: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 