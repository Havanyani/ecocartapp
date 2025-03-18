import { DeliveryPersonnelTracker } from '@/components/collection/DeliveryPersonnelTracker';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { WebSocketService } from '@/services/WebSocketService';
import { RootState, useAppDispatch, useAppSelector } from '@/store';
import { Collection } from '@/types/Collection';
import { DeliveryPersonnel } from '@/types/DeliveryPersonnel';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, SafeAreaView, StyleSheet } from 'react-native';

export default function PersonnelTrackingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveryPersonnel, setDeliveryPersonnel] = useState<DeliveryPersonnel | null>(null);
  
  const collection = useAppSelector((state: RootState) =>
    state.collection.collections.find((c: Collection) => c.id === id?.toString())
  );

  useEffect(() => {
    if (!collection) return;
    
    const fetchDeliveryPersonnel = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Send a WebSocket request to get the assigned delivery personnel
        WebSocketService.sendMessage('get_assigned_personnel', {
          collectionId: collection.id
        }).catch(err => {
          console.error('Error requesting personnel details:', err);
          setError('Failed to fetch delivery personnel details');
          setIsLoading(false);
        });
        
        // Subscribe to personnel assignment updates
        WebSocketService.subscribe('collection_update', (data) => {
          if (data.collectionId === collection.id && data.personnel) {
            setDeliveryPersonnel(data.personnel);
            setIsLoading(false);
          }
        });
        
        // For demo purposes, set a mock delivery personnel after a delay
        // This would normally come from the WebSocket response
        setTimeout(() => {
          const mockPersonnel: DeliveryPersonnel = {
            id: 'dp-123',
            name: 'John Doe',
            status: 'en_route',
            // Add other required properties as needed
          };
          setDeliveryPersonnel(mockPersonnel);
          setIsLoading(false);
        }, 1500);
        
      } catch (error) {
        console.error('Error fetching delivery personnel:', error);
        setError('Failed to load delivery personnel information');
        setIsLoading(false);
      }
    };
    
    fetchDeliveryPersonnel();
    
    return () => {
      // Clean up subscriptions if needed
    };
  }, [collection?.id]);

  const handleCallPersonnel = () => {
    if (deliveryPersonnel && deliveryPersonnel.phone) {
      Linking.openURL(`tel:${deliveryPersonnel.phone}`).catch(err => {
        console.error('Error opening phone app:', err);
        Alert.alert('Error', 'Could not open phone app');
      });
    } else {
      Alert.alert('Contact', 'Phone number not available');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>
            Loading delivery personnel information...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <IconSymbol name="alert-circle" size={48} color="red" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <Button 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            Go Back
          </Button>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!collection) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <IconSymbol name="alert-circle" size={48} color="red" />
          <ThemedText style={styles.errorText}>Collection not found</ThemedText>
          <Button 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            Go Back
          </Button>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!deliveryPersonnel) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <IconSymbol name="person-outline" size={48} color={theme.colors.text.secondary} />
          <ThemedText style={styles.errorText}>
            No delivery personnel assigned yet
          </ThemedText>
          <ThemedText style={styles.subText}>
            We'll notify you when a delivery person is assigned to your collection.
          </ThemedText>
          <Button 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            Go Back
          </Button>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <DeliveryPersonnelTracker
        collection={collection}
        deliveryPersonnel={deliveryPersonnel}
        onCallPersonnel={handleCallPersonnel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  backButton: {
    marginTop: 20,
  },
}); 