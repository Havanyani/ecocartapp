import { useTheme } from '@/hooks/useTheme';
import { CommonMaterials } from '@/utils/material-detection';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import ARGuideOverlay from './ARGuideOverlay';

// Define container types
export interface RecognizedContainer {
  id: string;
  name: string;
  material: string;
  materialType?: CommonMaterials;
  isRecyclable: boolean;
  confidence: number; // 0 to 1
  instructions?: string;
  volume?: number;
  weight?: number;
  environmentalImpact?: {
    carbonFootprintSaved?: number;
    waterSaved?: number;
    energySaved?: number;
    landfillSpaceSaved?: number;
  };
  recycleCodes?: string[];
}

interface ARContainerScannerWithVolumeEstimationProps {
  navigation: any;
  onClose: () => void;
  onContainerRecognized: (container: RecognizedContainer) => void;
  onVolumeEstimated: (volume: number) => void;
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
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [containerDetected, setContainerDetected] = useState(false);
  const [recognizedContainer, setRecognizedContainer] = useState<RecognizedContainer | null>(null);
  const [showContribution, setShowContribution] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(1);
  const [referenceObject, setReferenceObject] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [materialDetectionComplete, setMaterialDetectionComplete] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const cameraRef = React.useRef<Camera>(null);
  const pulseAnimation = React.useRef(new Animated.Value(1)).current;

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Handle camera ready
  const handleCameraReady = () => {
    setCameraReady(true);
  };

  // Simulate container recognition (for testing)
  const simulateContainerRecognition = async () => {
    setIsScanning(true);
    setContainerDetected(true);
    
    // Simulate scanning progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setScanProgress(i);
    }
    
    setMaterialDetectionComplete(true);
    
    // Simulate recognized container
    const container: RecognizedContainer = {
      id: '1',
      name: 'Plastic Bottle',
      material: 'PET',
      materialType: CommonMaterials.PET,
      isRecyclable: true,
      confidence: 0.95,
      volume: 500,
      weight: 25,
      instructions: 'Rinse and remove cap',
      environmentalImpact: {
        carbonFootprintSaved: 2.5,
        waterSaved: 3.2,
        energySaved: 0.8,
        landfillSpaceSaved: 0.5
      },
      recycleCodes: ['1']
    };
    
    setRecognizedContainer(container);
    setIsScanning(false);
  };

  // Handle scanning
  const scanForContainer = async () => {
    if (!cameraReady) return;
    
    setIsScanning(true);
    setContainerDetected(false);
    setMaterialDetectionComplete(false);
    setScanProgress(0);
    
    try {
      // In a real app, this would use the camera to capture and analyze the image
      if (testMode) {
        await simulateContainerRecognition();
      } else {
        // TODO: Implement actual container recognition
        Alert.alert('Not Implemented', 'Container recognition is not implemented in this version.');
      }
    } catch (error) {
      console.error('Error scanning container:', error);
      Alert.alert('Error', 'Failed to scan container. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  // Handle calibration
  const startCalibration = () => {
    setShowCalibration(true);
    setCalibrationStep(1);
  };

  const handleCalibrationStep = () => {
    if (calibrationStep === 1) {
      // Simulate capturing reference object
      setReferenceObject('https://picsum.photos/400/300');
      setCalibrationStep(2);
    } else {
      // Save calibration and close
      setShowCalibration(false);
    }
  };

  // Handle contribution
  const handleContributionSuccess = () => {
    setShowContribution(false);
    onClose();
  };

  const handleContributionCancel = () => {
    setShowContribution(false);
  };

  // Handle gallery
  const openGallery = () => {
    // TODO: Implement gallery picker
    Alert.alert('Not Implemented', 'Gallery picker is not implemented in this version.');
  };

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>
          Camera access is required to use the AR scanner.
        </Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={onClose}
        >
          <Text style={[styles.buttonText, { color: theme.colors.textInverse }]}>
            Close
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
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
                <MaterialCommunityIcons name="image" size={24} color={theme.colors.primary} />
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
          <MaterialCommunityIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </Camera>
      
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
                  
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                      style={[styles.button, { backgroundColor: theme.colors.primary }]}
                      onPress={() => {
                        onContainerRecognized(recognizedContainer);
                        onClose();
                      }}
                    >
                      <Text style={styles.buttonText}>Add to Collection</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.button, { backgroundColor: theme.colors.secondary }]}
                      onPress={() => setRecognizedContainer(null)}
                    >
                      <Text style={styles.buttonText}>Scan Another</Text>
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
                onPress={handleContributionSuccess}
              >
                <Text style={styles.buttonText}>Submit Feedback</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: theme.colors.card }]}
                onPress={handleContributionCancel}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                  Skip
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000', // Mock camera background
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  scanButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanningIndicator: {
    position: 'absolute',
    top: height / 2 - 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scanningText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    paddingHorizontal: 16,
  },
  resultContainer: {
    paddingVertical: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
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
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tipText: {
    color: 'white',
    fontSize: 14,
    marginTop: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanIndicator: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#fff',
    position: 'absolute',
  },
  progressBarContainer: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  calibrationImage: {
    width: width - 32,
    height: 200,
    marginBottom: 20,
  },
  referenceImage: {
    width: width - 32,
    height: 200,
    marginBottom: 20,
    borderRadius: 8,
  },
  dimensionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
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
    fontWeight: '600',
  },
  feedbackContainer: {
    marginBottom: 20,
  },
  feedbackLabel: {
    fontSize: 16,
    marginBottom: 12,
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  feedbackButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  feedbackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 