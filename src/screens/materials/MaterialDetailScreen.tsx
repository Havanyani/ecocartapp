/**
 * MaterialDetailScreen.tsx
 * 
 * A screen that displays detailed information about a recyclable material.
 * Uses the MaterialsApi to fetch data and caches it for offline access.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Material, useMaterials } from '@/api/MaterialsApi';
import useNetworkStatus from '@/hooks/useNetworkStatus';

interface MaterialDetailScreenProps {
  route: {
    params: {
      id: string;
      material?: Material; // Optionally pass the material directly
    }
  };
  navigation: any;
}

export default function MaterialDetailScreen({ route, navigation }: MaterialDetailScreenProps) {
  // Get the material ID from route params
  const { id, material: initialMaterial } = route.params;
  
  // Local state for material
  const [material, setMaterial] = useState<Material | null>(initialMaterial || null);
  const [isLoading, setIsLoading] = useState(!initialMaterial);
  const [error, setError] = useState<Error | null>(null);
  
  // Get API hooks
  const { getMaterial } = useMaterials();
  const { isOnline } = useNetworkStatus();
  
  // Fetch material details on mount if not provided
  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const fetchedMaterial = await getMaterial(id);
        setMaterial(fetchedMaterial);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(`Failed to load material ${id}`);
        setError(error);
        
        // If we already have the material from params, keep using that
        if (!material) {
          Alert.alert('Error', `Failed to load material details: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!initialMaterial) {
      fetchMaterial();
    }
  }, [id, getMaterial, initialMaterial, material]);
  
  // Share material information
  const handleShare = async () => {
    if (!material) return;
    
    try {
      await Share.share({
        title: material.name,
        message: `Check out how to recycle ${material.name}:\n\n` +
          `${material.description}\n\n` +
          `Recycling Rate: ${material.recyclingRate}%\n` +
          `Accepted Forms: ${material.acceptedForms.join(', ')}\n` +
          `${material.isHazardous ? '⚠️ This material is hazardous and requires special handling.' : ''}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share material information');
    }
  };
  
  // Show loading indicator
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34C759" />
        <Text style={styles.loadingText}>Loading material details...</Text>
      </View>
    );
  }
  
  // Show error state
  if (error && !material) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#FF3B30" />
        <Text style={styles.errorTitle}>Failed to load material</Text>
        <Text style={styles.errorText}>{error.message}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Show no material found
  if (!material) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="help-circle" size={64} color="#FF9500" />
        <Text style={styles.errorTitle}>Material Not Found</Text>
        <Text style={styles.errorText}>The requested material could not be found.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Material Image */}
        <View style={styles.imageContainer}>
          {material.imageUrl ? (
            <Image
              source={{ uri: material.imageUrl }}
              style={styles.materialImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.materialImagePlaceholder}>
              <Ionicons name="leaf" size={80} color="#34C759" />
            </View>
          )}
          
          {/* Overlay with name */}
          <View style={styles.materialNameContainer}>
            <Text style={styles.materialName}>{material.name}</Text>
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{material.category}</Text>
            </View>
          </View>
        </View>
        
        {/* Material Details */}
        <View style={styles.detailsContainer}>
          {/* Hazardous Warning */}
          {material.isHazardous && (
            <View style={styles.hazardousWarning}>
              <Ionicons name="warning" size={24} color="#FFFFFF" />
              <Text style={styles.hazardousText}>
                This material is hazardous and requires special handling
              </Text>
            </View>
          )}
          
          {/* Recycling Rate */}
          <View style={styles.rateContainer}>
            <Text style={styles.rateTitle}>Recycling Rate</Text>
            <View style={styles.rateBarContainer}>
              <View
                style={[
                  styles.rateBar,
                  { width: `${material.recyclingRate}%` },
                  material.recyclingRate > 70 ? styles.highRate :
                  material.recyclingRate > 40 ? styles.mediumRate :
                  styles.lowRate
                ]}
              />
            </View>
            <Text style={styles.rateValue}>{material.recyclingRate}%</Text>
          </View>
          
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{material.description}</Text>
          </View>
          
          {/* Accepted Forms */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accepted Forms</Text>
            <View style={styles.formsContainer}>
              {material.acceptedForms.map((form, index) => (
                <View key={index} style={styles.formTag}>
                  <Text style={styles.formText}>{form}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Recycling Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recycling Instructions</Text>
            <View style={styles.instructionsList}>
              <View style={styles.instruction}>
                <View style={styles.instructionIcon}>
                  <Ionicons name="water-outline" size={24} color="#2C76E5" />
                </View>
                <Text style={styles.instructionText}>
                  Rinse the item to remove any food or product residue
                </Text>
              </View>
              
              <View style={styles.instruction}>
                <View style={styles.instructionIcon}>
                  <Ionicons name="trash-outline" size={24} color="#2C76E5" />
                </View>
                <Text style={styles.instructionText}>
                  Remove any labels, caps, or non-recyclable parts
                </Text>
              </View>
              
              <View style={styles.instruction}>
                <View style={styles.instructionIcon}>
                  <Ionicons name="resize-outline" size={24} color="#2C76E5" />
                </View>
                <Text style={styles.instructionText}>
                  Compress the item to save space in recycling bins
                </Text>
              </View>
              
              {material.isHazardous && (
                <View style={styles.instruction}>
                  <View style={[styles.instructionIcon, styles.hazardousIcon]}>
                    <Ionicons name="warning-outline" size={24} color="#FF3B30" />
                  </View>
                  <Text style={styles.instructionText}>
                    This item requires special disposal. Do not place in regular recycling bins.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Offline Indicator */}
      {!isOnline && (
        <View style={styles.offlineIndicator}>
          <Ionicons name="cloud-offline" size={16} color="#FFFFFF" />
          <Text style={styles.offlineText}>You are viewing offline data</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 16
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    zIndex: 10
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageContainer: {
    height: 300,
    position: 'relative'
  },
  materialImage: {
    width: '100%',
    height: '100%'
  },
  materialImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center'
  },
  materialNameContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  },
  materialName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8
  },
  categoryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  categoryText: {
    fontSize: 14,
    color: '#FFFFFF'
  },
  detailsContainer: {
    padding: 16
  },
  hazardousWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    marginBottom: 16
  },
  hazardousText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  rateContainer: {
    marginBottom: 24
  },
  rateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8
  },
  rateBarContainer: {
    height: 12,
    backgroundColor: '#E5E5EA',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 4
  },
  rateBar: {
    height: '100%',
    borderRadius: 6
  },
  highRate: {
    backgroundColor: '#34C759'
  },
  mediumRate: {
    backgroundColor: '#FF9500'
  },
  lowRate: {
    backgroundColor: '#FF3B30'
  },
  rateValue: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'right'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#3C3C43'
  },
  formsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  formTag: {
    backgroundColor: '#EBF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8
  },
  formText: {
    fontSize: 14,
    color: '#2C76E5'
  },
  instructionsList: {
    
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  instructionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  hazardousIcon: {
    backgroundColor: '#FFEBEB'
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#3C3C43'
  },
  offlineIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24
  },
  offlineText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FFFFFF'
  }
}); 