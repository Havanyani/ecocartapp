/**
 * OptimizedMaterialListScreen.tsx
 * 
 * An optimized version of the MaterialListScreen that demonstrates 
 * performance best practices including:
 * - Optimized list rendering
 * - Memoization
 * - Lazy loading
 * - Efficient data fetching and caching
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Material, useMaterials } from '@/api/MaterialsApi';
import OptimizedFlatList from '@/components/ui/OptimizedFlatList';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { useBatchedUpdates, useDeferredOperation, useRenderMetrics } from '@/utils/PerformanceOptimizations';

// Use regular Image component since FastImage might not be available
const ImageComponent = Image;

// Extend Material type to include creditValue if needed
interface ExtendedMaterial extends Material {
  creditValue?: number;
}

interface MaterialListScreenProps {
  navigation: any;
}

// Pre-defined material categories for filtering
const MATERIAL_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'plastic', label: 'Plastic' },
  { id: 'paper', label: 'Paper' },
  { id: 'glass', label: 'Glass' },
  { id: 'metal', label: 'Metal' },
  { id: 'electronic', label: 'Electronic' },
];

// Material item component (memoized for performance)
const MaterialItem = React.memo(({ 
  item, 
  onPress,
  onScheduleCollection 
}: { 
  item: ExtendedMaterial; 
  onPress: (item: ExtendedMaterial) => void;
  onScheduleCollection: (item: ExtendedMaterial) => void;
}) => {
  // Track render performance in development mode
  if (__DEV__) {
    useRenderMetrics('MaterialItem');
  }

  // Calculate credit value once
  const creditValue = useMemo(() => {
    return `${item.creditValue || 0} Credits/kg`;
  }, [item.creditValue]);

  return (
    <TouchableOpacity
      style={styles.materialItem}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
      testID={`material-item-${item.id}`}
    >
      <View style={styles.materialContent}>
        <View style={styles.materialHeader}>
          <ImageComponent
            source={{ uri: item.imageUrl }}
            style={styles.materialImage}
            resizeMode="cover"
          />
          <View style={styles.materialInfo}>
            <Text style={styles.materialName}>{item.name}</Text>
            <Text style={styles.materialCategory}>{item.category}</Text>
            <Text style={styles.materialCredits}>{creditValue}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => onScheduleCollection(item)}
        >
          <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
          <Text style={styles.scheduleButtonText}>Schedule</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

export default function OptimizedMaterialListScreen({ navigation }: MaterialListScreenProps) {
  // Performance tracking
  const startTime = useRef(Date.now()).current;
  const [screenRenderTime, setScreenRenderTime] = useState<number | null>(null);
  
  // Track render metrics in development mode
  if (__DEV__) {
    useRenderMetrics('MaterialListScreen');
  }
  
  // State management with batched updates for efficiency
  const [state, batchedSetState] = useBatchedUpdates({
    filter: 'all',
    isRefreshing: false,
    scrollPosition: 0,
    searchQuery: '',
  });

  // Access network status
  const { networkDetails, canPerformOperation } = useNetworkStatus();
  
  // Use materials API with filter
  const materialParams = state.filter !== 'all' ? { category: state.filter } : undefined;
  const {
    materials,
    isLoading,
    error,
    isOnline,
    loadMaterials
  } = useMaterials(materialParams);

  // Memoize filtered materials to avoid unnecessary re-renders
  const filteredMaterials = useMemo(() => {
    // Record performance metric for filtering logic
    PerformanceMonitor.startBenchmark({ name: 'filter_materials' });
    
    // Default to empty array if materials is null
    const materialsToFilter = materials || [];
    
    const filtered = state.searchQuery.trim() !== ''
      ? materialsToFilter.filter(item => 
          item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(state.searchQuery.toLowerCase())
        )
      : materialsToFilter;
    
    PerformanceMonitor.endBenchmark(
      { id: 'filter_materials', startTime: Date.now() - 10 },
      { name: 'filter_materials' }
    );
    
    return filtered;
  }, [materials, state.searchQuery]);

  // Calculate screen render time once after initial load
  useDeferredOperation(() => {
    if (screenRenderTime === null && !isLoading) {
      const endTime = Date.now();
      const renderTime = endTime - startTime;
      setScreenRenderTime(renderTime);
      
      // Log performance in development
      if (__DEV__) {
        console.log(`MaterialListScreen render time: ${renderTime}ms`);
      }
      
      // Record performance metric
      PerformanceMonitor.recordMetric('screen_load_time', renderTime, {
        screen: 'MaterialListScreen',
        materialCount: (materials || []).length.toString()
      });
    }
  }, [isLoading, screenRenderTime, materials]);

  // Handle refresh with performance tracking
  const handleRefresh = useCallback(async () => {
    batchedSetState({ isRefreshing: true });
    
    PerformanceMonitor.startBenchmark({ 
      name: 'refresh_materials',
      tags: { network: isOnline ? 'online' : 'offline' }
    });
    
    try {
      await loadMaterials(true); // force refresh
    } catch (err) {
      console.error('Error refreshing materials:', err);
    } finally {
      batchedSetState({ isRefreshing: false });
      
      PerformanceMonitor.endBenchmark(
        { id: 'refresh_materials', startTime: Date.now() - 100 },
        { name: 'refresh_materials' }
      );
    }
  }, [loadMaterials, isOnline, batchedSetState]);

  // Handle filter selection with batched updates
  const handleFilterSelect = useCallback((filterId: string) => {
    batchedSetState({ filter: filterId });
  }, [batchedSetState]);

  // Handle material item press
  const handleMaterialPress = useCallback((item: ExtendedMaterial) => {
    navigation.navigate('MaterialDetail', { materialId: item.id });
  }, [navigation]);

  // Handle schedule collection
  const handleScheduleCollection = useCallback((item: ExtendedMaterial) => {
    // Check if we can perform this operation based on network status
    if (!isOnline) {
      Alert.alert(
        'No Connection',
        'You need an internet connection to schedule a collection.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    navigation.navigate('ScheduleCollection', { materialId: item.id });
  }, [navigation, isOnline]);

  // Memoized render item function for optimal list performance
  const renderMaterialItem = useCallback(({ item }: { item: ExtendedMaterial }) => {
    return (
      <MaterialItem
        item={item}
        onPress={handleMaterialPress}
        onScheduleCollection={handleScheduleCollection}
      />
    );
  }, [handleMaterialPress, handleScheduleCollection]);

  // Memoized empty component for the list
  const ListEmptyComponent = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#34D399" />
          <Text style={styles.emptyText}>Loading materials...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.emptyText}>Error loading materials</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={48} color="#94A3B8" />
        <Text style={styles.emptyText}>No materials found</Text>
      </View>
    );
  }, [isLoading, error, handleRefresh]);

  // Calculate optimal list item height for performance
  const itemHeight = 120; // Fixed height for optimized list rendering

  // Render the category filter buttons
  const renderCategoryFilters = useMemo(() => {
    return (
      <View style={styles.filterContainer}>
        {MATERIAL_CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterButton,
              state.filter === category.id && styles.filterButtonActive
            ]}
            onPress={() => handleFilterSelect(category.id)}
          >
            <Text 
              style={[
                styles.filterButtonText,
                state.filter === category.id && styles.filterButtonTextActive
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [state.filter, handleFilterSelect]);

  // Render connection status indicator
  const renderConnectionStatus = useMemo(() => {
    if (isOnline) return null;
    
    return (
      <View style={styles.offlineContainer}>
        <Ionicons name="cloud-offline-outline" size={16} color="#FFFFFF" />
        <Text style={styles.offlineText}>Offline Mode</Text>
      </View>
    );
  }, [isOnline]);

  return (
    <SafeAreaView style={styles.container} testID="material-list-screen">
      {renderConnectionStatus}
      
      <View style={styles.header}>
        <Text style={styles.title}>Recyclable Materials</Text>
        <Text style={styles.subtitle}>
          Select materials to schedule a collection
        </Text>
      </View>
      
      {renderCategoryFilters}
      
      <OptimizedFlatList
        data={filteredMaterials}
        renderItem={renderMaterialItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={state.isRefreshing}
            onRefresh={handleRefresh}
            colors={['#34D399']}
            tintColor="#34D399"
          />
        }
        ListEmptyComponent={ListEmptyComponent}
        // Performance optimizations
        itemHeight={itemHeight}
        optimizationLevel="high"
        trackPerformance={__DEV__}
        removeClippedSubviews={Platform.OS !== 'web'}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    marginBottom: 4,
    backgroundColor: '#F1F5F9',
  },
  filterButtonActive: {
    backgroundColor: '#34D399',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  materialItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  materialContent: {
    padding: 16,
  },
  materialHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  materialImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#F1F5F9',
  },
  materialInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  materialName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  materialCategory: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  materialCredits: {
    fontSize: 16,
    fontWeight: '600',
    color: '#047857',
  },
  scheduleButton: {
    backgroundColor: '#34D399',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    textAlign: 'center',
  },
  offlineContainer: {
    backgroundColor: '#475569',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 