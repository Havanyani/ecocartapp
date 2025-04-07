/**
 * CollectionDetailsScreen.tsx
 * 
 * Screen for displaying detailed information about a collection.
 */

import { CollectionProgress } from '@/components/collection/CollectionProgress';
import { CollectionTimeline } from '@/components/collection/CollectionTimeline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { CollectionStackParamList } from '@/navigation/CollectionNavigator';
import { CollectionItem } from '@/types/Collection';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type CollectionDetailsScreenNavigationProp = StackNavigationProp<
  CollectionStackParamList,
  'CollectionDetails'
>;

export function CollectionDetailsScreen() {
  const navigation = useNavigation<CollectionDetailsScreenNavigationProp>();
  const route = useRoute();
  const { theme } = useTheme();
  const [collection, setCollection] = useState<CollectionItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch the collection details from your backend
    const mockCollection: CollectionItem = {
      id: route.params?.collectionId || '1',
      status: 'scheduled',
      scheduledDate: new Date(),
      materials: [
        { id: '1', name: 'Plastic', weight: 2.5 },
        { id: '2', name: 'Paper', weight: 1.5 },
      ],
      address: '123 Main St, City, Country',
      notes: 'Please collect during business hours',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCollection(mockCollection);
    setIsLoading(false);
  }, [route.params?.collectionId]);

  const handleTrackDriver = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.navigate('DriverTracking', { collectionId: collection?.id });
  };

  const handleEnterWeight = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.navigate('WeightEntry', { collectionId: collection?.id });
  };

  const handleCancelCollection = () => {
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
          onPress: () => {
            // In a real app, you would call your API to cancel the collection
            console.log('Cancelling collection:', collection?.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (isLoading || !collection) {
    return (
      <SafeAreaView style={styles.container}>
        <Card style={styles.card}>
          <Text>Loading collection details...</Text>
        </Card>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.card}>
        <Text variant="h2" style={styles.title}>Collection Details</Text>
        
        <CollectionProgress collection={collection} />
        
        <View style={styles.section}>
          <Text variant="h3">Materials</Text>
          {collection.materials.map(material => (
            <View key={material.id} style={styles.materialItem}>
              <IconSymbol name="recycle" size={20} color={theme.colors.primary} />
              <Text style={styles.materialText}>
                {material.name} - {material.weight} kg
              </Text>
            </View>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text variant="h3">Address</Text>
          <Text style={styles.addressText}>{collection.address}</Text>
        </View>
        
        {collection.notes && (
          <View style={styles.section}>
            <Text variant="h3">Notes</Text>
            <Text style={styles.notesText}>{collection.notes}</Text>
          </View>
        )}
        
        <CollectionTimeline collection={collection} />
        
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleTrackDriver}
            style={styles.button}
          >
            Track Driver
          </Button>
          
          <Button
            onPress={handleEnterWeight}
            style={styles.button}
          >
            Enter Weight
          </Button>
          
          <Button
            variant="secondary"
            onPress={handleCancelCollection}
            style={[styles.button, styles.cancelButton]}
          >
            Cancel Collection
          </Button>
        </View>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    padding: 16,
    flex: 1,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  materialText: {
    marginLeft: 8,
  },
  addressText: {
    marginTop: 8,
  },
  notesText: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    marginBottom: 8,
  },
  cancelButton: {
    marginTop: 8,
  },
}); 