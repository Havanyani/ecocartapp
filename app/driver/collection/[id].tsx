/**
 * Collection Verification Screen
 * 
 * Allows delivery personnel to verify collections with photos,
 * record material details, and provide collection notes.
 */

import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { DriverService } from '@/services/DriverService';
import { MaterialsService } from '@/services/MaterialsService';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CollectionStatus } from '../index';

// Photo types for collection
enum PhotoType {
  BEFORE = 'before',
  MATERIALS = 'materials',
  AFTER = 'after'
}

// Material item interface
interface MaterialItem {
  id: string;
  name: string;
  isSelected: boolean;
  weight: number;
}

// Collection assignment interface
interface CollectionAssignment {
  id: string;
  userId: string;
  address: string;
  scheduledTime: string;
  materials: string[];
  status: CollectionStatus;
  estimatedWeight: number;
  notes: string;
  latitude: number;
  longitude: number;
  sequence?: number;
}

export default function CollectionVerificationScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const cameraRef = useRef<Camera>(null);
  
  // State for collection details
  const [collection, setCollection] = useState<CollectionAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for camera and photos
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [showCamera, setShowCamera] = useState(false);
  const [currentPhotoType, setCurrentPhotoType] = useState<PhotoType | null>(null);
  
  // State for verification details
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [materialPhotos, setMaterialPhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [materialItems, setMaterialItems] = useState<MaterialItem[]>([]);
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  
  // Steps for verification process
  const steps = [
    { title: 'Before Photos', description: 'Take photos before collection' },
    { title: 'Materials', description: 'Record collected materials' },
    { title: 'After Photos', description: 'Take photos after collection' },
    { title: 'Review', description: 'Review and submit verification' }
  ];
  
  useEffect(() => {
    loadCollectionDetails();
    requestCameraPermission();
    loadMaterialTypes();
    
    // Calculate total weight when materials change
    calculateTotalWeight();
  }, [id, materialItems]);
  
  const loadCollectionDetails = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const collectionDetails = await DriverService.getInstance().getCollectionById(id);
      
      if (collectionDetails) {
        setCollection(collectionDetails);
        
        // Check if collection is in appropriate status
        if (collectionDetails.status !== CollectionStatus.ARRIVED) {
          // Update status to ARRIVED if not already
          await DriverService.getInstance().updateCollectionStatus(
            id,
            CollectionStatus.ARRIVED
          );
        }
      } else {
        Alert.alert('Error', 'Collection not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading collection details:', error);
      Alert.alert('Error', 'Failed to load collection details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadMaterialTypes = async () => {
    try {
      // Get all available material types
      const allMaterials = await MaterialsService.getInstance().getMaterials();
      
      // Create material items for the collection with expected materials pre-selected
      const items = allMaterials.map(material => ({
        id: material.id,
        name: material.name,
        isSelected: collection?.materials.includes(material.id) || false,
        weight: 0
      }));
      
      setMaterialItems(items);
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  };
  
  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Camera access is needed to take collection photos',
        [
          { text: 'OK' }
        ]
      );
    }
  };
  
  const calculateTotalWeight = () => {
    const total = materialItems.reduce((sum, item) => 
      item.isSelected ? sum + (item.weight || 0) : sum, 0
    );
    
    setTotalWeight(total);
  };
  
  const handleTakePhoto = async () => {
    if (!cameraRef.current || !currentPhotoType) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync();
      
      // Add the photo to the appropriate array
      if (currentPhotoType === PhotoType.BEFORE) {
        setBeforePhotos([...beforePhotos, photo.uri]);
      } else if (currentPhotoType === PhotoType.MATERIALS) {
        setMaterialPhotos([...materialPhotos, photo.uri]);
      } else if (currentPhotoType === PhotoType.AFTER) {
        setAfterPhotos([...afterPhotos, photo.uri]);
      }
      
      // Close camera after taking photo
      setShowCamera(false);
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };
  
  const handlePickPhoto = async (type: PhotoType) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5,
      });
      
      if (!result.canceled) {
        const photoUris = result.assets.map(asset => asset.uri);
        
        // Add photos to appropriate array
        if (type === PhotoType.BEFORE) {
          setBeforePhotos([...beforePhotos, ...photoUris]);
        } else if (type === PhotoType.MATERIALS) {
          setMaterialPhotos([...materialPhotos, ...photoUris]);
        } else if (type === PhotoType.AFTER) {
          setAfterPhotos([...afterPhotos, ...photoUris]);
        }
      }
    } catch (error) {
      console.error('Error picking photos:', error);
      Alert.alert('Error', 'Failed to pick photos');
    }
  };
  
  const handleOpenCamera = (type: PhotoType) => {
    if (!hasPermission) {
      requestCameraPermission();
      return;
    }
    
    setCurrentPhotoType(type);
    setShowCamera(true);
  };
  
  const handleRemovePhoto = (uri: string, type: PhotoType) => {
    if (type === PhotoType.BEFORE) {
      setBeforePhotos(beforePhotos.filter(photo => photo !== uri));
    } else if (type === PhotoType.MATERIALS) {
      setMaterialPhotos(materialPhotos.filter(photo => photo !== uri));
    } else if (type === PhotoType.AFTER) {
      setAfterPhotos(afterPhotos.filter(photo => photo !== uri));
    }
  };
  
  const handleMaterialSelection = (id: string, isSelected: boolean) => {
    setMaterialItems(materialItems.map(item => 
      item.id === id ? { ...item, isSelected } : item
    ));
  };
  
  const handleMaterialWeightChange = (id: string, weightStr: string) => {
    const weight = parseFloat(weightStr) || 0;
    
    setMaterialItems(materialItems.map(item => 
      item.id === id ? { ...item, weight } : item
    ));
  };
  
  const handleNextStep = () => {
    // Validate current step
    if (activeStep === 0 && beforePhotos.length === 0) {
      Alert.alert('Missing Photos', 'Please take at least one photo before proceeding');
      return;
    } else if (activeStep === 1 && !materialItems.some(item => item.isSelected)) {
      Alert.alert('No Materials Selected', 'Please select at least one material');
      return;
    } else if (activeStep === 2 && afterPhotos.length === 0) {
      Alert.alert('Missing Photos', 'Please take at least one photo before proceeding');
      return;
    }
    
    // Advance to next step
    setActiveStep(Math.min(activeStep + 1, steps.length - 1));
  };
  
  const handlePreviousStep = () => {
    setActiveStep(Math.max(activeStep - 1, 0));
  };
  
  const uploadPhotos = async () => {
    if (!collection) return [];
    
    const photoUrls: string[] = [];
    
    try {
      // Upload before photos
      for (const uri of beforePhotos) {
        const photoUrl = await DriverService.getInstance().uploadCollectionPhoto(
          collection.id,
          uri,
          'before'
        );
        
        if (photoUrl) photoUrls.push(photoUrl);
      }
      
      // Upload material photos
      for (const uri of materialPhotos) {
        const photoUrl = await DriverService.getInstance().uploadCollectionPhoto(
          collection.id,
          uri,
          'materials'
        );
        
        if (photoUrl) photoUrls.push(photoUrl);
      }
      
      // Upload after photos
      for (const uri of afterPhotos) {
        const photoUrl = await DriverService.getInstance().uploadCollectionPhoto(
          collection.id,
          uri,
          'after'
        );
        
        if (photoUrl) photoUrls.push(photoUrl);
      }
      
      return photoUrls;
    } catch (error) {
      console.error('Error uploading photos:', error);
      throw new Error('Failed to upload photos');
    }
  };
  
  const handleSubmitVerification = async () => {
    if (!collection) return;
    
    // Validate required fields
    if (beforePhotos.length === 0 || afterPhotos.length === 0) {
      Alert.alert('Missing Photos', 'Please take both before and after photos');
      return;
    }
    
    if (!materialItems.some(item => item.isSelected)) {
      Alert.alert('No Materials Selected', 'Please select at least one material');
      return;
    }
    
    if (totalWeight <= 0) {
      Alert.alert('Invalid Weight', 'Total weight must be greater than zero');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Upload all photos
      const photoUrls = await uploadPhotos();
      
      // Submit verification
      const success = await DriverService.getInstance().submitCollectionVerification({
        collectionId: collection.id,
        actualWeight: totalWeight,
        photoUrls,
        materialTypes: materialItems
          .filter(item => item.isSelected)
          .map(item => item.id),
        notes,
        timestamp: new Date().toISOString()
      });
      
      if (success) {
        Alert.alert(
          'Collection Verified',
          'Collection has been successfully verified and marked as completed.',
          [
            { 
              text: 'OK', 
              onPress: () => router.push('/driver/active-route')
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to submit verification');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      Alert.alert('Error', 'Failed to submit verification');
    } finally {
      setIsSaving(false);
    }
  };
  
  const renderPhotoList = (photos: string[], type: PhotoType) => {
    return (
      <View style={styles.photoGrid}>
        {photos.map((uri, index) => (
          <View key={`${type}-${index}`} style={styles.photoContainer}>
            <Image source={{ uri }} style={styles.photoThumbnail} />
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={() => handleRemovePhoto(uri, type)}
            >
              <IconSymbol name="x" size={14} color="white" />
            </TouchableOpacity>
          </View>
        ))}
        
        {photos.length < 5 && (
          <View style={styles.photoActionContainer}>
            <TouchableOpacity
              style={styles.photoAction}
              onPress={() => handleOpenCamera(type)}
            >
              <IconSymbol name="camera" size={24} color={theme.colors.primary} />
              <ThemedText style={styles.photoActionText}>Camera</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.photoAction}
              onPress={() => handlePickPhoto(type)}
            >
              <IconSymbol name="image" size={24} color={theme.colors.primary} />
              <ThemedText style={styles.photoActionText}>Gallery</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  
  const renderBeforePhotosStep = () => {
    return (
      <View style={styles.stepContainer}>
        <ThemedText style={styles.stepTitle}>Before Collection Photos</ThemedText>
        <ThemedText style={styles.stepDescription}>
          Take photos of the materials before collection.
          {collection?.notes ? ` Note: ${collection.notes}` : ''}
        </ThemedText>
        {renderPhotoList(beforePhotos, PhotoType.BEFORE)}
      </View>
    );
  };
  
  const renderMaterialsStep = () => {
    return (
      <View style={styles.stepContainer}>
        <ThemedText style={styles.stepTitle}>Materials Collected</ThemedText>
        <ThemedText style={styles.stepDescription}>
          Select the materials collected and enter their weights.
        </ThemedText>
        
        <View style={styles.materialsList}>
          {materialItems.map(item => (
            <View key={item.id} style={styles.materialItem}>
              <View style={styles.materialHeader}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    item.isSelected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                  ]}
                  onPress={() => handleMaterialSelection(item.id, !item.isSelected)}
                >
                  {item.isSelected && (
                    <IconSymbol name="check" size={16} color="white" />
                  )}
                </TouchableOpacity>
                <ThemedText style={styles.materialName}>{item.name}</ThemedText>
              </View>
              
              {item.isSelected && (
                <View style={styles.weightInputContainer}>
                  <ThemedText style={styles.weightLabel}>Weight (kg):</ThemedText>
                  <Input
                    value={item.weight.toString()}
                    onChangeText={(text) => handleMaterialWeightChange(item.id, text)}
                    keyboardType="decimal-pad"
                    style={styles.weightInput}
                  />
                </View>
              )}
            </View>
          ))}
        </View>
        
        <View style={styles.totalWeightContainer}>
          <ThemedText style={styles.totalWeightLabel}>Total Weight:</ThemedText>
          <ThemedText style={styles.totalWeightValue}>{totalWeight.toFixed(2)} kg</ThemedText>
        </View>
        
        <ThemedText style={styles.stepTitle}>Material Photos</ThemedText>
        <ThemedText style={styles.stepDescription}>
          Take photos of the materials collected as evidence.
        </ThemedText>
        {renderPhotoList(materialPhotos, PhotoType.MATERIALS)}
      </View>
    );
  };
  
  const renderAfterPhotosStep = () => {
    return (
      <View style={styles.stepContainer}>
        <ThemedText style={styles.stepTitle}>After Collection Photos</ThemedText>
        <ThemedText style={styles.stepDescription}>
          Take photos of the area after collection.
        </ThemedText>
        {renderPhotoList(afterPhotos, PhotoType.AFTER)}
      </View>
    );
  };
  
  const renderReviewStep = () => {
    return (
      <View style={styles.stepContainer}>
        <ThemedText style={styles.stepTitle}>Review Collection</ThemedText>
        
        <View style={styles.reviewSection}>
          <ThemedText style={styles.reviewSectionTitle}>Collection Details</ThemedText>
          <View style={styles.reviewRow}>
            <ThemedText style={styles.reviewLabel}>Address:</ThemedText>
            <ThemedText style={styles.reviewValue}>{collection?.address}</ThemedText>
          </View>
          <View style={styles.reviewRow}>
            <ThemedText style={styles.reviewLabel}>Materials:</ThemedText>
            <ThemedText style={styles.reviewValue}>
              {materialItems.filter(item => item.isSelected).map(item => item.name).join(', ')}
            </ThemedText>
          </View>
          <View style={styles.reviewRow}>
            <ThemedText style={styles.reviewLabel}>Total Weight:</ThemedText>
            <ThemedText style={styles.reviewValue}>{totalWeight.toFixed(2)} kg</ThemedText>
          </View>
        </View>
        
        <View style={styles.reviewSection}>
          <ThemedText style={styles.reviewSectionTitle}>Photos</ThemedText>
          <View style={styles.reviewRow}>
            <ThemedText style={styles.reviewLabel}>Before Photos:</ThemedText>
            <ThemedText style={styles.reviewValue}>{beforePhotos.length}</ThemedText>
          </View>
          <View style={styles.reviewRow}>
            <ThemedText style={styles.reviewLabel}>Material Photos:</ThemedText>
            <ThemedText style={styles.reviewValue}>{materialPhotos.length}</ThemedText>
          </View>
          <View style={styles.reviewRow}>
            <ThemedText style={styles.reviewLabel}>After Photos:</ThemedText>
            <ThemedText style={styles.reviewValue}>{afterPhotos.length}</ThemedText>
          </View>
        </View>
        
        <View style={styles.notesContainer}>
          <ThemedText style={styles.notesLabel}>Additional Notes:</ThemedText>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional notes about this collection"
            multiline
            numberOfLines={4}
            style={styles.notesInput}
          />
        </View>
      </View>
    );
  };
  
  const renderCurrentStep = () => {
    switch (activeStep) {
      case 0:
        return renderBeforePhotosStep();
      case 1:
        return renderMaterialsStep();
      case 2:
        return renderAfterPhotosStep();
      case 3:
        return renderReviewStep();
      default:
        return null;
    }
  };
  
  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicatorContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <View style={[
              styles.stepDot,
              index === activeStep ? styles.activeStepDot : 
              index < activeStep ? styles.completedStepDot : {}
            ]}>
              {index < activeStep ? (
                <IconSymbol name="check" size={12} color="white" />
              ) : (
                <ThemedText style={[
                  styles.stepNumber,
                  index === activeStep ? styles.activeStepNumber : {}
                ]}>
                  {index + 1}
                </ThemedText>
              )}
            </View>
            
            {index < steps.length - 1 && (
              <View style={[
                styles.stepLine,
                index < activeStep ? styles.completedStepLine : {}
              ]} />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };
  
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        {hasPermission ? (
          <>
            <Camera 
              ref={cameraRef}
              style={styles.camera}
              type={cameraType}
            />
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => setCameraType(
                  cameraType === CameraType.back ? CameraType.front : CameraType.back
                )}
              >
                <IconSymbol name="refresh-ccw" size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleTakePhoto}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => setShowCamera(false)}
              >
                <IconSymbol name="x" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.cameraPermissionContainer}>
            <ThemedText style={styles.cameraPermissionText}>
              Camera permission not granted
            </ThemedText>
            <Button onPress={requestCameraPermission}>
              Request Permission
            </Button>
            <Button 
              variant="outline" 
              onPress={() => setShowCamera(false)}
              style={styles.permissionCancelButton}
            >
              Cancel
            </Button>
          </View>
        )}
      </View>
    );
  }
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Loading collection details...</ThemedText>
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Verify Collection',
          headerBackTitle: 'Route',
        }}
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {renderStepIndicator()}
        
        <ThemedView style={styles.card}>
          {renderCurrentStep()}
        </ThemedView>
        
        <View style={styles.actionButtons}>
          {activeStep > 0 && (
            <Button
              variant="outline"
              onPress={handlePreviousStep}
              style={styles.actionButton}
            >
              Back
            </Button>
          )}
          
          {activeStep < steps.length - 1 ? (
            <Button
              onPress={handleNextStep}
              style={styles.actionButton}
            >
              Next
            </Button>
          ) : (
            <Button
              onPress={handleSubmitVerification}
              isLoading={isSaving}
              disabled={isSaving}
              style={styles.actionButton}
            >
              Complete Verification
            </Button>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  activeStepDot: {
    backgroundColor: '#4385F4',
  },
  completedStepDot: {
    backgroundColor: '#4CAF50',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#757575',
  },
  activeStepNumber: {
    color: 'white',
  },
  stepLine: {
    height: 1,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  completedStepLine: {
    backgroundColor: '#4CAF50',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stepContainer: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  photoContainer: {
    width: '30%',
    aspectRatio: 1,
    marginRight: '3%',
    marginBottom: '3%',
    position: 'relative',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActionContainer: {
    width: '30%',
    aspectRatio: 1,
    marginRight: '3%',
    marginBottom: '3%',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
  },
  photoAction: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  photoActionText: {
    fontSize: 12,
    marginTop: 4,
  },
  materialsList: {
    marginBottom: 16,
  },
  materialItem: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#757575',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '500',
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  weightLabel: {
    fontSize: 14,
    marginRight: 8,
    width: 100,
  },
  weightInput: {
    flex: 1,
  },
  totalWeightContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  totalWeightLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalWeightValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  reviewSection: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reviewRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 120,
  },
  reviewValue: {
    fontSize: 14,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  actionButton: {
    minWidth: 120,
    marginHorizontal: 8,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  cameraButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  cameraPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraPermissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionCancelButton: {
    marginTop: 12,
  },
}); 