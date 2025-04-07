import { ThemedText } from '@/components/ui/ThemedText';
import { useMaterialBarcodeScanner } from '@/hooks/useMaterialBarcodeScanner';
import { useTheme } from '@/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

interface BarcodeScannerScreenProps {
  route?: {
    params?: {
      onMaterialSelect?: (materialId: string) => void;
    }
  }
}

/**
 * BarcodeScannerScreen
 * 
 * A screen that uses the device camera to scan product barcodes and
 * match them to recyclable materials in the database.
 */
export default function BarcodeScannerScreen({ route }: BarcodeScannerScreenProps) {
  const theme = useTheme()();
  const navigation = useNavigation();
  const onMaterialSelect = route?.params?.onMaterialSelect;
  
  // Animation for scan line
  const [scanLineAnimation] = useState(new Animated.Value(0));
  
  // State for visual feedback during scanning
  const [scanFeedback, setScanFeedback] = useState<'idle' | 'scanning' | 'recognized' | 'error'>('idle');
  
  const { 
    hasPermission,
    scannedCode,
    isScanning,
    isLoading,
    scanResult,
    error,
    scanBarcode,
    resetScan,
    requestPermissions,
    handleBarCodeScanned,
    contributeBarcode
  } = useMaterialBarcodeScanner();

  useEffect(() => {
    // Request camera permission on mount
    requestPermissions();
    
    // Start scan line animation
    startScanAnimation();
  }, [requestPermissions]);
  
  // Start the scanning animation
  const startScanAnimation = () => {
    scanLineAnimation.setValue(0);
    Animated.loop(
      Animated.timing(scanLineAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };
  
  // Update scan feedback state based on scan process
  useEffect(() => {
    if (isLoading) {
      setScanFeedback('scanning');
    } else if (scanResult) {
      setScanFeedback('recognized');
    } else if (error) {
      setScanFeedback('error');
    } else {
      setScanFeedback('idle');
    }
  }, [isLoading, scanResult, error]);

  const handleMaterialSelect = (materialId: string) => {
    if (onMaterialSelect) {
      onMaterialSelect(materialId);
      navigation.goBack();
    } else {
      // If no callback provided, navigate to material detail screen
      navigation.navigate('MaterialDetail', { materialId });
    }
  };
  
  const handleVolumeEstimation = () => {
    if (!scanResult) return;
    
    // Navigate to AR scanner for volume estimation with the detected material
    navigation.navigate('ARContainerScan', { 
      materialId: scanResult.material.id,
      barcode: scannedCode,
      onVolumeEstimated: (volume) => {
        // Handle the estimated volume
        Alert.alert(
          'Volume Estimated',
          `Estimated container volume: ${volume.toFixed(0)}ml\nThank you for recycling!`
        );
      }
    });
  };

  const handleContributePress = () => {
    if (!scannedCode) return;
    
    Alert.prompt(
      'Contribute Material Information',
      'Please enter the material type for this product:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit', 
          onPress: (materialType?: string) => {
            if (materialType) {
              contributeBarcode(scannedCode, materialType)
                .then(() => {
                  Alert.alert(
                    'Thank you!',
                    'Your contribution helps improve our database.'
                  );
                  resetScan();
                })
                .catch(err => {
                  Alert.alert('Error', 'Failed to submit your contribution.');
                });
            }
          }
        }
      ]
    );
  };

  // Permission not granted yet
  if (hasPermission === null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  // Permission denied
  if (hasPermission === false) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ThemedText variant="h2" style={styles.title}>Camera Permission Required</ThemedText>
        <ThemedText style={styles.description}>
          Camera access is needed to scan barcodes. Please grant permission in your device settings.
        </ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={requestPermissions}
        >
          <ThemedText style={styles.buttonText}>Request Permission</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.card, marginTop: 12 }]}
          onPress={() => navigation.goBack()}
        >
          <ThemedText>Go Back</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Scan Barcode</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          type={Camera.Constants.Type.back}
          barCodeScannerSettings={{
            barCodeTypes: [
              BarCodeScanner.Constants.BarCodeType.ean13,
              BarCodeScanner.Constants.BarCodeType.ean8,
              BarCodeScanner.Constants.BarCodeType.upc_e,
              BarCodeScanner.Constants.BarCodeType.upc_a,
            ],
          }}
          onBarCodeScanned={isScanning ? handleBarCodeScanned : undefined}
        >
          {/* Scanner UI overlay */}
          <View style={styles.overlay}>
            <View style={[
              styles.scanArea,
              scanFeedback === 'recognized' && styles.scanAreaSuccess,
              scanFeedback === 'error' && styles.scanAreaError
            ]}>
              <View style={styles.scanAreaCorner1} />
              <View style={styles.scanAreaCorner2} />
              <View style={styles.scanAreaCorner3} />
              <View style={styles.scanAreaCorner4} />
              
              {/* Animated scan line */}
              {isScanning && (
                <Animated.View 
                  style={[
                    styles.scanLine,
                    {
                      transform: [{
                        translateY: scanLineAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 240],
                        }),
                      }],
                    },
                  ]}
                />
              )}
            </View>
            
            <ThemedText style={styles.scanInstructions}>
              {scanFeedback === 'recognized' ? 'Barcode identified!' :
              scanFeedback === 'error' ? 'Barcode not recognized' :
              scanFeedback === 'scanning' ? 'Processing barcode...' :
              'Point camera at a product barcode'}
            </ThemedText>
          </View>
        </Camera>
      </View>

      {/* Bottom Panel */}
      <View style={[styles.bottomPanel, { backgroundColor: theme.colors.card }]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <ThemedText style={styles.loadingText}>Identifying material...</ThemedText>
          </View>
        ) : (
          <>
            {scanResult ? (
              <View style={styles.resultContainer}>
                <ThemedText variant="h3" style={styles.resultTitle}>
                  {scanResult.material.name}
                </ThemedText>
                <ThemedText style={styles.resultCategory}>
                  Category: {scanResult.material.category}
                </ThemedText>
                <ThemedText style={styles.resultDescription} numberOfLines={2}>
                  {scanResult.material.description}
                </ThemedText>
                
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.primary }]}
                    onPress={() => handleMaterialSelect(scanResult.material.id)}
                  >
                    <ThemedText style={styles.buttonText}>View Details</ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.success }]}
                    onPress={handleVolumeEstimation}
                  >
                    <View style={styles.buttonContent}>
                      <MaterialCommunityIcons name="cube-scan" size={18} color="#fff" style={styles.buttonIcon} />
                      <ThemedText style={styles.buttonText}>Estimate Volume</ThemedText>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.card, marginTop: 8 }]}
                    onPress={resetScan}
                  >
                    <ThemedText>Scan Again</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <ThemedText variant="h3" style={styles.errorTitle}>
                  Material Not Found
                </ThemedText>
                {scannedCode && (
                  <ThemedText style={styles.barcodeText}>
                    Barcode: {scannedCode}
                  </ThemedText>
                )}
                <ThemedText style={styles.errorDescription}>
                  This product barcode isn't in our database yet. Would you like to contribute?
                </ThemedText>
                
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.primary }]}
                    onPress={handleContributePress}
                  >
                    <ThemedText style={styles.buttonText}>Contribute Material Info</ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.card, marginTop: 8 }]}
                    onPress={resetScan}
                  >
                    <ThemedText>Scan Again</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.instructionsContainer}>
                <ThemedText style={styles.instructions}>
                  Scan a product barcode to identify its recyclable material type
                </ThemedText>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#ffffff80',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  scanAreaSuccess: {
    borderColor: '#34C759',
  },
  scanAreaError: {
    borderColor: '#FF3B30',
  },
  scanLine: {
    height: 2,
    width: '100%',
    backgroundColor: '#ffffff',
    position: 'absolute',
  },
  scanAreaCorner1: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#fff',
    borderTopLeftRadius: 8,
  },
  scanAreaCorner2: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#fff',
    borderTopRightRadius: 8,
  },
  scanAreaCorner3: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#fff',
    borderBottomLeftRadius: 8,
  },
  scanAreaCorner4: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#fff',
    borderBottomRightRadius: 8,
  },
  scanInstructions: {
    color: '#fff',
    marginTop: 24,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bottomPanel: {
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  resultContainer: {
    padding: 8,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultCategory: {
    fontSize: 16,
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  errorContainer: {
    padding: 8,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#FF3B30',
  },
  barcodeText: {
    fontFamily: 'monospace',
    fontSize: 14,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
}); 