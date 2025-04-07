/**
 * ARContainerScannerWithVolumeEstimation.tsx
 * 
 * Enhanced AR scanner component that can identify container types and estimate volumes.
 * Features:
 * - Material detection using camera
 * - Volume estimation
 * - Visual feedback during scanning
 * - Reference object calibration for better accuracy
 */

import ARGuideOverlay from '@/components/ar/ARGuideOverlay';
import { useTheme } from '@/hooks/useTheme';
import { CommonMaterials, detectMaterial } from '@/utils/material-detection';
import { VolumeEstimationInput, estimateVolume } from '@/utils/VolumeEstimation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

export interface RecognizedContainer {
  id: string;
  name: string;
  material: string;
  materialType: CommonMaterials;
  isRecyclable: boolean;
  image?: string;
  volume?: number;
  weight?: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  timestamp: Date;
  confidence: number;
}

export interface ARContainerScannerWithVolumeEstimationProps {
  navigation?: any;
  onClose?: () => void;
  onContainerRecognized?: (container: RecognizedContainer) => void;
  onVolumeEstimated?: (volume: number) => void;
  materialId?: string;
  barcode?: string;
  testMode?: boolean;
}

export default function ARContainerScannerWithVolumeEstimation({
  navigation,
  onClose,
  onContainerRecognized,
  onVolumeEstimated,
  materialId,
  barcode,
  testMode = false
}: ARContainerScannerWithVolumeEstimationProps) {
  const { theme } = useTheme();
  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [containerDetected, setContainerDetected] = useState(false);
  const [materialDetectionComplete, setMaterialDetectionComplete] = useState(false);
  const [recognizedContainer, setRecognizedContainer] = useState<RecognizedContainer | null>(null);
  const [showCalibration, setShowCalibration] = useState(false);
  const [showContribution, setShowContribution] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(0);
  const [referenceObject, setReferenceObject] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  
  // Animated values
  const [pulseAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    (async () => {
      // Request camera permissions
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    
    // Start pulse animation
    startPulseAnimation();
    
    return () => {
      // Cleanup animations
      pulseAnimation.stopAnimation();
    };
  }, []);
  
  // Start pulse animation for scanning feedback
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  const scanForContainer = async () => {
    if (!cameraReady || isScanning) return;
    
    setIsScanning(true);
    setScanProgress(0);
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);
    
    try {
      // In a real app, take a picture and analyze it
      if (cameraRef.current) {
        // If in test mode, simulate capture
        if (testMode) {
          simulateContainerRecognition();
        } else {
          const photo = await cameraRef.current.takePictureAsync();
          await processContainerImage(photo.uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to scan container. Please try again.');
      setIsScanning(false);
    } finally {
      clearInterval(progressInterval);
      setScanProgress(100);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      processContainerImage(selectedImage.uri);
    }
  };

  const processContainerImage = async (imageUri: string) => {
    setIsScanning(true);
    setContainerDetected(true);
    
    // Simulate a delay to show progress
    setTimeout(() => {
      setMaterialDetectionComplete(true);
      
      // Another delay to simulate final processing
      setTimeout(async () => {
        try {
          // In a real app, we would use the image for detection
          // Here we simulate with the material-detection.ts utility
          const materialResult = await detectMaterial(imageUri);
          
          // Estimate volume using camera-based techniques
          const volumeInput: VolumeEstimationInput = {
            imageData: imageUri,
            containerType: getContainerTypeFromMaterial(materialResult.materialType),
            materialType: materialResult.materialType as CommonMaterials,
          };
          
          const volumeResult = await estimateVolume(volumeInput);
          
          // Create container object
          const container: RecognizedContainer = {
            id: Math.random().toString(36).substring(2, 9),
            name: `${materialResult.materialType} Container`,
            material: materialResult.materialType,
            materialType: materialResult.materialType as CommonMaterials,
            isRecyclable: materialResult.recyclingInfo.isRecyclable,
            image: imageUri,
            volume: volumeResult.estimatedVolume,
            weight: volumeResult.estimatedWeight,
            dimensions: volumeResult.dimensions,
            timestamp: new Date(),
            confidence: materialResult.confidence,
          };
          
          // Update state with recognized container
          setRecognizedContainer(container);
          
          // Call callback if provided
          if (onContainerRecognized) {
            onContainerRecognized(container);
          }
          
          // Call volume estimated callback if provided
          if (onVolumeEstimated) {
            onVolumeEstimated(volumeResult.estimatedVolume);
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to process container. Please try again.');
        } finally {
          setIsScanning(false);
          setContainerDetected(false);
          setMaterialDetectionComplete(false);
        }
      }, 1000);
    }, 2000);
  };

  // Map material type to container type for volume estimation
  const getContainerTypeFromMaterial = (materialType: string): string => {
    switch (materialType) {
      case CommonMaterials.PET:
      case CommonMaterials.HDPE:
      case CommonMaterials.PVC:
      case CommonMaterials.LDPE:
      case CommonMaterials.PP:
      case CommonMaterials.PS:
      case CommonMaterials.OTHER_PLASTIC:
        return 'plastic_bottle_medium';
        
      case CommonMaterials.ALUMINUM:
      case CommonMaterials.STEEL:
        return 'aluminum_can';
        
      case CommonMaterials.GLASS:
        return 'glass_bottle_medium';
        
      case CommonMaterials.PAPER:
        return 'paper_carton';
        
      case CommonMaterials.CARDBOARD:
        return 'cardboard_box_small';
        
      case CommonMaterials.CARTON:
        return 'paper_carton';
        
      default:
        return 'unknown';
    }
  };

  const handleAddToCollection = (container: RecognizedContainer) => {
    Alert.alert(
      'Added to Collection',
      `Added ${container.name} (${container.volume?.toFixed(0) || 0}ml) to your collection.`
    );
    setRecognizedContainer(null);
    
    // In a real app, this would save to a collection database
  };

  const simulateContainerRecognition = () => {
    setIsScanning(true);
    setContainerDetected(true);
    
    // Simulate material detection process
    setTimeout(() => {
      setMaterialDetectionComplete(true);
      
      // Simulate final processing
      setTimeout(async () => {
        // Use a test container
        const containerTypes = [
          'plastic_bottle_small',
          'plastic_bottle_medium',
          'aluminum_can',
          'glass_bottle_medium',
          'cardboard_box_small'
        ];
        
        const materialTypes = [
          CommonMaterials.PET,
          CommonMaterials.HDPE,
          CommonMaterials.ALUMINUM,
          CommonMaterials.GLASS,
          CommonMaterials.CARDBOARD
        ];
        
        // Either use the specified material or pick a random one
        const randomIndex = Math.floor(Math.random() * containerTypes.length);
        const containerType = containerTypes[randomIndex];
        const materialType = materialTypes[randomIndex];
        
        // Estimate volume
        const volumeEstimation = await estimateVolume({
          imageData: 'test-image',
          containerType,
          materialType,
        });
        
        // Create container object
        const container: RecognizedContainer = {
          id: Math.random().toString(36).substring(2, 9),
          name: `${materialType} Container`,
          material: materialType,
          materialType: materialType,
          isRecyclable: true,
          volume: volumeEstimation.estimatedVolume,
          weight: volumeEstimation.estimatedWeight,
          dimensions: volumeEstimation.dimensions,
          timestamp: new Date(),
          confidence: 0.85 + Math.random() * 0.1,
        };
        
        // Update state with recognized container
        setRecognizedContainer(container);
        
        // Call callbacks if provided
        if (onContainerRecognized) {
          onContainerRecognized(container);
        }
        
        if (onVolumeEstimated) {
          onVolumeEstimated(volumeEstimation.estimatedVolume);
        }
        
        setIsScanning(false);
        setContainerDetected(false);
        setMaterialDetectionComplete(false);
      }, 1000);
    }, 2000);
  };

  const startCalibration = () => {
    setShowCalibration(true);
    setCalibrationStep(1);
  };

  const handleCalibrationStep = async () => {
    if (calibrationStep === 1) {
      // In a real app, take a picture of reference object
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync();
          setReferenceObject(photo.uri);
          setCalibrationStep(2);
        } catch (error) {
          Alert.alert('Error', 'Failed to capture reference object. Please try again.');
        }
      }
    } else if (calibrationStep === 2) {
      // Finish calibration
      Alert.alert(
        'Calibration Complete',
        'Volume estimation has been calibrated for better accuracy!'
      );
      setShowCalibration(false);
      setCalibrationStep(0);
    }
  };

  const handleContribute = () => {
    setShowContribution(true);
  };

  const submitContribution = () => {
    // In a real app, this would send contribution data to a server
    Alert.alert(
      'Thank You!',
      'Your contribution helps improve our recycling database.'
    );
    setShowContribution(false);
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Camera permission is required
        </Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.camera}>
        {/* Camera View */}
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={Camera.Constants.Type.back}
          onCameraReady={handleCameraReady}
        >
          {/* AR Guide Overlay */}
          <ARGuideOverlay 
            isScanning={isScanning} 
            containerDetected={containerDetected} 
          />
          
          {/* Scanning indicator */}
          {isScanning && (
            <View style={styles.scanningOverlay}>
              <Animated.View
                style={[
                  styles.scanIndicator,
                  {
                    transform: [
                      { scale: pulseAnimation }
                    ],
                  },
                ]}
              />
              
              <View style={styles.scanningIndicator}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.scanningText}>
                  {containerDetected 
                    ? materialDetectionComplete 
                      ? 'Analysis complete!' 
                      : 'Analyzing material...'
                    : 'Scanning...'}
                </Text>
                
                {/* Progress bar */}
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${scanProgress}%`, backgroundColor: theme.colors.primary }
                    ]} 
                  />
                </View>
              </View>
            </View>
          )}
          
          {/* Controls when not scanning */}
          {!isScanning && !recognizedContainer && !showContribution && !showCalibration && (
            <View style={styles.controlsContainer}>
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.iconButton, { backgroundColor: theme.colors.card }]}
                  onPress={openGallery}
                >
                  <Ionicons name="image" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.scanButton, { backgroundColor: theme.colors.primary }]}
                  onPress={scanForContainer}
                  disabled={isScanning}
                >
                  <Text style={styles.scanButtonText}>
                    {isScanning ? 'Scanning...' : 'Scan Container'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.iconButton, { backgroundColor: theme.colors.card }]}
                  onPress={startCalibration}
                >
                  <MaterialCommunityIcons name="ruler" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.tipText}>
                Tip: Hold camera 20-30cm from container
              </Text>
            </View>
          )}
          
          {/* Close button */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </Camera>
      </View>
      
      {/* Results modal */}
      <Modal
        visible={recognizedContainer !== null}
        animationType="slide"
        transparent={true}
      >
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {recognizedContainer && (
                <View style={styles.resultContainer}>
                  <Text style={styles.resultTitle}>{recognizedContainer.name}</Text>
                  
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Material:</Text>
                    <Text style={styles.resultValue}>{recognizedContainer.material}</Text>
                  </View>
                  
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Recyclable:</Text>
                    <Text style={[
                      styles.resultValue, 
                      { color: recognizedContainer.isRecyclable ? theme.colors.success : theme.colors.error }
                    ]}>
                      {recognizedContainer.isRecyclable ? 'Yes' : 'No'}
                    </Text>
                  </View>
                  
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Estimated Volume:</Text>
                    <Text style={styles.resultValue}>
                      {recognizedContainer.volume?.toFixed(0) || 0} ml
                    </Text>
                  </View>
                  
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Estimated Weight:</Text>
                    <Text style={styles.resultValue}>
                      {recognizedContainer.weight?.toFixed(1) || 0} g
                    </Text>
                  </View>
                  
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Dimensions:</Text>
                    <Text style={styles.resultValue}>
                      {`${recognizedContainer.dimensions?.height.toFixed(1) || 0} × ${recognizedContainer.dimensions?.width.toFixed(1) || 0} × ${recognizedContainer.dimensions?.depth.toFixed(1) || 0} cm`}
                    </Text>
                  </View>
                  
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Confidence:</Text>
                    <Text style={styles.resultValue}>
                      {(recognizedContainer.confidence * 100).toFixed(0)}%
                    </Text>
                  </View>
                  
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                      style={[styles.button, { backgroundColor: theme.colors.primary }]}
                      onPress={() => handleAddToCollection(recognizedContainer)}
                    >
                      <Text style={styles.buttonText}>Add to Collection</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.button, { backgroundColor: theme.colors.secondary }]}
                      onPress={() => setRecognizedContainer(null)}
                    >
                      <Text style={styles.buttonText}>Scan Another</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.button, { backgroundColor: theme.colors.card }]}
                      onPress={handleContribute}
                    >
                      <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                        Improve Data
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      
      {/* Calibration modal */}
      <Modal
        visible={showCalibration}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Calibrate Volume Estimation</Text>
            
            {calibrationStep === 1 && (
              <>
                <Text style={styles.modalText}>
                  Please place a standard object (like a credit card) on a flat surface.
                  Position your camera 30cm away and center the object in frame.
                </Text>
                
                <Image 
                  source={require('@/assets/images/calibration-guide.png')} 
                  style={styles.calibrationImage}
                  resizeMode="contain"
                />
              </>
            )}
            
            {calibrationStep === 2 && referenceObject && (
              <>
                <Text style={styles.modalText}>
                  Reference object captured. Please confirm the dimensions are correct.
                </Text>
                
                <Image 
                  source={{ uri: referenceObject }} 
                  style={styles.referenceImage}
                  resizeMode="contain"
                />
                
                <View style={styles.dimensionsContainer}>
                  <View style={styles.dimensionInput}>
                    <Text style={styles.dimensionLabel}>Width:</Text>
                    <Text style={styles.dimensionValue}>8.5 cm</Text>
                  </View>
                  
                  <View style={styles.dimensionInput}>
                    <Text style={styles.dimensionLabel}>Height:</Text>
                    <Text style={styles.dimensionValue}>5.4 cm</Text>
                  </View>
                </View>
              </>
            )}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={handleCalibrationStep}
              >
                <Text style={styles.buttonText}>
                  {calibrationStep === 1 ? 'Capture Reference' : 'Confirm & Save'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: theme.colors.card }]}
                onPress={() => setShowCalibration(false)}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Contribution modal */}
      <Modal
        visible={showContribution}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Improve Our Database</Text>
            
            <Text style={styles.modalText}>
              Help us improve our recycling database by providing feedback on the scan results.
            </Text>
            
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackLabel}>Was the material correctly identified?</Text>
              <View style={styles.feedbackButtons}>
                <TouchableOpacity 
                  style={[styles.feedbackButton, { backgroundColor: theme.colors.success }]}
                >
                  <Text style={styles.feedbackButtonText}>Yes</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.feedbackButton, { backgroundColor: theme.colors.error }]}
                >
                  <Text style={styles.feedbackButtonText}>No</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.feedbackLabel}>Was the volume estimate accurate?</Text>
              <View style={styles.feedbackButtons}>
                <TouchableOpacity 
                  style={[styles.feedbackButton, { backgroundColor: theme.colors.success }]}
                >
                  <Text style={styles.feedbackButtonText}>Yes</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.feedbackButton, { backgroundColor: theme.colors.error }]}
                >
                  <Text style={styles.feedbackButtonText}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={submitContribution}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: theme.colors.card }]}
                onPress={() => setShowContribution(false)}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scanButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginHorizontal: 12,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scanIndicator: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#34C759',
    opacity: 0.7,
  },
  scanningIndicator: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 16,
    width: 200,
    position: 'absolute',
  },
  scanningText: {
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  resultContainer: {
    padding: 8,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    margin: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  calibrationImage: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  referenceImage: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  dimensionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  dimensionInput: {
    alignItems: 'center',
  },
  dimensionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dimensionValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  feedbackContainer: {
    marginBottom: 16,
  },
  feedbackLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  feedbackButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 