import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../src/components/ui/Button';
import { ThemedText } from '../../../src/components/ui/ThemedText';
import { useTheme } from '../../../src/hooks/useTheme';
import { notificationService } from '../../../src/services/NotificationService';
import { WebSocketService } from '../../../src/services/WebSocketService';
import { useAppSelector } from '../../../src/store';
import { Collection } from '../../../src/types/Collection';

export default function CollectionDetailsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params?.id as string;
  const collections = useAppSelector((state) => state.collection.collections) as Collection[];
  const [hasDeliveryPersonnel, setHasDeliveryPersonnel] = useState(false);
  
  // Safety check for invalid or undefined ID
  useEffect(() => {
    if (!id) {
      router.replace('/collections');
    }
  }, [id]);

  // Check if delivery personnel is assigned
  useEffect(() => {
    if (id) {
      const checkPersonnel = async () => {
        try {
          // For demo purposes, we'll simulate having personnel for collections that are in_progress
          // In a real app, this would come from an API call or WebSocket
          const collection = collections.find(c => c.id === id);
          if (collection && collection.status === 'in_progress') {
            setHasDeliveryPersonnel(true);
          }

          // You would normally do something like this:
          // WebSocketService.sendMessage('check_personnel_assignment', { collectionId: id });
          // WebSocketService.subscribe('personnel_assignment', (data) => {
          //   if (data.collectionId === id) {
          //     setHasDeliveryPersonnel(!!data.personnelId);
          //   }
          // });
        } catch (error) {
          console.error('Error checking personnel assignment:', error);
        }
      };

      checkPersonnel();
    }
  }, [id, collections]);
  
  // Find collection by ID, with type safety
  const collection = id ? collections.find(c => c.id === id) : undefined;

  // Handle missing collection cases
  if (!id || !collection) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <ThemedText variant="h1">Collection Not Found</ThemedText>
          <ThemedText variant="body" style={styles.errorDetail}>
            {!id ? 'No collection ID specified.' : `Collection with ID "${id}" was not found.`}
          </ThemedText>
          <Button
            onPress={() => router.replace('/collections')}
            variant="primary"
            style={styles.button}
          >
            Go to Collections
          </Button>
          <Button
            onPress={() => router.back()}
            variant="outline"
            style={styles.button}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  const getStatusColor = () => {
    switch (collection.status) {
      case 'completed':
        return colors.primary;
      case 'in_progress':
        return colors.secondary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const canTrack = collection.status === 'confirmed' || collection.status === 'in_progress';
  const canTrackPersonnel = hasDeliveryPersonnel && collection.status === 'in_progress';

  // Function to enable real-time updates for this collection
  const enableRealTimeUpdates = () => {
    // Subscribe to updates for this collection
    WebSocketService.sendMessage('subscribe_collection_updates', { 
      collectionId: collection.id 
    }).catch(err => {
      console.error('Error subscribing to updates:', err);
    });
    
    // Enable notifications for collection updates
    notificationService.updatePreferences({
      collectionUpdates: true,
      collectionStatusChanges: true
    }).catch(err => {
      console.error('Error updating notification preferences:', err);
    });
  };

  // Enable real-time updates when viewing collection details
  useEffect(() => {
    enableRealTimeUpdates();
    
    // Clean up subscription when leaving screen
    return () => {
      WebSocketService.sendMessage('unsubscribe_collection_updates', { 
        collectionId: collection.id 
      }).catch(err => {
        console.error('Error unsubscribing from updates:', err);
      });
    };
  }, [collection.id]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor() + '20' },
            ]}
          >
            <ThemedText
              variant="body"
              style={[styles.statusText, { color: getStatusColor() }]}
            >
              {collection.status.replace('_', ' ').toUpperCase()}
            </ThemedText>
          </View>
          
          <View style={styles.buttonContainer}>
            {canTrack && (
              <Button
                onPress={() => router.push(`/collections/tracking?id=${collection.id}`)}
                variant="primary"
                leftIcon="locate"
                style={styles.actionButton}
              >
                Track Collection
              </Button>
            )}
            
            {canTrackPersonnel && (
              <Button
                onPress={() => router.push(`/collections/personnel-tracking?id=${collection.id}`)}
                variant="secondary"
                leftIcon="person"
                style={styles.actionButton}
              >
                Track Delivery
              </Button>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText variant="h2">Materials</ThemedText>
          <ThemedText variant="body">
            {collection.materials.map((material) => (
              <ThemedText key={material.materialId} variant="body">
                {material.material.name}: {material.quantity.quantity} kg
              </ThemedText>
            ))}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText variant="h2">Schedule</ThemedText>
          <ThemedText variant="body">{formatDate(collection.scheduledDateTime.toString())}</ThemedText>
          <ThemedText variant="body">Estimated Duration: {collection.estimatedDuration} minutes</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText variant="h2">Location</ThemedText>
          <ThemedText variant="body">{collection.location.street}</ThemedText>
          <ThemedText variant="body">
            {collection.location.city}, {collection.location.state} {collection.location.zipCode}
          </ThemedText>
          {collection.location.coordinates && (
            <ThemedText variant="body">
              {collection.location.coordinates.latitude}, {collection.location.coordinates.longitude}
            </ThemedText>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText variant="h2">Status History</ThemedText>
          {collection.statusHistory.map((status, index) => (
            <View key={index} style={styles.statusHistoryItem}>
              <ThemedText variant="body">
                {status.status.replace('_', ' ').toUpperCase()}
              </ThemedText>
              <ThemedText variant="body">
                {formatDate(status.timestamp.toString())}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  errorDetail: {
    marginTop: 8,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
}); 