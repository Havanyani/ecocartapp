/**
 * ARContainerScanScreen.tsx
 * 
 * Screen for scanning recyclable containers using AR and estimating their volume.
 */

import ARContainerScannerWithVolumeEstimation from '@/components/ar/ARContainerScannerWithVolumeEstimation';
import { useMaterialsData } from '@/hooks/useMaterialsData';
import { useTheme } from '@/hooks/useTheme';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';

interface ARContainerScanScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{
    params: {
      materialId?: string;
      barcode?: string;
      onVolumeEstimated?: (volume: number) => void;
    }
  }>;
}

export default function ARContainerScanScreen({ navigation, route }: ARContainerScanScreenProps) {
  const { theme } = useTheme();
  const { materialId, barcode, onVolumeEstimated } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  
  // Get material data if materialId is provided
  const { data: material, isLoading: isMaterialLoading } = useMaterialsData(
    materialId ? materialId : undefined
  );
  
  // Handle closing the scanner
  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  
  // Handle container recognition
  const handleContainerRecognized = useCallback((container) => {
    // Handle the recognized container data
    console.log('Container recognized:', container);
    
    // If there's a specific callback for volume estimation
    if (onVolumeEstimated && container.volume) {
      onVolumeEstimated(container.volume);
    }
  }, [onVolumeEstimated]);
  
  // Handle volume estimation completion
  const handleVolumeEstimated = useCallback((volume: number) => {
    if (onVolumeEstimated) {
      onVolumeEstimated(volume);
    }
  }, [onVolumeEstimated]);
  
  // If loading material data, show loading indicator
  if (materialId && isMaterialLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ARContainerScannerWithVolumeEstimation
        navigation={navigation}
        onClose={handleClose}
        onContainerRecognized={handleContainerRecognized}
        onVolumeEstimated={handleVolumeEstimated}
        materialId={materialId}
        barcode={barcode}
        testMode={__DEV__} // Enable test mode in development
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
}); 