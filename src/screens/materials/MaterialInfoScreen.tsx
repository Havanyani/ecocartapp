import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CollectionLocationMap } from '@/components/materials/CollectionLocationMap';
import { EnvironmentalImpactCard } from '@/components/materials/EnvironmentalImpactCard';
import { RecyclingGuideCard } from '@/components/materials/RecyclingGuideCard';
import { ThemedText } from '@/components/ui';
import { useMaterials } from '@/hooks/useMaterials';

interface MaterialInfoScreenProps {
  route?: {
    params?: {
      materialId: string;
    };
  };
  materialId?: string;
}

interface MaterialLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  hours?: string;
  acceptsMaterials: string[];
}

interface Material {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  recyclingInstructions: string[];
  environmentalImpact: {
    co2SavedPerKg: number;
    waterSavedPerKg: number;
    energySavedPerKg: number;
    biodegradableTimeYears: number;
  };
  recyclingRate: number;
  value: number;
  category: string;
  isHazardous: boolean;
  commonUses: string[];
  additionalResources: Array<{
    title: string;
    url: string;
  }>;
}

/**
 * Material Information Screen
 * 
 * Displays detailed information about a specific recyclable material
 * including recycling guidelines, environmental impact, and collection locations
 */
export default function MaterialInfoScreen({ route, materialId: propMaterialId }: MaterialInfoScreenProps) {
  const materialId = propMaterialId || route?.params?.materialId;
  const { getMaterialById, getCollectionLocationsForMaterial, isLoading } = useMaterials();
  
  const [material, setMaterial] = useState<Material | null>(null);
  const [locations, setLocations] = useState<MaterialLocation[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'locations'>('info');
  
  // Fetch material data when component mounts or material ID changes
  useEffect(() => {
    if (materialId) {
      loadMaterialData(materialId);
    }
  }, [materialId]);
  
  // Re-fetch data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (materialId) {
        loadMaterialData(materialId);
      }
      
      return () => {
        // Clean up if needed
      };
    }, [materialId])
  );
  
  /**
   * Loads material data and collection locations
   */
  const loadMaterialData = async (id: string) => {
    try {
      // Get material information
      const materialData = await getMaterialById(id);
      setMaterial(materialData);
      
      // Get collection locations for this material
      const locationData = await getCollectionLocationsForMaterial(id);
      setLocations(locationData);
    } catch (error) {
      console.error('Error loading material data:', error);
    }
  };
  
  /**
   * Opens a URL in the device browser
   */
  const handleOpenLink = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.error('Cannot open URL:', url);
      }
    });
  };
  
  /**
   * Switches between info and locations tabs
   */
  const handleTabChange = (tab: 'info' | 'locations') => {
    setActiveTab(tab);
  };
  
  if (isLoading || !material) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F8EF7" />
        <ThemedText style={styles.loadingText}>Loading material information...</ThemedText>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Material Header with Image */}
        <View style={styles.header}>
          <Image 
            source={{ uri: material.imageUrl }} 
            style={styles.materialImage}
            resizeMode="cover"
          />
          <View style={styles.overlay}>
            <ThemedText variant="h1" style={styles.materialName}>{material.name}</ThemedText>
            {material.isHazardous && (
              <View style={styles.hazardousBadge}>
                <Ionicons name="warning" size={16} color="#ffffff" />
                <ThemedText style={styles.hazardousText}>Hazardous</ThemedText>
              </View>
            )}
          </View>
        </View>
        
        {/* Material Description */}
        <View style={styles.descriptionContainer}>
          <ThemedText style={styles.description}>{material.description}</ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText variant="caption">Recycling Rate</ThemedText>
              <ThemedText variant="h3">{material.recyclingRate}%</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="caption">Value</ThemedText>
              <ThemedText variant="h3">${material.value.toFixed(2)}/kg</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="caption">Category</ThemedText>
              <ThemedText variant="h3">{material.category}</ThemedText>
            </View>
          </View>
        </View>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'info' && styles.activeTab]}
            onPress={() => handleTabChange('info')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>Information</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'locations' && styles.activeTab]}
            onPress={() => handleTabChange('locations')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'locations' && styles.activeTabText]}>Collection Locations</ThemedText>
          </TouchableOpacity>
        </View>
        
        {/* Tab Content */}
        {activeTab === 'info' ? (
          <View style={styles.infoContainer}>
            {/* Recycling Guide */}
            <RecyclingGuideCard 
              instructions={material.recyclingInstructions}
              hazardousWarning={material.isHazardous}
              commonUses={material.commonUses}
            />
            
            {/* Environmental Impact */}
            <EnvironmentalImpactCard 
              co2SavedPerKg={material.environmentalImpact.co2SavedPerKg}
              waterSavedPerKg={material.environmentalImpact.waterSavedPerKg}
              energySavedPerKg={material.environmentalImpact.energySavedPerKg}
              biodegradableTimeYears={material.environmentalImpact.biodegradableTimeYears}
            />
            
            {/* Additional Resources */}
            {material.additionalResources && material.additionalResources.length > 0 && (
              <View style={styles.resourcesContainer}>
                <ThemedText variant="h2" style={styles.resourcesTitle}>Additional Resources</ThemedText>
                {material.additionalResources.map((resource, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.resourceLink}
                    onPress={() => handleOpenLink(resource.url)}
                  >
                    <Ionicons name="link-outline" size={20} color="#4F8EF7" />
                    <ThemedText style={styles.resourceText}>{resource.title}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.locationsContainer}>
            {locations && locations.length > 0 ? (
              <>
                <CollectionLocationMap 
                  locations={locations}
                  materialName={material.name}
                />
                <ThemedText variant="h2" style={styles.locationsTitle}>Collection Points</ThemedText>
                {locations.map(location => (
                  <View key={location.id} style={styles.locationCard}>
                    <ThemedText style={styles.locationName}>{location.name}</ThemedText>
                    <ThemedText style={styles.locationAddress}>{location.address}</ThemedText>
                    {location.hours && <ThemedText style={styles.locationHours}>Hours: {location.hours}</ThemedText>}
                    <TouchableOpacity 
                      style={styles.directionsButton}
                      onPress={() => handleOpenLink(`https://maps.google.com/?q=${location.latitude},${location.longitude}`)}
                    >
                      <Ionicons name="navigate-outline" size={16} color="#ffffff" />
                      <ThemedText style={styles.directionsButtonText}>Get Directions</ThemedText>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.noLocationsContainer}>
                <Ionicons name="location-outline" size={48} color="#A0AEC0" />
                <ThemedText style={styles.noLocationsText}>No collection locations found for this material.</ThemedText>
              </View>
            )}
          </View>
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
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    position: 'relative',
    height: 200,
  },
  materialImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  materialName: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  hazardousBadge: {
    backgroundColor: '#e53935',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  hazardousText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  activeTab: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  infoContainer: {
    padding: 16,
  },
  resourcesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  resourcesTitle: {
    marginBottom: 12,
  },
  resourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  resourceText: {
    fontSize: 16,
    color: '#4F8EF7',
  },
  locationsContainer: {
    padding: 16,
  },
  locationsTitle: {
    marginVertical: 16,
  },
  locationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 4,
  },
  locationHours: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 8,
  },
  directionsButton: {
    backgroundColor: '#4F8EF7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
    gap: 4,
  },
  directionsButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  noLocationsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  noLocationsText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginTop: 16,
  },
}); 