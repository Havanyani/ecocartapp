/**
 * MaterialListScreen.tsx
 * 
 * A screen that displays a list of recyclable materials with search, filtering, and sorting.
 * Uses the MaterialsApi to fetch data and caches it for offline access.
 */

import { Material, useMaterials } from '@/api/MaterialsApi';
import { OptimizedListView } from '@/components/ui/OptimizedListView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Possible sort options
type SortOption = 'name' | 'recyclingRate' | 'category';

// Filter options
interface FilterOptions {
  search: string;
  category: string | null;
  isHazardous: boolean | null;
  minRecyclingRate: number;
}

interface MaterialListScreenProps {
  navigation: any;
}

export default function MaterialListScreen({ navigation }: MaterialListScreenProps) {
  const theme = useTheme()();
  const { isOnline, networkDetails, canPerformOperation } = useNetworkStatus();
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  
  // State for filtering and sorting
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: '',
    category: null,
    isHazardous: null,
    minRecyclingRate: 0,
  });
  
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Use the materials hook with filtering
  const {
    materials: allMaterials,
    isLoading,
    error,
    loadMaterials
  } = useMaterials();

  // Filter and sort materials
  const materials = useMemo(() => {
    if (!allMaterials) return [];
    
    // First apply filters
    let filteredMaterials = allMaterials.filter(material => {
      // Search text filter
      if (filterOptions.search && !material.name.toLowerCase().includes(filterOptions.search.toLowerCase()) &&
          !material.description.toLowerCase().includes(filterOptions.search.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (filterOptions.category && material.category !== filterOptions.category) {
        return false;
      }
      
      // Hazardous filter
      if (filterOptions.isHazardous !== null && material.isHazardous !== filterOptions.isHazardous) {
        return false;
      }
      
      // Recycling rate filter
      if (material.recyclingRate < filterOptions.minRecyclingRate) {
        return false;
      }
      
      return true;
    });
    
    // Then sort
    return filteredMaterials.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'recyclingRate':
          comparison = a.recyclingRate - b.recyclingRate;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [allMaterials, filterOptions, sortBy, sortDirection]);

  // Load materials on component mount and when returning to the screen
  useFocusEffect(
    useCallback(() => {
      loadMaterials();
    }, [loadMaterials])
  );

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
  const categories = useMemo(() => {
    if (!allMaterials) return [];
    return [...new Set(allMaterials.map(m => m.category))];
  }, [allMaterials]);

  // Handle search input
  const handleSearch = (text: string) => {
    setFilterOptions(prev => ({ ...prev, search: text }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilterOptions({
      search: '',
      category: null,
      isHazardous: null,
      minRecyclingRate: 0
    });
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Change sort field
  const handleSortChange = (option: SortOption) => {
    if (sortBy === option) {
      toggleSortDirection();
    } else {
      setSortBy(option);
      setSortDirection('asc');
    }
  };

  // Handle barcode scan
  const handleBarcodeScan = () => {
    navigation.navigate('BarcodeScanner');
  };

  // Render a material card
  const renderMaterialItem = useCallback(({ item }: { item: Material }) => (
    <TouchableOpacity
      style={[styles.materialCard, { backgroundColor: theme.colors.card }]}
      onPress={() => handleMaterialPress(item)}
      testID={`material-card-${item.id}`}
    >
      <View style={styles.materialHeader}>
        <ThemedText style={styles.materialName}>{item.name}</ThemedText>
        {item.isHazardous && (
          <View style={styles.hazardousTag}>
            <Ionicons name="warning" size={12} color="#FFFFFF" />
            <ThemedText style={styles.hazardousText}>Hazardous</ThemedText>
          </View>
        )}
      </View>
      
      <View style={styles.materialBody}>
        <View style={styles.materialInfo}>
          <ThemedText style={styles.categoryText}>{item.category}</ThemedText>
          <ThemedText style={styles.materialDescription} numberOfLines={2}>
            {item.description}
          </ThemedText>
          
          <View style={styles.recyclingRateContainer}>
            <ThemedText style={styles.recyclingRateLabel}>Recycling Rate:</ThemedText>
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
            <ThemedText style={styles.recyclingRateText}>{item.recyclingRate}%</ThemedText>
          </View>
        </View>
        
        {/* Material image */}
        <View style={styles.materialImageContainer}>
          {item.imageUrl ? (
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.materialImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.materialImagePlaceholder, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="leaf" size={40} color={theme.colors.primary} />
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.materialFooter}>
        <ThemedText style={styles.acceptedFormsLabel}>Accepted Forms:</ThemedText>
        <View style={styles.acceptedFormsContainer}>
          {item.acceptedForms.map((form, index) => (
            <View key={index} style={[styles.acceptedFormTag, { backgroundColor: theme.colors.primary + '20' }]}>
              <ThemedText style={styles.acceptedFormText}>{form}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  ), [handleMaterialPress, theme.colors]);

  // Render filter modal
  const renderFilterModal = () => (
    <Modal
      visible={isFilterModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsFilterModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setIsFilterModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <ThemedView style={styles.filterModalContainer}>
              <View style={styles.filterModalHeader}>
                <ThemedText variant="h2" style={styles.filterModalTitle}>Filter Materials</ThemedText>
                <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              
              {/* Category Filter */}
              <ThemedText variant="h3" style={styles.filterSectionTitle}>Categories</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterContainer}>
                <TouchableOpacity
                  style={[
                    styles.categoryFilterButton,
                    filterOptions.category === null && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => setFilterOptions(prev => ({ ...prev, category: null }))}
                >
                  <ThemedText 
                    style={[
                      styles.categoryFilterText, 
                      filterOptions.category === null && { color: '#fff' }
                    ]}
                  >
                    All
                  </ThemedText>
                </TouchableOpacity>
                
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.categoryFilterButton,
                      filterOptions.category === category && { backgroundColor: theme.colors.primary }
                    ]}
                    onPress={() => setFilterOptions(prev => ({ ...prev, category }))}
                  >
                    <ThemedText 
                      style={[
                        styles.categoryFilterText, 
                        filterOptions.category === category && { color: '#fff' }
                      ]}
                    >
                      {category}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {/* Hazardous Filter */}
              <ThemedText variant="h3" style={styles.filterSectionTitle}>Hazardous Materials</ThemedText>
              <View style={styles.hazardousFilterContainer}>
                <TouchableOpacity
                  style={[
                    styles.hazardousFilterButton,
                    filterOptions.isHazardous === null && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => setFilterOptions(prev => ({ ...prev, isHazardous: null }))}
                >
                  <ThemedText 
                    style={[
                      styles.hazardousFilterText, 
                      filterOptions.isHazardous === null && { color: '#fff' }
                    ]}
                  >
                    All
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.hazardousFilterButton,
                    filterOptions.isHazardous === false && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => setFilterOptions(prev => ({ ...prev, isHazardous: false }))}
                >
                  <ThemedText 
                    style={[
                      styles.hazardousFilterText, 
                      filterOptions.isHazardous === false && { color: '#fff' }
                    ]}
                  >
                    Non-Hazardous
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.hazardousFilterButton,
                    filterOptions.isHazardous === true && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => setFilterOptions(prev => ({ ...prev, isHazardous: true }))}
                >
                  <ThemedText 
                    style={[
                      styles.hazardousFilterText, 
                      filterOptions.isHazardous === true && { color: '#fff' }
                    ]}
                  >
                    Hazardous Only
                  </ThemedText>
                </TouchableOpacity>
              </View>
              
              {/* Recycling Rate Slider */}
              <ThemedText variant="h3" style={styles.filterSectionTitle}>
                Minimum Recycling Rate: {filterOptions.minRecyclingRate}%
              </ThemedText>
              <Slider
                style={styles.recyclingRateSlider}
                minimumValue={0}
                maximumValue={100}
                step={5}
                value={filterOptions.minRecyclingRate}
                onValueChange={(value) => setFilterOptions(prev => ({ ...prev, minRecyclingRate: value }))}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
              />
              
              {/* Filter Action Buttons */}
              <View style={styles.filterActionsContainer}>
                <TouchableOpacity
                  style={[styles.filterActionButton, { backgroundColor: theme.colors.card }]}
                  onPress={resetFilters}
                >
                  <ThemedText>Reset Filters</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.filterActionButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => setIsFilterModalVisible(false)}
                >
                  <ThemedText style={{ color: '#fff' }}>Apply Filters</ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText variant="h1" style={styles.headerTitle}>Recyclable Materials</ThemedText>
        
        <View style={styles.connectionStatus}>
          <View 
            style={[
              styles.statusIndicator, 
              isOnline ? styles.statusOnline : styles.statusOffline
            ]} 
          />
          <ThemedText style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </ThemedText>
        </View>
      </ThemedView>
      
      {/* Search and Filter Bar */}
      <ThemedView style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="search" size={20} color={theme.colors.text} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search materials..."
            placeholderTextColor={theme.colors.textSecondary}
            value={filterOptions.search}
            onChangeText={handleSearch}
          />
          {filterOptions.search ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: theme.colors.card }]}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Ionicons name="options" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: theme.colors.card }]}
          onPress={handleBarcodeScan}
        >
          <Ionicons name="barcode" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </ThemedView>
      
      {/* Sort Options */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.sortOptionsContainer}
      >
        <TouchableOpacity
          style={[
            styles.sortOption,
            sortBy === 'name' && { backgroundColor: theme.colors.primary + '20' }
          ]}
          onPress={() => handleSortChange('name')}
        >
          <ThemedText style={styles.sortOptionText}>
            Name
            {sortBy === 'name' && (
              <Ionicons 
                name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'} 
                size={16} 
                color={theme.colors.text} 
              />
            )}
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.sortOption,
            sortBy === 'category' && { backgroundColor: theme.colors.primary + '20' }
          ]}
          onPress={() => handleSortChange('category')}
        >
          <ThemedText style={styles.sortOptionText}>
            Category
            {sortBy === 'category' && (
              <Ionicons 
                name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'} 
                size={16} 
                color={theme.colors.text} 
              />
            )}
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.sortOption,
            sortBy === 'recyclingRate' && { backgroundColor: theme.colors.primary + '20' }
          ]}
          onPress={() => handleSortChange('recyclingRate')}
        >
          <ThemedText style={styles.sortOptionText}>
            Recycling Rate
            {sortBy === 'recyclingRate' && (
              <Ionicons 
                name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'} 
                size={16} 
                color={theme.colors.text} 
              />
            )}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Material List */}
      <OptimizedListView
        data={materials}
        renderItem={renderMaterialItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        getItemLayout={(data, index) => ({
          length: 230, // Approximate height of each item
          offset: 230 * index,
          index,
        })}
        initialNumToRender={8}
        windowSize={5}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <Ionicons name="trash-bin-outline" size={64} color={theme.colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Materials Found</ThemedText>
            <ThemedText style={styles.emptyText}>
              {error ? 'Error loading materials' : isOnline
                ? filterOptions.search 
                  ? 'No materials match your search criteria' 
                  : 'Pull down to refresh and try again'
                : 'Connect to the internet to load materials'}
            </ThemedText>
            {error && (
              <TouchableOpacity 
                style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => loadMaterials(true)}
              >
                <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        }
      />
      
      {/* Network details footer */}
      {networkDetails?.type && (
        <ThemedView style={styles.networkInfo}>
          <ThemedText style={styles.networkInfoText}>
            Network: {networkDetails.type}
            {networkDetails.isWifi && ' (WiFi)'}
            {networkDetails.isCellular && ' (Cellular)'}
          </ThemedText>
        </ThemedView>
      )}
      
      {/* Filter Modal */}
      {renderFilterModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusOnline: {
    backgroundColor: '#4CAF50',
  },
  statusOffline: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sortOptionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
  },
  sortOptionText: {
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  materialCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  materialName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  hazardousTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hazardousText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  materialBody: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  materialInfo: {
    flex: 1,
    marginRight: 16,
  },
  categoryText: {
    fontSize: 14,
    marginBottom: 4,
  },
  materialDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  recyclingRateContainer: {
    marginTop: 'auto',
  },
  recyclingRateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  recyclingRateBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  recyclingRateBar: {
    height: '100%',
  },
  highRate: {
    backgroundColor: '#4CAF50',
  },
  mediumRate: {
    backgroundColor: '#FFC107',
  },
  lowRate: {
    backgroundColor: '#F44336',
  },
  recyclingRateText: {
    fontSize: 12,
    textAlign: 'right',
  },
  materialImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  materialImage: {
    width: '100%',
    height: '100%',
  },
  materialImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  materialFooter: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  acceptedFormsLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  acceptedFormsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  acceptedFormTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  acceptedFormText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  networkInfo: {
    padding: 8,
    alignItems: 'center',
  },
  networkInfoText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  categoryFilterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryFilterText: {
    fontSize: 14,
  },
  hazardousFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  hazardousFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  hazardousFilterText: {
    fontSize: 14,
  },
  recyclingRateSlider: {
    width: '100%',
    height: 40,
    marginBottom: 16,
  },
  filterActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  filterActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
}); 