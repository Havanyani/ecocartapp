/**
 * NotificationScreen
 * 
 * Dashboard for viewing and managing all notifications
 */

import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

import Button from '@/components/Button';
import { IconSymbol } from '@/components/IconSymbol';
import ThemedText from '@/components/ThemedText';
import ThemedView from '@/components/ThemedView';
import { NotificationCategory } from '@/src/types/NotificationPreferences';

// Interface for notification item displayed in the list
interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  category: NotificationCategory;
  type: string;
  data: any;
}

export default function NotificationScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>('all');
  
  // Load notifications from service
  const loadNotifications = useCallback(async () => {
    try {
      // Simulate API call to get notifications
      // In a real implementation, this would call an API to get notifications
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dummy data for now
      const dummyNotifications: NotificationItem[] = [
        {
          id: '1',
          title: 'Collection Scheduled',
          body: 'Your collection has been scheduled for tomorrow at 10:00 AM',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
          category: NotificationCategory.COLLECTION,
          type: 'collection-scheduled',
          data: { collectionId: '123' }
        },
        {
          id: '2',
          title: 'Delivery Personnel Assigned',
          body: 'John Doe has been assigned to your collection',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: true,
          category: NotificationCategory.DELIVERY,
          type: 'delivery-personnel-assigned',
          data: { collectionId: '123', personnelId: '456' }
        },
        {
          id: '3',
          title: 'Achievement Unlocked',
          body: 'You have recycled 100kg of materials!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: false,
          category: NotificationCategory.REWARDS,
          type: 'achievement',
          data: { achievementId: '789' }
        },
        {
          id: '4',
          title: 'System Maintenance',
          body: 'The app will be under maintenance tonight from 2 AM to 4 AM',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
          read: true,
          category: NotificationCategory.SYSTEM,
          type: 'system-maintenance',
          data: {}
        },
        {
          id: '5',
          title: 'Community Event',
          body: 'Join our beach cleanup this Saturday at 9 AM',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
          read: false,
          category: NotificationCategory.COMMUNITY,
          type: 'community-event',
          data: { eventId: '101' }
        }
      ];
      
      setNotifications(dummyNotifications);
      
      // Apply filter
      filterNotifications(dummyNotifications, selectedCategory);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory]);
  
  // Filter notifications based on selected category
  const filterNotifications = (notifs: NotificationItem[], category: NotificationCategory | 'all') => {
    if (category === 'all') {
      setFilteredNotifications(notifs);
    } else {
      setFilteredNotifications(notifs.filter(n => n.category === category));
    }
  };
  
  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadNotifications();
  }, [loadNotifications]);
  
  // Handle category filter change
  const handleCategoryChange = (category: NotificationCategory | 'all') => {
    setSelectedCategory(category);
    filterNotifications(notifications, category);
  };
  
  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      
      // Update filtered notifications
      setFilteredNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      
      // In real implementation, would call API to mark as read
      // await apiService.post('/notifications/mark-read', { id });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);
  
  // Handle notification tap
  const handleNotificationTap = useCallback((notification: NotificationItem) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'collection-scheduled':
      case 'collection-status-change':
        router.push(`/collection/${notification.data.collectionId}`);
        break;
      case 'delivery-personnel-assigned':
        router.push(`/personnel/${notification.data.personnelId}`);
        break;
      case 'achievement':
        router.push(`/rewards/achievements/${notification.data.achievementId}`);
        break;
      case 'community-event':
        router.push(`/community/events/${notification.data.eventId}`);
        break;
      default:
        // Just view the notification details
        router.push(`/notifications/${notification.id}`);
    }
  }, [router, markAsRead]);
  
  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setFilteredNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      // In real implementation, would call API to mark all as read
      // await apiService.post('/notifications/mark-all-read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);
  
  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);
  
  // Render notification item
  const renderNotificationItem = ({ item }: { item: NotificationItem }) => {
    const formattedDate = formatTimestamp(item.timestamp);
    
    return (
      <TouchableOpacity
        style={[styles.notificationItem, item.read ? styles.readNotification : styles.unreadNotification]}
        onPress={() => handleNotificationTap(item)}
      >
        <View style={styles.notificationContent}>
          <View style={styles.iconAndTitle}>
            {renderCategoryIcon(item.category)}
            <ThemedText style={[styles.notificationTitle, !item.read && styles.unreadText]}>{item.title}</ThemedText>
          </View>
          <ThemedText style={styles.notificationBody}>{item.body}</ThemedText>
          <ThemedText style={styles.notificationTime}>{formattedDate}</ThemedText>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Format timestamp relative to now
  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return days === 1 ? 'Yesterday' : `${days} days ago`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'Just now';
    }
  };
  
  // Render category icon
  const renderCategoryIcon = (category: NotificationCategory) => {
    let iconName: string;
    let iconColor: string;
    
    switch (category) {
      case NotificationCategory.COLLECTION:
        iconName = 'recycle';
        iconColor = '#4CAF50'; // Green
        break;
      case NotificationCategory.DELIVERY:
        iconName = 'truck';
        iconColor = '#2196F3'; // Blue
        break;
      case NotificationCategory.REWARDS:
        iconName = 'trophy';
        iconColor = '#FFC107'; // Amber
        break;
      case NotificationCategory.SYSTEM:
        iconName = 'cog';
        iconColor = '#9E9E9E'; // Gray
        break;
      case NotificationCategory.COMMUNITY:
        iconName = 'users';
        iconColor = '#FF5722'; // Deep Orange
        break;
      default:
        iconName = 'bell';
        iconColor = '#9E9E9E'; // Gray
    }
    
    return (
      <View style={[styles.categoryIcon, { backgroundColor: `${iconColor}20` }]}>
        <IconSymbol name={iconName} size={18} color={iconColor} />
      </View>
    );
  };
  
  // Render category filters
  const renderCategoryFilters = () => {
    const categories: (NotificationCategory | 'all')[] = [
      'all',
      NotificationCategory.COLLECTION,
      NotificationCategory.DELIVERY,
      NotificationCategory.REWARDS,
      NotificationCategory.SYSTEM,
      NotificationCategory.COMMUNITY
    ];
    
    const getCategoryLabel = (category: NotificationCategory | 'all'): string => {
      switch (category) {
        case 'all':
          return 'All';
        case NotificationCategory.COLLECTION:
          return 'Collection';
        case NotificationCategory.DELIVERY:
          return 'Delivery';
        case NotificationCategory.REWARDS:
          return 'Rewards';
        case NotificationCategory.SYSTEM:
          return 'System';
        case NotificationCategory.COMMUNITY:
          return 'Community';
        default:
          return '';
      }
    };
    
    return (
      <View style={styles.categoryFilters}>
        <FlatList
          horizontal
          data={categories}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryFilterButton,
                selectedCategory === item && styles.selectedCategoryButton
              ]}
              onPress={() => handleCategoryChange(item)}
            >
              <ThemedText
                style={[
                  styles.categoryFilterText,
                  selectedCategory === item && styles.selectedCategoryText
                ]}
              >
                {getCategoryLabel(item)}
              </ThemedText>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };
  
  // Render empty list message
  const renderEmptyList = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" />
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <IconSymbol name="bell-slash" size={50} color="#9E9E9E" />
        <ThemedText style={styles.emptyText}>No notifications</ThemedText>
        {selectedCategory !== 'all' && (
          <ThemedText style={styles.emptySubtext}>
            You don't have any {selectedCategory} notifications
          </ThemedText>
        )}
        <Button 
          title="Refresh" 
          onPress={handleRefresh} 
          variant="outlined"
          style={styles.refreshButton}
        />
      </View>
    );
  };
  
  // Render header buttons
  const renderHeaderButtons = () => (
    <View style={styles.headerButtons}>
      <Button
        title="Mark All Read"
        onPress={markAllAsRead}
        variant="text"
        size="small"
        style={styles.markAllReadButton}
      />
      <Button
        title="Settings"
        onPress={() => router.push('/notifications/settings')}
        variant="text"
        size="small"
        style={styles.settingsButton}
      />
    </View>
  );
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerTitle: 'Notifications',
          headerRight: () => renderHeaderButtons()
        }} 
      />
      
      {renderCategoryFilters()}
      
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  markAllReadButton: {
    marginRight: 8,
  },
  settingsButton: {},
  categoryFilters: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  selectedCategoryButton: {
    backgroundColor: '#2196F3',
  },
  categoryFilterText: {
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  readNotification: {
    backgroundColor: 'transparent',
  },
  unreadNotification: {
    backgroundColor: '#E3F2FD',
  },
  notificationContent: {
    flex: 1,
  },
  iconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  unreadText: {
    fontWeight: '700',
  },
  notificationBody: {
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 40,
  },
  notificationTime: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 32,
    color: '#757575',
  },
  refreshButton: {
    marginTop: 16,
  },
}); 