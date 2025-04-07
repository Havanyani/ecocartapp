/**
 * NotificationCenterScreen.tsx
 * 
 * A central hub for viewing and managing all app notifications.
 * Features:
 * - View all notifications
 * - Filter by category
 * - Mark as read/unread
 * - Delete notifications
 */

import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { NotificationService } from '@/services/NotificationService';
import { useTheme } from '@/theme';
import { Notification } from '@/types/Notification';
import { NotificationCategory } from '@/types/NotificationPreferences';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NotificationCenterScreenProps {
  navigation: any;
}

export default function NotificationCenterScreen({ navigation }: NotificationCenterScreenProps) {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
  });

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // In a real app, this would fetch from API or local storage
      const notificationService = NotificationService.getInstance();
      const notificationHistory = await notificationService.getNotificationHistory();
      
      setNotifications(notificationHistory);
      updateFilteredNotifications(notificationHistory, selectedCategory);
      
      // Calculate stats
      const unreadCount = notificationHistory.filter(n => !n.read).length;
      setStats({
        total: notificationHistory.length,
        unread: unreadCount,
      });
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  // Refresh notifications
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Filter notifications when category changes
  const updateFilteredNotifications = (allNotifications: Notification[], category: NotificationCategory | 'all') => {
    if (category === 'all') {
      setFilteredNotifications(allNotifications);
    } else {
      setFilteredNotifications(allNotifications.filter(n => n.category === category));
    }
  };

  // Handle category selection
  const handleCategoryChange = (category: NotificationCategory | 'all') => {
    setSelectedCategory(category);
    updateFilteredNotifications(notifications, category);
  };

  // Handle notification tap
  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      // Mark as read
      const notificationService = NotificationService.getInstance();
      await notificationService.markNotificationAsRead(notification.id);
      
      // Update local state
      const updatedNotifications = notifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      );
      setNotifications(updatedNotifications);
      updateFilteredNotifications(updatedNotifications, selectedCategory);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        unread: prev.unread - 1,
      }));
    }
    
    // Handle notification action based on type
    if (notification.data?.actionType && notification.data?.actionId) {
      switch (notification.data.actionType) {
        case 'openCollection':
          navigation.navigate('CollectionDetail', { collectionId: notification.data.actionId });
          break;
        case 'openMaterial':
          navigation.navigate('MaterialDetail', { materialId: notification.data.actionId });
          break;
        case 'openAchievement':
          navigation.navigate('Achievements');
          break;
        default:
          // No specific action
          break;
      }
    }
  };

  // Delete a notification
  const handleDeleteNotification = async (notification: Notification) => {
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.deleteNotification(notification.id);
      
      // Update local state
      const updatedNotifications = notifications.filter(n => n.id !== notification.id);
      setNotifications(updatedNotifications);
      updateFilteredNotifications(updatedNotifications, selectedCategory);
      
      // Update stats
      setStats(prev => ({
        total: prev.total - 1,
        unread: notification.read ? prev.unread : prev.unread - 1,
      }));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.clearAllNotifications();
      
      // Update local state
      setNotifications([]);
      setFilteredNotifications([]);
      
      // Update stats
      setStats({
        total: 0,
        unread: 0,
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.markAllNotificationsAsRead();
      
      // Update local state
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updatedNotifications);
      updateFilteredNotifications(updatedNotifications, selectedCategory);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        unread: 0,
      }));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Get icon for notification category
  const getNotificationIcon = (category: NotificationCategory): string => {
    switch (category) {
      case NotificationCategory.COLLECTION:
        return 'basket';
      case NotificationCategory.DELIVERY:
        return 'car';
      case NotificationCategory.SYSTEM:
        return 'settings';
      case NotificationCategory.REWARDS:
        return 'trophy';
      case NotificationCategory.COMMUNITY:
        return 'people';
      default:
        return 'notifications';
    }
  };

  // Render a notification item
  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && { backgroundColor: `${theme.theme.colors.primary}10` }
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIconContainer}>
        <View 
          style={[
            styles.iconCircle,
            { backgroundColor: `${theme.theme.colors.primary}20` }
          ]}
        >
          <Ionicons 
            name={getNotificationIcon(item.category)}
            size={22}
            color={theme.theme.colors.primary}
          />
        </View>
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <ThemedText style={styles.notificationTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.notificationTime}>
            {format(new Date(item.createdAt), 'MMM d, h:mm a')}
          </ThemedText>
        </View>
        
        <ThemedText style={styles.notificationBody} numberOfLines={2}>
          {item.body}
        </ThemedText>
        
        <View style={styles.notificationFooter}>
          {item.category && (
            <View 
              style={[
                styles.categoryBadge,
                { backgroundColor: `${theme.theme.colors.primary}20` }
              ]}
            >
              <ThemedText style={styles.categoryText}>
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteNotification(item)}
      >
        <Ionicons name="trash-outline" size={18} color={theme.theme.colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Category filter tabs
  const renderCategoryTabs = () => {
    const categories = [
      { id: 'all', label: 'All' },
      { id: NotificationCategory.COLLECTION, label: 'Collection' },
      { id: NotificationCategory.DELIVERY, label: 'Delivery' },
      { id: NotificationCategory.SYSTEM, label: 'System' },
      { id: NotificationCategory.REWARDS, label: 'Rewards' },
      { id: NotificationCategory.COMMUNITY, label: 'Community' },
    ];
    
    return (
      <View style={styles.categoryTabs}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryTab,
                selectedCategory === item.id && {
                  backgroundColor: theme.theme.colors.primary,
                }
              ]}
              onPress={() => handleCategoryChange(item.id as any)}
            >
              <ThemedText
                style={[
                  styles.categoryTabText,
                  selectedCategory === item.id && { color: '#FFFFFF' }
                ]}
              >
                {item.label}
              </ThemedText>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryTabsContent}
        />
      </View>
    );
  };
  
  // Empty state
  const renderEmptyState = () => {
    if (isLoading) return null;
    
    return (
      <ThemedView style={styles.emptyContainer}>
        <Ionicons name="notifications-off" size={64} color={theme.theme.colors.border} />
        <ThemedText style={styles.emptyTitle}>No Notifications</ThemedText>
        <ThemedText style={styles.emptyText}>
          {selectedCategory === 'all'
            ? "You don't have any notifications yet."
            : `You don't have any ${selectedCategory} notifications.`}
        </ThemedText>
      </ThemedView>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.theme.colors.background }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.theme.colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
        </View>
        
        <View style={styles.headerButtons}>
          {stats.unread > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleMarkAllAsRead}
            >
              <Ionicons name="checkmark-done" size={22} color={theme.theme.colors.text} />
            </TouchableOpacity>
          )}
          
          {stats.total > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleClearAll}
            >
              <Ionicons name="trash-outline" size={22} color={theme.theme.colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </ThemedView>
      
      {/* Stats Bar */}
      <ThemedView style={styles.statsBar}>
        <ThemedText style={styles.statText}>
          {stats.total} {stats.total === 1 ? 'notification' : 'notifications'}
        </ThemedText>
        {stats.unread > 0 && (
          <View 
            style={[styles.unreadBadge, { backgroundColor: theme.theme.colors.primary }]}
          >
            <ThemedText style={styles.unreadText}>
              {stats.unread} unread
            </ThemedText>
          </View>
        )}
      </ThemedView>
      
      {/* Category Tabs */}
      {renderCategoryTabs()}
      
      {/* Notifications List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading notifications...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notificationsList}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              colors={[theme.theme.colors.primary]}
              tintColor={theme.theme.colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  statText: {
    fontSize: 14,
  },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryTabs: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notificationsList: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  notificationIconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  notificationBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
  },
}); 