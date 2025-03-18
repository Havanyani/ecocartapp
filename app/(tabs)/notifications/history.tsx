import { Card } from '@/components/ui/Card';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { notificationHistoryService } from '@/services/NotificationHistoryService';
import { NotificationHistory, NotificationHistoryFilters } from '@/types/NotificationHistory';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationHistoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const isFocused = useIsFocused();
  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [stats, setStats] = useState<{
    total: number;
    unread: number;
    byType: Record<string, number>;
  }>({ total: 0, unread: 0, byType: {} });
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  // Load notification history
  const loadNotifications = useCallback(async (filters?: NotificationHistoryFilters) => {
    try {
      setLoading(true);
      PerformanceMonitor.startBenchmark({
        name: 'notification_history_load',
        includeMemory: true,
        tags: { component: 'NotificationHistory' }
      });
      
      // Get history service instance
      const historyService = notificationHistoryService.getInstance();
      
      // Get notifications with filters
      const data = await historyService.getHistory(filters);
      setNotifications(data);
      
      // Get stats
      const statsData = historyService.getStats();
      setStats({
        total: statsData.total,
        unread: statsData.unread,
        byType: statsData.byType,
      });
      
      PerformanceMonitor.endBenchmark({ 
        name: 'notification_history_load',
        tags: { component: 'NotificationHistory' }
      });
    } catch (error) {
      console.error('Failed to load notification history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load notifications when screen is focused
  useEffect(() => {
    if (isFocused) {
      loadNotifications();
    }
  }, [isFocused, loadNotifications]);

  // Apply filters based on selected type
  const applyFilters = (filterType: string) => {
    setActiveFilter(filterType);
    
    let filters: NotificationHistoryFilters = {};
    
    switch (filterType) {
      case 'unread':
        filters = { read: false };
        break;
      case 'delivery_status':
      case 'location_update':
      case 'route_change':
      case 'collection_update':
        filters = { type: filterType as NotificationHistory['type'] };
        break;
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filters = { startDate: today };
        break;
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filters = { startDate: weekAgo };
        break;
    }
    
    // Apply date range if set
    if (dateRange.startDate) {
      filters.startDate = dateRange.startDate;
    }
    if (dateRange.endDate) {
      filters.endDate = dateRange.endDate;
    }
    
    loadNotifications(filters);
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const historyService = notificationHistoryService.getInstance();
      await historyService.markAsRead(id);
      
      // Refresh notification list
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Handle notification press
  const handleNotificationPress = (notification: NotificationHistory) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type and data
    switch (notification.type) {
      case 'delivery_status':
        if (notification.data?.collectionId) {
          router.push(`/collections/${notification.data.collectionId}`);
        }
        break;
      case 'location_update':
        if (notification.data?.personnelId) {
          router.push(`/delivery-tracking/${notification.data.personnelId}`);
        } else {
          router.push(`/delivery-tracking/${notification.personnelId}`);
        }
        break;
      case 'route_change':
        if (notification.data?.routeId) {
          router.push(`/routes/${notification.data.routeId}`);
        }
        break;
      case 'collection_update':
        if (notification.data?.collectionId) {
          router.push(`/collections/${notification.data.collectionId}`);
        }
        break;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const historyService = notificationHistoryService.getInstance();
      await historyService.markAllAsRead();
      
      // Refresh notification list
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Get icon for notification type
  const getNotificationIcon = (type: NotificationHistory['type']) => {
    switch (type) {
      case 'delivery_status':
        return 'cube';
      case 'location_update':
        return 'location';
      case 'route_change':
        return 'map';
      case 'collection_update':
        return 'refresh-circle';
      default:
        return 'notifications';
    }
  };

  // Render a single notification item
  const renderNotificationItem = ({ item }: { item: NotificationHistory }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && { backgroundColor: `${colors.primary}10` },
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIconContainer}>
        <Ionicons 
          name={getNotificationIcon(item.type)} 
          size={24} 
          color={colors.primary} 
        />
      </View>
      <View style={styles.notificationContent}>
        <ThemedText style={styles.notificationTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.notificationBody}>{item.body}</ThemedText>
        <ThemedText style={styles.notificationTimestamp}>
          {format(new Date(item.timestamp), 'MMM d, yyyy h:mm a')}
        </ThemedText>
      </View>
      {!item.read && (
        <View style={[styles.unreadIndicator, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );

  // Render filter buttons
  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScrollContent}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'all' && { backgroundColor: colors.primary },
          ]}
          onPress={() => applyFilters('all')}
        >
          <ThemedText 
            style={[
              styles.filterText, 
              activeFilter === 'all' && { color: '#FFFFFF' }
            ]}
          >
            All
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'unread' && { backgroundColor: colors.primary },
          ]}
          onPress={() => applyFilters('unread')}
        >
          <ThemedText 
            style={[
              styles.filterText, 
              activeFilter === 'unread' && { color: '#FFFFFF' }
            ]}
          >
            Unread ({stats.unread})
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'today' && { backgroundColor: colors.primary },
          ]}
          onPress={() => applyFilters('today')}
        >
          <ThemedText 
            style={[
              styles.filterText, 
              activeFilter === 'today' && { color: '#FFFFFF' }
            ]}
          >
            Today
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'week' && { backgroundColor: colors.primary },
          ]}
          onPress={() => applyFilters('week')}
        >
          <ThemedText 
            style={[
              styles.filterText, 
              activeFilter === 'week' && { color: '#FFFFFF' }
            ]}
          >
            Last 7 Days
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'delivery_status' && { backgroundColor: colors.primary },
          ]}
          onPress={() => applyFilters('delivery_status')}
        >
          <ThemedText 
            style={[
              styles.filterText, 
              activeFilter === 'delivery_status' && { color: '#FFFFFF' }
            ]}
          >
            Delivery Status
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'location_update' && { backgroundColor: colors.primary },
          ]}
          onPress={() => applyFilters('location_update')}
        >
          <ThemedText 
            style={[
              styles.filterText, 
              activeFilter === 'location_update' && { color: '#FFFFFF' }
            ]}
          >
            Location Updates
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Show empty state when no notifications
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="notifications-off" size={64} color={colors.textSecondary} />
      <ThemedText style={styles.emptyStateTitle}>No Notifications</ThemedText>
      <ThemedText style={styles.emptyStateDescription}>
        You don't have any notifications {activeFilter !== 'all' ? 'matching the current filter' : ''}.
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['right', 'left']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={colors.text} 
            onPress={() => router.back()} 
          />
          <ThemedText style={styles.title}>Notification History</ThemedText>
        </View>
        
        <ThemedText style={styles.subtitle}>
          View and manage your past notifications
        </ThemedText>
      </View>

      {/* Stats summary card */}
      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{stats.total}</ThemedText>
            <ThemedText style={styles.statLabel}>Total</ThemedText>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{stats.unread}</ThemedText>
            <ThemedText style={styles.statLabel}>Unread</ThemedText>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {stats.byType.delivery_status || 0}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Delivery</ThemedText>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {stats.byType.location_update || 0}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Location</ThemedText>
          </View>
        </View>
      </Card>

      {/* Filter bar */}
      {renderFilterButtons()}
      
      {/* Actions */}
      {stats.unread > 0 && (
        <TouchableOpacity 
          style={styles.markAllReadButton}
          onPress={markAllAsRead}
        >
          <Ionicons name="checkmark-done" size={16} color={colors.primary} />
          <ThemedText style={[styles.markAllReadText, { color: colors.primary }]}>
            Mark All as Read
          </ThemedText>
        </TouchableOpacity>
      )}

      {/* Notification list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={styles.loadingText}>Loading notifications...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notificationList}
          ListEmptyComponent={renderEmptyState}
          initialNumToRender={10}
          maxToRenderPerBatch={20}
          windowSize={10}
          removeClippedSubviews
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  statsCard: {
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filtersScrollContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  markAllReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  markAllReadText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  notificationList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  notificationTimestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
}); 