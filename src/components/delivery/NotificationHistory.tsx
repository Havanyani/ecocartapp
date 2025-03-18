import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { notificationHistoryService } from '@/services/NotificationHistoryService';
import { NotificationHistory as NotificationHistoryType } from '@/types/NotificationHistory';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

interface NotificationHistoryProps {
  personnelId?: string;
  onNotificationPress?: (notification: NotificationHistoryType) => void;
}

export function NotificationHistory({ personnelId, onNotificationPress }: NotificationHistoryProps) {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<NotificationHistoryType[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(notificationHistoryService.getStats());

  useEffect(() => {
    loadNotifications();
  }, [personnelId]);

  const loadNotifications = async () => {
    const filters = personnelId ? { personnelId } : undefined;
    const history = notificationHistoryService.getNotifications(filters);
    setNotifications(history);
    setStats(notificationHistoryService.getStats());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: NotificationHistoryType) => {
    if (!notification.read) {
      await notificationHistoryService.markAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
      setStats(notificationHistoryService.getStats());
    }
    onNotificationPress?.(notification);
  };

  const getNotificationIcon = (type: NotificationHistoryType['type']) => {
    switch (type) {
      case 'delivery_status':
        return 'truck-delivery';
      case 'location_update':
        return 'map-marker';
      case 'route_change':
        return 'route';
      case 'collection_update':
        return 'recycle';
      default:
        return 'bell';
    }
  };

  const renderNotification = ({ item }: { item: NotificationHistoryType }) => (
    <TouchableOpacity
      testID="notification-item"
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification,
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <IconSymbol
          name={getNotificationIcon(item.type)}
          size={24}
          color={colors.primary}
        />
        <View style={styles.notificationText}>
          <ThemedText style={styles.notificationTitle}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.notificationBody}>
            {item.body}
          </ThemedText>
          <ThemedText style={styles.notificationTime}>
            {format(item.timestamp, 'MMM d, yyyy h:mm a')}
          </ThemedText>
        </View>
      </View>
      {!item.read && (
        <View 
          testID="unread-indicator"
          style={[styles.unreadDot, { backgroundColor: colors.primary }]} 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Notification History</ThemedText>
        <View style={styles.stats}>
          <ThemedText style={styles.statsText}>
            {stats.unread} unread
          </ThemedText>
        </View>
      </View>

      <FlatList
        testID="notification-list"
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              No notifications yet
            </ThemedText>
          </ThemedView>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  stats: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statsText: {
    fontSize: 14,
    opacity: 0.7,
  },
  list: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    marginBottom: 12,
  },
  unreadNotification: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  notificationContent: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.5,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.7,
  },
}); 