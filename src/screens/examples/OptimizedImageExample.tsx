/**
 * OptimizedImageExample.tsx
 * 
 * Example screen demonstrating the usage of the OptimizedImage component
 * and how it helps reduce bundle size and improve loading performance.
 */

import React, { useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import OptimizedImage from '../../components/OptimizedImage';
import AssetOptimizer from '../../utils/performance/AssetOptimizer';
import BundleAnalyzer, { ComponentType } from '../../utils/performance/BundleAnalyzer';

// Sample image URLs for demonstration
const IMAGE_URLS = [
  'https://images.unsplash.com/photo-1580742471944-c1a0c9c63463?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1580741212775-bca7c8911b98?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
];

// Example of a local image for bundling comparison
const LOCAL_IMAGE = require('../../assets/images/placeholder.png');

const OptimizedImageExample: React.FC = () => {
  const [useOptimization, setUseOptimization] = useState(true);
  const [useLazyLoading, setUseLazyLoading] = useState(true);
  const [stats, setStats] = useState<{
    originalSize: number;
    optimizedSize: number;
    savedPercentage: number;
  }>({
    originalSize: 0,
    optimizedSize: 0,
    savedPercentage: 0
  });

  // Simulate loading statistics for demonstration
  const calculateStats = () => {
    // In a real app, these would be actual measurements
    const originalSize = 5.2 * 1024 * 1024; // 5.2 MB
    const optimizedSize = useOptimization 
      ? 1.8 * 1024 * 1024 // 1.8 MB with optimization
      : originalSize;
    const savedPercentage = ((originalSize - optimizedSize) / originalSize) * 100;
    
    setStats({
      originalSize,
      optimizedSize,
      savedPercentage
    });
  };

  React.useEffect(() => {
    calculateStats();
    
    // Record this example component in the BundleAnalyzer for optimization tracking
    BundleAnalyzer.recordComponentSize(
      'OptimizedImageExample',
      ComponentType.SCREEN,
      useOptimization ? 380000 : 850000, // Simulated bundle size
      {
        dependencyCount: 3
      }
    );
  }, [useOptimization]);

  const formatBytes = (bytes: number): string => {
    return AssetOptimizer.formatFileSize(bytes);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Optimized Image Example</Text>
      </View>
      
      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Use Optimization</Text>
          <Switch
            value={useOptimization}
            onValueChange={setUseOptimization}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Use Lazy Loading</Text>
          <Switch
            value={useLazyLoading}
            onValueChange={setUseLazyLoading}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Performance Impact</Text>
        
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Original Size:</Text>
          <Text style={styles.statsValue}>{formatBytes(stats.originalSize)}</Text>
        </View>
        
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Optimized Size:</Text>
          <Text style={styles.statsValue}>{formatBytes(stats.optimizedSize)}</Text>
        </View>
        
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Savings:</Text>
          <Text style={[styles.statsValue, styles.savingsValue]}>
            {stats.savedPercentage.toFixed(1)}%
          </Text>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Comparison</Text>
      
      <ScrollView style={styles.content}>
        <View style={styles.comparisonContainer}>
          <View style={styles.comparisonColumn}>
            <Text style={styles.comparisonTitle}>Standard Image</Text>
            {IMAGE_URLS.map((url, index) => (
              <View key={`standard-${index}`} style={styles.imageContainer}>
                <Image 
                  source={{ uri: url }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <Text style={styles.imageCaption}>
                  Regular Image {index + 1}
                </Text>
              </View>
            ))}
            
            <View style={styles.imageContainer}>
              <Image 
                source={LOCAL_IMAGE}
                style={styles.image}
                resizeMode="cover"
              />
              <Text style={styles.imageCaption}>
                Local Image (Bundled)
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.comparisonColumn}>
            <Text style={styles.comparisonTitle}>Optimized Image</Text>
            {IMAGE_URLS.map((url, index) => (
              <View key={`optimized-${index}`} style={styles.imageContainer}>
                <OptimizedImage 
                  source={{ uri: url }}
                  style={styles.image}
                  resizeMode="cover"
                  lazyLoad={useLazyLoading}
                  disableOptimization={!useOptimization}
                  priority={index < 2 ? 'high' : index < 4 ? 'normal' : 'low'}
                />
                <Text style={styles.imageCaption}>
                  Optimized Image {index + 1}
                  {useLazyLoading && index > 2 ? ' (Lazy Loaded)' : ''}
                </Text>
              </View>
            ))}
            
            <View style={styles.imageContainer}>
              <OptimizedImage 
                source={LOCAL_IMAGE}
                style={styles.image}
                resizeMode="cover"
                disableOptimization={!useOptimization}
              />
              <Text style={styles.imageCaption}>
                Local Image (Optimized)
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={calculateStats}
      >
        <Text style={styles.refreshButtonText}>Refresh Stats</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  controls: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 8,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlLabel: {
    fontSize: 16,
    color: '#333333',
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 14,
    color: '#666666',
  },
  statsValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  savingsValue: {
    color: '#34C759',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  comparisonContainer: {
    flexDirection: 'row',
    paddingBottom: 20,
  },
  comparisonColumn: {
    flex: 1,
    padding: 8,
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#e1e1e1',
  },
  imageContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  imageCaption: {
    fontSize: 12,
    color: '#666666',
    padding: 8,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#0066cc',
    padding: 16,
    alignItems: 'center',
    margin: 16,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OptimizedImageExample; 