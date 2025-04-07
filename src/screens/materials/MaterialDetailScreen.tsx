/**
 * MaterialDetailScreen.tsx
 * 
 * A screen that displays detailed information about a recyclable material.
 * Includes environmental impact visualization, recycling instructions,
 * and nearby collection points.
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Share,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Material, useMaterials } from '@/api/MaterialsApi';
import { EnvironmentalImpactCard } from '@/components/materials/EnvironmentalImpactCard';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { useTheme } from '@/theme';
import ScheduleCollectionModal, { ScheduleCollectionData } from '../../components/materials/ScheduleCollectionModal';

interface MaterialDetailScreenProps {
  route: {
    params: {
      id: string;
      material?: Material; // Optionally pass the material directly
    }
  };
  navigation: any;
}

// Add new interface for recycling tips
interface RecyclingTip {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function MaterialDetailScreen({ route, navigation }: MaterialDetailScreenProps) {
  const theme = useTheme();
  const { id, material: initialMaterial } = route.params;
  const { getMaterial } = useMaterials();
  const { isOnline } = useNetworkStatus();
  
  const [material, setMaterial] = useState<Material | null>(initialMaterial || null);
  const [isLoading, setIsLoading] = useState(!initialMaterial);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'locations' | 'impact'>('info');
  
  // Collection locations (would be fetched from an API in a real app)
  const [collectionLocations, setCollectionLocations] = useState<Array<{
    id: string;
    name: string;
    address: string;
    coordinates: { latitude: number; longitude: number };
    hours?: string;
  }>>([]);

  // Recycling tips for this material (would come from an API in a real app)
  const [recyclingTips, setRecyclingTips] = useState<RecyclingTip[]>([]);
  
  // State for schedule collection modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  // Load material data on mount or when ID changes
  useFocusEffect(
    useCallback(() => {
      if (!initialMaterial) {
        loadMaterial();
      } else {
        setMaterial(initialMaterial);
        // Generate some dummy collection locations based on the material
        generateDummyCollectionLocations();
        // Generate recycling tips based on the material
        generateRecyclingTips(initialMaterial);
      }
    }, [id, initialMaterial])
  );
  
  // Load material data
  const loadMaterial = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getMaterial(id);
      setMaterial(data);
      
      // Generate some dummy collection locations based on the material
      generateDummyCollectionLocations();
      // Generate recycling tips based on the material
      generateRecyclingTips(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load material');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate dummy collection locations (in a real app, these would come from an API)
  const generateDummyCollectionLocations = () => {
    // Generate 3 random locations close to a center point
    const centerLat = 37.7749; // San Francisco
    const centerLng = -122.4194;
    
    const locations = Array(3).fill(0).map((_, i) => ({
      id: `loc-${i}`,
      name: `Recycling Center ${i + 1}`,
      address: `${100 + i * 50} Recycling Street, San Francisco, CA`,
      coordinates: {
        latitude: centerLat + (Math.random() - 0.5) * 0.05,
        longitude: centerLng + (Math.random() - 0.5) * 0.05,
      },
      hours: i === 0 ? '24/7' : 'Mon-Fri: 9am-5pm',
    }));
    
    setCollectionLocations(locations);
  };

  // Generate recycling tips based on the material
  const generateRecyclingTips = (material: Material) => {
    // Common tips for all materials
    const commonTips: RecyclingTip[] = [
      {
        id: 'clean-1',
        title: 'Clean Before Recycling',
        description: 'Rinse containers to remove food residue before recycling.',
        icon: 'water-outline'
      }
    ];
    
    // Material-specific tips
    const specificTips: RecyclingTip[] = [];
    
    if (material.category === 'Plastic') {
      specificTips.push(
        {
          id: 'plastic-1',
          title: 'Check the Number',
          description: 'Look for the recycling number inside the triangle symbol. Different numbers indicate different types of plastic.',
          icon: 'search-outline'
        },
        {
          id: 'plastic-2',
          title: 'Remove Caps',
          description: 'Remove and separate caps from bottles unless instructed otherwise by your local recycling program.',
          icon: 'flask-outline'
        }
      );
    } else if (material.category === 'Paper') {
      specificTips.push(
        {
          id: 'paper-1',
          title: 'Keep It Dry',
          description: 'Wet paper can contaminate other recyclables and may not be processable.',
          icon: 'umbrella-outline'
        },
        {
          id: 'paper-2',
          title: 'Flatten Boxes',
          description: 'Break down cardboard boxes to save space and improve processing efficiency.',
          icon: 'cube-outline'
        }
      );
    } else if (material.category === 'Glass') {
      specificTips.push(
        {
          id: 'glass-1',
          title: 'Sort By Color',
          description: 'Some recycling programs require sorting glass by color. Check local guidelines.',
          icon: 'color-palette-outline'
        },
        {
          id: 'glass-2',
          title: 'Handle With Care',
          description: 'Broken glass can be dangerous for recycling workers. Handle with care.',
          icon: 'hand-left-outline'
        }
      );
    } else if (material.category === 'Metal') {
      specificTips.push(
        {
          id: 'metal-1',
          title: 'Check If Magnetic',
          description: 'Magnetic metals (like steel) are recycled differently than non-magnetic metals (like aluminum).',
          icon: 'magnet-outline'
        },
        {
          id: 'metal-2',
          title: 'Crush Cans',
          description: 'Crushing aluminum cans saves space and makes transportation more efficient.',
          icon: 'resize-outline'
        }
      );
    } else if (material.category === 'Electronic') {
      specificTips.push(
        {
          id: 'electronic-1',
          title: 'Remove Batteries',
          description: 'Batteries should be recycled separately as they can pose fire hazards.',
          icon: 'battery-outline'
        },
        {
          id: 'electronic-2',
          title: 'Data Security',
          description: 'Erase personal data from electronics before recycling.',
          icon: 'shield-outline'
        }
      );
    }
    
    // Hazardous material tips
    if (material.isHazardous) {
      specificTips.push({
        id: 'hazard-1',
        title: 'Special Handling Required',
        description: 'This material requires special handling. Do not place in regular recycling bins.',
        icon: 'warning-outline'
      });
    }
    
    setRecyclingTips([...specificTips, ...commonTips]);
  };
  
  // Share material information
  const handleShare = async () => {
    if (!material) return;
    
    try {
      await Share.share({
        title: `Recycling Info: ${material.name}`,
        message: `Learn how to recycle ${material.name}. Recycling rate: ${material.recyclingRate}%. ${material.description}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  // Handle scheduling a collection
  const handleScheduleCollection = () => {
    setShowScheduleModal(true);
  };
  
  // Process the collection scheduling
  const processScheduleCollection = async (data: ScheduleCollectionData) => {
    try {
      // In a real app, this would call an API to schedule the collection
      console.log('Scheduling collection:', data);
      
      // For demo purposes, we'll just show a success message
      setTimeout(() => {
        Alert.alert(
          'Collection Scheduled!',
          `Your ${data.materialName} collection has been scheduled for ${data.scheduledDate.toLocaleDateString()}. We'll notify you when the driver is on the way.`,
          [{ text: 'OK' }]
        );
      }, 1000);
      
      // Return a resolved promise to indicate success
      return Promise.resolve();
    } catch (error) {
      console.error('Error scheduling collection:', error);
      return Promise.reject(error);
    }
  };
  
  // Open maps app with location
  const handleGetDirections = (coordinates: { latitude: number; longitude: number }) => {
    const url = `https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}`;
    Linking.openURL(url);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading material information...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }
  
  // Error state
  if (error || !material) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF3B30" />
          <ThemedText style={styles.errorTitle}>Failed to load material</ThemedText>
          <ThemedText style={styles.errorText}>
            {error?.message || 'Material not found'}
          </ThemedText>
          <Button 
            onPress={loadMaterial}
            style={{ marginTop: 16 }}
          >
            Retry
          </Button>
          <Button 
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={{ marginTop: 8 }}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.theme.colors.background }]}>
      <ThemedView style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.theme.colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{material.name}</ThemedText>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color={theme.theme.colors.text} />
        </TouchableOpacity>
      </ThemedView>
      
      {/* Material Image */}
      <View style={styles.imageContainer}>
        {material.imageUrl ? (
          <Image
            source={{ uri: material.imageUrl }}
            style={styles.materialImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.theme.colors.card }]}>
            <MaterialCommunityIcons
              name="recycle-variant"
              size={80}
              color={theme.theme.colors.primary}
            />
          </View>
        )}
        
        {/* Hazardous indicator */}
        {material.isHazardous && (
          <View style={styles.hazardousBadge}>
            <Ionicons name="warning" size={16} color="#fff" />
            <ThemedText style={styles.hazardousText}>Hazardous</ThemedText>
          </View>
        )}
      </View>

      {/* Schedule Collection Button - Always visible */}
      <TouchableOpacity
        style={[styles.scheduleButton, { backgroundColor: theme.theme.colors.primary }]}
        onPress={handleScheduleCollection}
        activeOpacity={0.8}
        testID="schedule-collection-button"
      >
        <Ionicons name="calendar-outline" size={20} color="#fff" />
        <ThemedText style={styles.scheduleButtonText}>Schedule Collection</ThemedText>
      </TouchableOpacity>
      
      {/* Tab navigation */}
      <ThemedView style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'info' && { borderBottomColor: theme.theme.colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('info')}
        >
          <Ionicons
            name="information-circle"
            size={20}
            color={activeTab === 'info' ? theme.theme.colors.primary : theme.theme.colors.text}
          />
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'info' && { color: theme.theme.colors.primary }
            ]}
          >
            Info
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'impact' && { borderBottomColor: theme.theme.colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('impact')}
        >
          <Ionicons
            name="leaf"
            size={20}
            color={activeTab === 'impact' ? theme.theme.colors.primary : theme.theme.colors.text}
          />
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'impact' && { color: theme.theme.colors.primary }
            ]}
          >
            Impact
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'locations' && { borderBottomColor: theme.theme.colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('locations')}
        >
          <Ionicons
            name="location"
            size={20}
            color={activeTab === 'locations' ? theme.theme.colors.primary : theme.theme.colors.text}
          />
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'locations' && { color: theme.theme.colors.primary }
            ]}
          >
            Collection Points
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      {/* Tab content */}
      <ScrollView style={styles.contentContainer}>
        {activeTab === 'info' && (
          <View>
            <ThemedView style={styles.infoSection}>
              <ThemedText style={styles.infoSectionTitle}>About</ThemedText>
              <ThemedText style={styles.materialDescription}>{material.description}</ThemedText>
              
              <View style={styles.materialMeta}>
                <View style={styles.metaItem}>
                  <ThemedText style={styles.metaLabel}>Category</ThemedText>
                  <ThemedText style={styles.metaValue}>{material.category}</ThemedText>
                </View>
                
                <View style={styles.metaItem}>
                  <ThemedText style={styles.metaLabel}>Recycling Rate</ThemedText>
                  <View style={styles.recyclingRateContainer}>
                    <View
                      style={[
                        styles.recyclingRate,
                        {
                          width: `${material.recyclingRate}%`,
                          backgroundColor:
                            material.recyclingRate > 70 ? '#4CAF50' :
                            material.recyclingRate > 40 ? '#FFC107' : '#F44336'
                        }
                      ]}
                    />
                    <ThemedText style={styles.recyclingRateText}>
                      {material.recyclingRate}%
                    </ThemedText>
                  </View>
                </View>
              </View>
              
              <View style={styles.acceptedFormsContainer}>
                <ThemedText style={styles.acceptedFormsTitle}>Accepted Forms</ThemedText>
                <ThemedView style={styles.acceptedFormsList}>
                  {material.acceptedForms.map((form, index) => (
                    <ThemedView
                      key={index}
                      style={[styles.acceptedFormChip, { backgroundColor: theme.theme.colors.primary + '20' }]}
                    >
                      <ThemedText style={styles.acceptedFormText}>{form}</ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>
              </View>
            </ThemedView>
            
            {/* Recycling Tips Section */}
            <ThemedView style={styles.recyclingTipsSection}>
              <ThemedText style={styles.recyclingTipsTitle}>Recycling Tips</ThemedText>
              
              {recyclingTips.map((tip) => (
                <ThemedView key={tip.id} style={styles.tipCard}>
                  <View style={[styles.tipIconContainer, { backgroundColor: theme.theme.colors.primary + '20' }]}>
                    <Ionicons name={tip.icon} size={24} color={theme.theme.colors.primary} />
                  </View>
                  <View style={styles.tipContent}>
                    <ThemedText style={styles.tipTitle}>{tip.title}</ThemedText>
                    <ThemedText style={styles.tipDescription}>{tip.description}</ThemedText>
                  </View>
                </ThemedView>
              ))}
            </ThemedView>
          </View>
        )}
        
        {activeTab === 'impact' && (
          <ThemedView style={styles.impactContainer}>
            <EnvironmentalImpactCard
              material={material}
              onScheduleCollection={handleScheduleCollection}
            />
          </ThemedView>
        )}
        
        {activeTab === 'locations' && (
          <ThemedView style={styles.locationsContainer}>
            <ThemedText style={styles.locationsSectionTitle}>
              Collection Locations for {material.name}
            </ThemedText>
            
            {/* Map view of locations */}
            {collectionLocations.length > 0 && (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: collectionLocations[0].coordinates.latitude,
                    longitude: collectionLocations[0].coordinates.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                >
                  {collectionLocations.map((location) => (
                    <Marker
                      key={location.id}
                      coordinate={location.coordinates}
                      title={location.name}
                      description={location.address}
                    />
                  ))}
                </MapView>
              </View>
            )}
            
            {/* List of locations */}
            <View style={styles.locationsList}>
              {collectionLocations.map((location) => (
                <ThemedView key={location.id} style={styles.locationCard}>
                  <View style={styles.locationCardContent}>
                    <ThemedText style={styles.locationName}>{location.name}</ThemedText>
                    <ThemedText style={styles.locationAddress}>{location.address}</ThemedText>
                    {location.hours && (
                      <ThemedText style={styles.locationHours}>
                        <ThemedText style={{ fontWeight: 'bold' }}>Hours: </ThemedText>
                        {location.hours}
                      </ThemedText>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.directionsButton, { backgroundColor: theme.theme.colors.primary }]}
                    onPress={() => handleGetDirections(location.coordinates)}
                  >
                    <Ionicons name="navigate" size={20} color="#fff" />
                  </TouchableOpacity>
                </ThemedView>
              ))}
            </View>
          </ThemedView>
        )}
      </ScrollView>
      
      {/* Collection scheduling modal */}
      {material && (
        <ScheduleCollectionModal
          visible={showScheduleModal}
          material={material}
          onClose={() => setShowScheduleModal(false)}
          onSchedule={processScheduleCollection}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  imageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  materialImage: {
    height: '100%',
    width: '100%',
  },
  imagePlaceholder: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hazardousBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hazardousText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tabText: {
    marginLeft: 4,
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
  },
  infoSection: {
    padding: 16,
    marginBottom: 8,
  },
  infoSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  materialDescription: {
    lineHeight: 22,
    marginBottom: 16,
  },
  materialMeta: {
    marginBottom: 16,
  },
  metaItem: {
    marginBottom: 12,
  },
  metaLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  recyclingRateContainer: {
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  recyclingRate: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  recyclingRateText: {
    position: 'absolute',
    right: 8,
    top: 1,
    fontSize: 12,
    fontWeight: 'bold',
  },
  acceptedFormsContainer: {
    marginTop: 4,
  },
  acceptedFormsTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  acceptedFormsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  acceptedFormChip: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  acceptedFormText: {
    fontSize: 12,
  },
  recyclingTipsSection: {
    padding: 16,
    marginBottom: 16,
  },
  recyclingTipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tipCard: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  impactContainer: {
    padding: 16,
  },
  locationsContainer: {
    padding: 16,
  },
  locationsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  locationsList: {},
  locationCard: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationCardContent: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    marginBottom: 4,
  },
  locationHours: {
    fontSize: 12,
    opacity: 0.8,
  },
  directionsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    textAlign: 'center',
    opacity: 0.7,
  },
}); 