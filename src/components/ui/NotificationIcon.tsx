/**
 * NotificationIcon.tsx
 * 
 * A header notification icon with badge indicator for unread notifications.
 * Navigates to the notification list screen when pressed.
 */

import { NotificationService } from '@/services/NotificationService';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface NotificationIconProps {
  size?: number;
  color?: string;
}

export default function NotificationIcon({ 
  size = 24, 
  color 
}: NotificationIconProps) {
  const navigation = useNavigation();
  const theme = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  // Get unread count on focus
  useFocusEffect(
    React.useCallback(() => {
      loadUnreadCount();
      
      // Set up a refresh interval while screen is focused
      const intervalId = setInterval(loadUnreadCount, 30000); // refresh every 30 seconds
      
      return () => {
        clearInterval(intervalId);
      };
    }, [])
  );

  // Load unread notifications count
  const loadUnreadCount = async () => {
    try {
      const notificationService = NotificationService.getInstance();
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  // Navigate to notification list
  const handlePress = () => {
    navigation.navigate('NotificationList' as never);
  };

  // Get icon color (use provided color or theme text color)
  const iconColor = color || theme.theme.colors.text;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
    >
      <Ionicons name="notifications-outline" size={size} color={iconColor} />
      
      {unreadCount > 0 && (
        <View 
          style={[
            styles.badge,
            { backgroundColor: theme.theme.colors.primary }
          ]}
        >
          {unreadCount > 9 ? (
            <ThemedText style={styles.badgeText}>9+</ThemedText>
          ) : (
            <ThemedText style={styles.badgeText}>{unreadCount}</ThemedText>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 