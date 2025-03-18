import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define the navigation param list
type RootStackParamList = {
  CollectionPointDetails: { id: string };
};

// Type for the navigation prop
type CollectionPointNavigationProp = StackNavigationProp<RootStackParamList, 'CollectionPointDetails'>;

interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  operatingHours: string;
  acceptedMaterials: string[];
  imageUrl?: string;
  distance?: number;
  rating?: number;
  isOpen?: boolean;
}

interface CollectionPointCardProps {
  collectionPoint: CollectionPoint;
  onPress?: (collectionPoint: CollectionPoint) => void;
}

export function CollectionPointCard({ collectionPoint, onPress }: CollectionPointCardProps): JSX.Element {
  const navigation = useNavigation<CollectionPointNavigationProp>();
  
  const handlePress = () => {
    if (onPress) {
      onPress(collectionPoint);
    } else {
      navigation.navigate('CollectionPointDetails', { id: collectionPoint.id });
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      accessibilityLabel={`Collection point: ${collectionPoint.name}`}
      accessibilityRole="button"
    >
      <View style={styles.imageContainer}>
        {collectionPoint.imageUrl ? (
          <Image 
            source={{ uri: collectionPoint.imageUrl }} 
            style={styles.image}
            accessibilityLabel={`Image of ${collectionPoint.name}`}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="trash-bin-outline" size={32} color="#2e7d32" />
          </View>
        )}
        {collectionPoint.isOpen !== undefined && (
          <View style={[styles.statusBadge, collectionPoint.isOpen ? styles.openBadge : styles.closedBadge]}>
            <Ionicons 
              name={collectionPoint.isOpen ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color="#fff" 
            />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{collectionPoint.name}</Text>
            {collectionPoint.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>{collectionPoint.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
          
          {collectionPoint.distance && (
            <View style={styles.distanceContainer}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.distance}>{collectionPoint.distance.toFixed(1)} km</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.address}>{collectionPoint.address}</Text>
        <Text style={styles.hours}>{collectionPoint.operatingHours}</Text>
        
        <View style={styles.materialsContainer}>
          {collectionPoint.acceptedMaterials.slice(0, 3).map((material, index) => (
            <View key={index} style={styles.materialTag}>
              <Text style={styles.materialText}>{material}</Text>
            </View>
          ))}
          {collectionPoint.acceptedMaterials.length > 3 && (
            <View style={styles.materialTag}>
              <Text style={styles.materialText}>+{collectionPoint.acceptedMaterials.length - 3}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  imageContainer: {
    width: 100,
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openBadge: {
    backgroundColor: '#4CAF50',
  },
  closedBadge: {
    backgroundColor: '#F44336',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginLeft: 2,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginLeft: 2,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  hours: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  materialsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  materialTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  materialText: {
    fontSize: 12,
    color: '#2E7D32',
  },
}); 