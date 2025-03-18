import { useTheme } from '@/hooks/useTheme';
import { NotificationCategory, NotificationHistoryItem, notificationService } from '@/services/NotificationService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { format, isThisWeek, isToday, isYesterday } from 'date-fns';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Tab item for notification categories
 */
interface CategoryTab {
  category: NotificationCategory | 'all';
  label: string;
  icon: string;
  count: number;
}

/**
 * NotificationHistoryScreen - Displays the user's notification history
 * with filtering by category and read/unread status.
 */
export default function NotificationHistoryScreen() {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>('all');
  const [categories, setCategories] = useState<CategoryTab[]>([
    { category: 'all', label: 'All', icon: 'notifications', count: 0 },
    { category: NotificationCategory.COLLECTION, label: 'Collections', icon: 'trash', count: 0 },
    { category: NotificationCategory.ACHIEVEMENT, label: 'Achievements', icon: 'trophy', count: 0 },
    { category: NotificationCategory.TIP, label: 'Tips', icon: 'bulb', count: 0 },
    { category: NotificationCategory.REMINDER, label: 'Reminders', icon: 'alarm', count: 0 },
    { category: NotificationCategory.PROMOTION, label: 'Promotions', icon: 'gift', count: 0 },
  ]);
  
  // Load notifications when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
      return () => {
        // Cleanup if needed
      };
    }, [selectedCategory])
  );
  
  // Initial load
  useEffect(() => {
    loadNotifications();
  }, []);
  
  /**
   * Load notifications from the notification service
   */
  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Load notifications for the selected category
      const options = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const notificationHistory = await notificationService.getNotificationHistory(options);
      setNotifications(notificationHistory);
      
      // Update category counts
      updateCategoryCounts();
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  /**
   * Update the count for each category tab
   */
  const updateCategoryCounts = async () => {
    try {
      // Get total unread count
      const totalUnread = await notificationService.getUnreadCount();
      
      // Get count for each category
      const updatedCategories = await Promise.all(
        categories.map(async (category) => {
          if (category.category === 'all') {
            return { ...category, count: totalUnread };
          } else {
            const count = await notificationService.getUnreadCount(category.category);
            return { ...category, count };
          }
        })
      );
      
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Failed to update category counts:', error);
    }
  };
  
  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };
  
  /**
   * Mark a notification as read
   */
  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    
    // Update the notification list
    setNotifications(notifications.map(notification => {
      if (notification.id === id) {
        return { ...notification, isRead: true };
      }
      return notification;
    }));
    
    // Update category counts
    updateCategoryCounts();
  };
  
  /**
   * Mark all notifications as read
   */
  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    
    // Update the notification list
    setNotifications(notifications.map(notification => {
      return { ...notification, isRead: true };
    }));
    
    // Update category counts
    updateCategoryCounts();
  };
  
  /**
   * Format the timestamp of a notification
   */
  const formatTimestamp = (date: Date): string => {
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE, h:mm a');
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };
  
  /**
   * Get icon for notification category
   */
  const getCategoryIcon = (category: NotificationCategory): string => {
    const tab = categories.find(t => t.category === category);
    return tab ? tab.icon : 'notifications';
  };
  
  /**
   * Render a notification item
   */
  const renderNotificationItem = ({ item }: { item: NotificationHistoryItem }) => {
    const isUnread = !item.isRead;
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { backgroundColor: isUnread ? theme.colors.cardUnread : theme.colors.card }
        ]}
        onPress={() => handleMarkAsRead(item.id)}
      >
        <View style={styles.notificationIcon}>
          <Ionicons
            name={getCategoryIcon(item.category)}
            size={24}
            color={theme.colors.primary}
          />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[styles.notificationTitle, { color: theme.colors.text.primary }]}>
              {item.title}
            </Text>
            <Text style={[styles.notificationTime, { color: theme.colors.text.secondary }]}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
          <Text 
            style={[styles.notificationBody, { color: theme.colors.text.primary }]}
            numberOfLines={2}
          >
            {item.body}
          </Text>
          {isUnread && (
            <View style={[styles.unreadIndicator, { backgroundColor: theme.colors.primary }]} />
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  /**
   * Render a category tab
   */
  const renderCategoryTab = (tab: CategoryTab) => {
    const isSelected = selectedCategory === tab.category;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryTab,
          isSelected && [styles.selectedTab, { borderColor: theme.colors.primary }]
        ]}
        onPress={() => setSelectedCategory(tab.category)}
      >
        <Ionicons
          name={tab.icon as any}
          size={20}
          color={isSelected ? theme.colors.primary : theme.colors.text.secondary}
        />
        <Text
          style={[
            styles.categoryLabel,
            { color: isSelected ? theme.colors.primary : theme.colors.text.secondary }
          ]}
        >
          {tab.label}
        </Text>
        {tab.count > 0 && (
          <View style={[styles.badgeContainer, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.badgeText}>{tab.count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  /**
   * Render empty state when no notifications
   */
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
            Loading notifications...
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="notifications-off"
          size={64}
          color={theme.colors.text.secondary}
        />
        <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
          No notifications
        </Text>
        <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
          You don't have any notifications in this category yet.
        </Text>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Notifications
        </Text>
        {notifications.some(n => !n.isRead) && (
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={[styles.markAllText, { color: theme.colors.primary }]}>
              Mark all as read
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Category tabs */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={({ item }) => renderCategoryTab(item)}
          keyExtractor={(item) => item.category}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsContent}
        />
      </View>
      
      {/* Notification list */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationListContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={renderEmptyState}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  selectedTab: {
    borderWidth: 2,
  },
  categoryLabel: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  badgeContainer: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notificationListContent: {
    padding: 16,
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadIndicator: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 6,
    right: -20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 260,
  },
}); 