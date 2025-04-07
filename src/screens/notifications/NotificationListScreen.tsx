/**
 * NotificationListScreen.tsx
 * 
 * A screen to display the user's notification history.
 * Features:
 * - Displays all notifications with read/unread status
 * - Allows marking notifications as read
 * - Enables clearing all notifications
 * - Supports filtering by notification type
 * - Provides pull-to-refresh functionality
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import NotificationItem from '@/components/notifications/NotificationItem';
import EmptyState from '@/components/ui/EmptyState';
import { ThemedText } from '@/components/ui/ThemedText';
import { NotificationService } from '@/services/NotificationService';
import { useTheme } from '@/theme';
import { Notification } from '@/types/Notification';
import { NotificationCategory } from '@/types/NotificationPreferences';

interface NotificationListScreenProps {
  navigation: any;
}

export default function NotificationListScreen({ navigation }: NotificationListScreenProps) {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<NotificationCategory | 'all'>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const headerHeight = useSharedValue(0);

  // Animation for filter tabs appearing when there are notifications
  const filterContainerStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(headerHeight.value, { duration: 300 }),
      opacity: withTiming(headerHeight.value > 0 ? 1 : 0, { duration: 300 }),
      overflow: 'hidden',
    };
  });

  // Load notifications when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
      return () => {};
    }, [])
  );

  // Update header height based on notification count
  useEffect(() => {
    headerHeight.value = notifications.length > 0 ? 50 : 0;
  }, [notifications.length]);

  // Load notifications
  const loadNotifications = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const notificationService = NotificationService.getInstance();
      const notificationHistory = await notificationService.getNotificationHistory();
      const count = await notificationService.getUnreadCount();
      
      setNotifications(notificationHistory);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadNotifications(true);
  };

  // Mark notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.markNotificationAsRead(id);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id: string) => {
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.deleteNotification(id);
      
      // Update local state
      const updatedNotifications = notifications.filter(notification => notification.id !== id);
      setNotifications(updatedNotifications);
      
      // Recalculate unread count
      const unreadNotifications = updatedNotifications.filter(notification => !notification.read);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Clear all notifications
  const handleClearAll = () => {
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              const notificationService = NotificationService.getInstance();
              await notificationService.clearAllNotifications();
              
              // Update local state
              setNotifications([]);
              setUnreadCount(0);
            } catch (error) {
              console.error('Error clearing notifications:', error);
            }
          }
        }
      ]
    );
  };

  // Navigate to notification preferences
  const navigateToPreferences = () => {
    navigation.navigate('NotificationPreferences');
  };

  // Get filtered notifications
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') {
      return notifications;
    }
    return notifications.filter(notification => notification.category === activeFilter);
  }, [notifications, activeFilter]);

  // Render notification item
  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <NotificationItem
      notification={item}
      onPress={() => handleMarkAsRead(item.id)}
      onDelete={() => handleDeleteNotification(item.id)}
    />
  );

  // Render filter tab
  const renderFilterTab = (filter: NotificationCategory | 'all', label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.filterTab,
        activeFilter === filter && { backgroundColor: theme.theme.colors.primary + '20' }
      ]}
      onPress={() => setActiveFilter(filter)}
    >
      <Ionicons
        name={icon as any}
        size={18}
        color={activeFilter === filter ? theme.theme.colors.primary : theme.theme.colors.text}
      />
      <ThemedText
        style={[
          styles.filterTabText,
          activeFilter === filter && { color: theme.theme.colors.primary, fontWeight: 'bold' }
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.theme.colors.background }]}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
          <TouchableOpacity onPress={navigateToPreferences}>
            <Ionicons name="settings-outline" size={24} color={theme.theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading notifications...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>
          Notifications
          {unreadCount > 0 && (
            <ThemedText style={styles.unreadCount}> ({unreadCount})</ThemedText>
          )}
        </ThemedText>
        <View style={styles.headerActions}>
          {notifications.length > 0 && (
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <ThemedText 
                style={[
                  styles.headerButtonText, 
                  unreadCount === 0 && { opacity: 0.5 },
                  { color: theme.theme.colors.primary }
                ]}
              >
                Mark all read
              </ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={navigateToPreferences}
          >
            <Ionicons name="settings-outline" size={24} color={theme.theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <Animated.View style={[styles.filterContainer, filterContainerStyle]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {renderFilterTab('all', 'All', 'notifications')}
          {renderFilterTab(NotificationCategory.COLLECTION, 'Collection', 'basket')}
          {renderFilterTab(NotificationCategory.DELIVERY, 'Delivery', 'car')}
          {renderFilterTab(NotificationCategory.REWARDS, 'Rewards', 'trophy')}
          {renderFilterTab(NotificationCategory.COMMUNITY, 'Community', 'people')}
          {renderFilterTab(NotificationCategory.SYSTEM, 'System', 'settings')}
        </ScrollView>
      </Animated.View>

      {/* Notification List */}
      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.theme.colors.primary]}
              tintColor={theme.theme.colors.primary}
            />
          }
        />
      ) : (
        <EmptyState
          icon="notifications-off"
          title={
            activeFilter !== 'all' 
              ? `No ${activeFilter} notifications` 
              : notifications.length === 0 
                ? "No notifications yet" 
                : "No matching notifications"
          }
          message={
            activeFilter !== 'all' 
              ? `You don't have any ${activeFilter} notifications.` 
              : "When you receive notifications, they'll appear here."
          }
          action={notifications.length > 0 && activeFilter !== 'all' ? {
            label: "View All Notifications",
            onPress: () => setActiveFilter('all')
          } : undefined}
        />
      )}

      {/* Clear All Button (only shown when there are notifications) */}
      {notifications.length > 0 && (
        <View style={styles.clearAllContainer}>
          <TouchableOpacity
            style={[styles.clearAllButton, { backgroundColor: theme.theme.colors.error + '10' }]}
            onPress={handleClearAll}
          >
            <Ionicons name="trash-outline" size={18} color={theme.theme.colors.error} />
            <ThemedText style={[styles.clearAllText, { color: theme.theme.colors.error }]}>
              Clear All
            </ThemedText>
          </TouchableOpacity>
        </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  unreadCount: {
    fontWeight: 'normal',
    fontSize: 18,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
    padding: 4,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  filtersScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterTabText: {
    fontSize: 14,
    marginLeft: 6,
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  clearAllContainer: {
    padding: 16,
    alignItems: 'center',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearAllText: {
    marginLeft: 8,
    fontWeight: '500',
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
}); 