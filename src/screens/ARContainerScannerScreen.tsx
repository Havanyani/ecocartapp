import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import ARContainerScanner from '@/components/ar/ARContainerScanner';
import { ARContainerScannerScreenProps } from '@/navigation/types';
import { ARContainerRecognitionService } from '@/services/ARContainerRecognitionService';
import { ContainerEnvironmentalImpact, RecognizedContainer } from '@/types/ar';

export default function ARContainerScannerScreen({ navigation }: ARContainerScannerScreenProps) {
  const [isScanActive, setIsScanActive] = useState(true);
  const [saveDetectedImages, setSaveDetectedImages] = useState(false);
  const [detectionHistory, setDetectionHistory] = useState<Array<ContainerEnvironmentalImpact>>([]);
  const [totalCredits, setTotalCredits] = useState(0);

  // Make sure the recognition service is initialized
  useEffect(() => {
    ARContainerRecognitionService.getInstance();
  }, []);

  // Reset scan state when screen gains focus
  useFocusEffect(
    useCallback(() => {
      setIsScanActive(true);
      return () => {
        setIsScanActive(false);
      };
    }, [])
  );

  // Handle container detection
  const handleContainerDetected = (container: RecognizedContainer) => {
    // Pause scanning temporarily when a container is detected
    setIsScanActive(false);
    
    // Calculate environmental impact for the detected container
    const recognitionService = ARContainerRecognitionService.getInstance();
    const environmentalImpact = recognitionService.calculateEnvironmentalImpact(container);
    
    // Update detection history and total credits
    setDetectionHistory(prev => [environmentalImpact, ...prev]);
    setTotalCredits(prev => prev + environmentalImpact.recyclingCredits);
    
    // Show success alert
    Alert.alert(
      'Container Detected!',
      `You've earned ${environmentalImpact.recyclingCredits} EcoCredits for recycling this container.`,
      [{ text: 'Continue Scanning', onPress: () => setIsScanActive(true) }]
    );
  };

  // Handle scanner errors
  const handleScanError = (errorMessage: string) => {
    Alert.alert('Scan Error', errorMessage, [
      { text: 'Try Again', onPress: () => setIsScanActive(true) }
    ]);
  };

  // Toggle saving detected images
  const toggleSaveImages = () => {
    setSaveDetectedImages(prev => !prev);
  };

  // Go back to the previous screen
  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />
      
      <View style={styles.container}>
        {/* AR Container Scanner */}
        {isScanActive && (
          <ARContainerScanner
            onContainerDetected={handleContainerDetected}
            onError={handleScanError}
            showGuide={true}
            saveDetectedImages={saveDetectedImages}
            detectionInterval={800}
          />
        )}
        
        {/* Top Bar with Controls */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleGoBack}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Scan Container</Text>
          
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              saveDetectedImages ? styles.saveButtonActive : {}
            ]} 
            onPress={toggleSaveImages}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <MaterialIcons 
              name="photo-camera" 
              size={20} 
              color={saveDetectedImages ? "#ffffff" : "#cccccc"} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Credits Counter */}
        <View style={styles.creditsContainer}>
          <Text style={styles.creditsLabel}>EcoCredits Earned</Text>
          <Text style={styles.creditsValue}>{totalCredits}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  saveButtonActive: {
    backgroundColor: '#4CAF50',
  },
  creditsContainer: {
    position: 'absolute',
    top: 70,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    zIndex: 10,
  },
  creditsLabel: {
    color: '#aaaaaa',
    fontSize: 12,
    marginBottom: 4,
  },
  creditsValue: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
  },
}); 