/**
 * MaterialListScreen.tsx
 * 
 * A screen that displays a list of recyclable materials with offline data support.
 * Uses the MaterialsApi to fetch data and caches it for offline access.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Material, useMaterials } from '@/api/MaterialsApi';
import useNetworkStatus from '@/hooks/useNetworkStatus';

interface MaterialListScreenProps {
  navigation: any;
}

export default function MaterialListScreen({ navigation }: MaterialListScreenProps) {
  // State for category filter
  const [filter, setFilter] = useState<string | null>(null);
  
  // Use the materials hook with filtering
  const materialParams = filter ? { category: filter } : undefined;
  const {
    materials,
    isLoading,
    error,
    isOnline,
    loadMaterials
  } = useMaterials(materialParams);

  // Get more detailed network information
  const { networkDetails, canPerformOperation } = useNetworkStatus();

  // Load materials on component mount
  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  // Handle refresh (pull-to-refresh)
  const handleRefresh = useCallback(async () => {
    if (canPerformOperation('low')) {
      try {
        await loadMaterials(true);
      } catch (error) {
        Alert.alert('Error', 'Failed to refresh materials. Please try again later.');
      }
    } else {
      Alert.alert('Offline', 'Cannot refresh while offline. Please check your connection.');
    }
  }, [canPerformOperation, loadMaterials]);

  // Handle material item press
  const handleMaterialPress = useCallback((material: Material) => {
    navigation.navigate('MaterialDetail', { id: material.id, material });
  }, [navigation]);

  // Get unique categories for filter buttons
  const categories = [...new Set(materials?.map(m => m.category) || [])];

  // Render a material card
  const renderMaterialItem = useCallback(({ item }: { item: Material }) => (
    <TouchableOpacity
      style={styles.materialCard}
      onPress={() => handleMaterialPress(item)}
    >
      <View style={styles.materialHeader}>
        <Text style={styles.materialName}>{item.name}</Text>
        {item.isHazardous && (
          <View style={styles.hazardousTag}>
            <Ionicons name="warning" size={12} color="#FFFFFF" />
            <Text style={styles.hazardousText}>Hazardous</Text>
          </View>
        )}
      </View>
      
      <View style={styles.materialBody}>
        <View style={styles.materialInfo}>
          <Text style={styles.categoryText}>{item.category}</Text>
          <Text style={styles.materialDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.recyclingRateContainer}>
            <Text style={styles.recyclingRateLabel}>Recycling Rate:</Text>
            <View style={styles.recyclingRateBarContainer}>
              <View 
                style={[
                  styles.recyclingRateBar, 
                  { width: `${item.recyclingRate}%` },
                  item.recyclingRate > 70 ? styles.highRate :
                  item.recyclingRate > 40 ? styles.mediumRate :
                  styles.lowRate
                ]} 
              />
            </View>
            <Text style={styles.recyclingRateText}>{item.recyclingRate}%</Text>
          </View>
        </View>
        
        {/* Placeholder or actual image */}
        <View style={styles.materialImageContainer}>
          {item.imageUrl ? (
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.materialImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.materialImagePlaceholder}>
              <Ionicons name="leaf" size={40} color="#34C759" />
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.materialFooter}>
        <Text style={styles.acceptedFormsLabel}>Accepted Forms:</Text>
        <View style={styles.acceptedFormsContainer}>
          {item.acceptedForms.map((form, index) => (
            <View key={index} style={styles.acceptedFormTag}>
              <Text style={styles.acceptedFormText}>{form}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  ), [handleMaterialPress]);

  // Render filter buttons
  const renderFilterButtons = useCallback(() => (
    <View style={styles.filterContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterButtonsContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === null && styles.filterButtonActive
          ]}
          onPress={() => setFilter(null)}
        >
          <Text style={[
            styles.filterButtonText,
            filter === null && styles.filterButtonTextActive
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterButton,
              filter === category && styles.filterButtonActive
            ]}
            onPress={() => setFilter(category)}
          >
            <Text style={[
              styles.filterButtonText,
              filter === category && styles.filterButtonTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  ), [filter, categories]);

  // Show loading indicator
  if (isLoading && !materials?.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34C759" />
        <Text style={styles.loadingText}>Loading materials...</Text>
      </View>
    );
  }

  // Show error state
  if (error && !materials?.length) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#FF3B30" />
        <Text style={styles.errorTitle}>Failed to load materials</Text>
        <Text style={styles.errorText}>{error.message}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadMaterials()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recyclable Materials</Text>
        
        <View style={styles.connectionStatus}>
          <View 
            style={[
              styles.statusIndicator, 
              isOnline ? styles.statusOnline : styles.statusOffline
            ]} 
          />
          <Text style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>
      
      {renderFilterButtons()}
      
      <FlatList
        data={materials}
        renderItem={renderMaterialItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={['#34C759']}
            tintColor="#34C759"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="trash-bin-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>No Materials Found</Text>
            <Text style={styles.emptyText}>
              {isOnline
                ? 'Pull down to refresh and try again'
                : 'Connect to the internet to load materials'}
            </Text>
          </View>
        }
      />
      
      {/* Network details footer */}
      {networkDetails?.type && (
        <View style={styles.networkInfo}>
          <Text style={styles.networkInfoText}>
            Network: {networkDetails.type}
            {networkDetails.isWifi && ' (WiFi)'}
            {networkDetails.isCellular && ' (Cellular)'}
          </Text>
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
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2C76E5',
    borderRadius: 8
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000'
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4
  },
  statusOnline: {
    backgroundColor: '#34C759'
  },
  statusOffline: {
    backgroundColor: '#FF9500'
  },
  statusText: {
    fontSize: 12,
    color: '#8E8E93'
  },
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  filterButtonsContainer: {
    paddingHorizontal: 16
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F2F2F7'
  },
  filterButtonActive: {
    backgroundColor: '#34C759'
  },
  filterButtonText: {
    fontSize: 14,
    color: '#8E8E93'
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  listContainer: {
    padding: 16
  },
  materialCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#F9F9F9'
  },
  materialName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000'
  },
  hazardousTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 12
  },
  hazardousText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  materialBody: {
    flexDirection: 'row',
    padding: 16
  },
  materialInfo: {
    flex: 1,
    marginRight: 16
  },
  categoryText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4
  },
  materialDescription: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 12
  },
  recyclingRateContainer: {
    marginTop: 8
  },
  recyclingRateLabel: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 4
  },
  recyclingRateBarContainer: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden'
  },
  recyclingRateBar: {
    height: '100%',
    borderRadius: 4
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
  recyclingRateText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'right'
  },
  materialImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden'
  },
  materialImage: {
    width: '100%',
    height: '100%'
  },
  materialImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7'
  },
  materialFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA'
  },
  acceptedFormsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8
  },
  acceptedFormsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  acceptedFormTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#EBF2FF',
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8
  },
  acceptedFormText: {
    fontSize: 12,
    color: '#2C76E5'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8E8E93',
    marginTop: 16
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8
  },
  networkInfo: {
    padding: 8,
    backgroundColor: '#F2F2F7',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA'
  },
  networkInfoText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center'
  }
}); 