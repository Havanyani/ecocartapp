/**
 * CollectionStatusScreen.tsx
 * 
 * Screen for tracking collection status with platform-specific implementations.
 */

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Text } from '@/components/ui/Text';
import { useCollection } from '@/contexts/CollectionContext';
import { useTheme } from '@/hooks/useTheme';
import { CollectionItem } from '@/types/collections';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function CollectionStatusScreen() {
  const navigation = useNavigation();
  const { collections, isLoading, error, refreshCollections } = useCollection();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Check if notifications are enabled
  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(status === 'granted');
  };

  // Request notification permissions
  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationsEnabled(status === 'granted');
    
    if (status === 'granted') {
      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
      
      // Schedule a test notification
      await scheduleTestNotification();
    }
  };

  // Schedule a test notification
  const scheduleTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "EcoCart Notification",
        body: "You've successfully enabled notifications for collection updates!",
        data: { screen: 'CollectionStatus' },
      },
      trigger: { seconds: 2 },
    });
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCollections();
    setRefreshing(false);
    
    // Provide haptic feedback on refresh
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return theme.colors.info;
      case 'in_progress':
        return theme.colors.warning;
      case 'completed':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'calendar-clock';
      case 'in_progress':
        return 'truck-fast';
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  // Handle collection press
  const handleCollectionPress = (collection: CollectionItem) => {
    // Provide haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    navigation.navigate('CollectionDetails', { collectionId: collection.id });
  };

  // Handle track driver press
  const handleTrackDriverPress = (collection: CollectionItem) => {
    // Provide haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    navigation.navigate('DriverTracking', { collectionId: collection.id });
  };

  // Handle cancel collection
  const handleCancelCollection = async (collection: CollectionItem) => {
    // Provide haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    Alert.alert(
      'Cancel Collection',
      'Are you sure you want to cancel this collection?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real app, you would call a service to cancel the collection
              Alert.alert('Success', 'Collection cancelled successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel collection');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text variant="h1" style={styles.title}>Collection Status</Text>
        
        {!notificationsEnabled && (
          <Card style={styles.notificationCard}>
            <View style={styles.notificationContent}>
              <IconSymbol name="bell" size={24} color={theme.colors.primary} />
              <View style={styles.notificationText}>
                <Text style={styles.notificationTitle}>Enable Notifications</Text>
                <Text style={styles.notificationDescription}>
                  Get real-time updates about your collection status
                </Text>
              </View>
              <Button
                variant="primary"
                onPress={requestNotificationPermissions}
                style={styles.notificationButton}
              >
                Enable
              </Button>
            </View>
          </Card>
        )}
        
        {collections.length === 0 ? (
          <Card style={styles.emptyCard}>
            <IconSymbol name="recycle" size={48} color={theme.colors.text} />
            <Text style={styles.emptyText}>
              You don't have any collections scheduled.
            </Text>
            <Button
              variant="primary"
              onPress={() => navigation.navigate('ScheduleCollection')}
              style={styles.scheduleButton}
            >
              Schedule a Collection
            </Button>
          </Card>
        ) : (
          collections.map((collection) => (
            <Card
              key={collection.id}
              style={styles.collectionCard}
              onPress={() => handleCollectionPress(collection)}
            >
              <View style={styles.collectionHeader}>
                <View style={styles.collectionInfo}>
                  <Text style={styles.collectionDate}>
                    {formatDate(collection.scheduledDate)}
                  </Text>
                  <Text style={styles.collectionWeight}>
                    Est. Weight: {collection.estimatedWeight} kg
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(collection.status) },
                  ]}
                >
                  <IconSymbol
                    name={getStatusIcon(collection.status)}
                    size={16}
                    color="white"
                  />
                  <Text style={styles.statusText}>
                    {collection.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.collectionActions}>
                {collection.status === 'in_progress' && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleTrackDriverPress(collection)}
                  >
                    <IconSymbol
                      name="map-marker"
                      size={20}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.actionText}>Track Driver</Text>
                  </TouchableOpacity>
                )}
                
                {collection.status === 'scheduled' && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleCancelCollection(collection)}
                  >
                    <IconSymbol
                      name="close"
                      size={20}
                      color={theme.colors.error}
                    />
                    <Text style={[styles.actionText, { color: theme.colors.error }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleCollectionPress(collection)}
                >
                  <IconSymbol
                    name="information"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.actionText}>Details</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  notificationCard: {
    marginBottom: 16,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
  },
  notificationButton: {
    minWidth: 80,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  scheduleButton: {
    minWidth: 200,
  },
  collectionCard: {
    marginBottom: 16,
    padding: 16,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  collectionWeight: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  collectionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#4CAF50',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
}); 