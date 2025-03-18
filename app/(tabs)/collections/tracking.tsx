import { CollectionTracker } from '@/components/collection/CollectionTracker';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { WebSocketService } from '@/services/WebSocketService';
import { RootState, useAppDispatch, useAppSelector } from '@/store';
import { updateCollectionLocation, updateCollectionStatus } from '@/store/slices/collectionSlice';
import { Collection, CollectionStatus } from '@/types/Collection';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet } from 'react-native';

export default function CollectionTrackingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isConnecting, setIsConnecting] = useState(false);
  const collection = useAppSelector((state: RootState) =>
    state.collection.collections.find((c: Collection) => c.id === id?.toString())
  );

  // Subscribe to real-time updates
  useEffect(() => {
    if (!collection) return;

    setIsConnecting(true);
    
    // Initialize WebSocket connection
    const websocketService = WebSocketService.initialize(collection.userId);
    
    // Subscribe to collection updates
    WebSocketService.subscribe('collection_update', (updatedCollection) => {
      if (updatedCollection.id === collection.id) {
        dispatch(updateCollectionStatus({
          collectionId: updatedCollection.id,
          status: updatedCollection.status
        }));
      }
    });
    
    // Subscribe to location updates
    WebSocketService.subscribe('location_update', (data) => {
      if (data.collectionId === collection.id) {
        dispatch(updateCollectionLocation({
          collectionId: data.collectionId,
          location: data.location
        }));
      }
    });
    
    setIsConnecting(false);
    
    // Clean up subscriptions
    return () => {
      WebSocketService.disconnect();
    };
  }, [collection?.id, dispatch]);

  if (isConnecting) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Connecting to tracking service...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!collection) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.errorText}>Collection not found</ThemedText>
          <Button onPress={() => router.back()}>Go Back</Button>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const handleStatusUpdate = async (status: CollectionStatus) => {
    try {
      // Update local state
      dispatch(updateCollectionStatus({
        collectionId: collection.id,
        status
      }));
      
      // Send real-time update via WebSocket
      await WebSocketService.sendMessage('collection_status_update', {
        collectionId: collection.id,
        status
      });
      
      Alert.alert('Success', `Collection status updated to ${status}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      Alert.alert('Error', 'Failed to update collection status');
    }
  };

  const handleLocationUpdate = async (location: { latitude: number; longitude: number }) => {
    try {
      // Update local state
      dispatch(updateCollectionLocation({
        collectionId: collection.id,
        location
      }));
      
      // Send real-time update via WebSocket
      await WebSocketService.sendMessage('location_update', {
        collectionId: collection.id,
        location
      });
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <CollectionTracker
          collection={collection}
          onStatusUpdate={handleStatusUpdate}
          onLocationUpdate={handleLocationUpdate}
        />
      </ThemedView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
}); 