/**
 * CollectionListScreen.tsx
 * 
 * Screen displaying a list of scheduled collections with filtering and sorting options.
 */

import useNetworkStatus from '@/hooks/useNetworkStatus';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Collection status type
type CollectionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// Collection item interface
interface Collection {
  id: string;
  materialType: string;
  estimatedWeight: string;
  address: string;
  scheduledDateTime: Date;
  status: CollectionStatus;
  notes?: string;
  createdAt: Date;
}

interface CollectionListScreenProps {
  navigation: any;
}

export default function CollectionListScreen({ navigation }: CollectionListScreenProps) {
  const { isOnline } = useNetworkStatus();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // Fetch collections
  useEffect(() => {
    fetchCollections();
  }, []);
  
  const fetchCollections = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      // Simulate API call with timeout
      setTimeout(() => {
        const mockCollections: Collection[] = [
          {
            id: '1',
            materialType: 'Plastic',
            estimatedWeight: '3.5',
            address: '123 Green St, Eco City, EC 12345',
            scheduledDateTime: new Date(2023, 6, 15, 10, 30),
            status: 'confirmed',
            notes: 'Mostly PET bottles',
            createdAt: new Date(2023, 6, 10)
          },
          {
            id: '2',
            materialType: 'Paper',
            estimatedWeight: '5.2',
            address: '456 Recycling Ave, Eco City, EC 12345',
            scheduledDateTime: new Date(2023, 6, 20, 14, 0),
            status: 'pending',
            createdAt: new Date(2023, 6, 12)
          },
          {
            id: '3',
            materialType: 'Glass',
            estimatedWeight: '2.8',
            address: '789 Sustainability Rd, Eco City, EC 12345',
            scheduledDateTime: new Date(2023, 6, 8, 9, 0),
            status: 'completed',
            notes: 'Various glass bottles',
            createdAt: new Date(2023, 6, 5)
          },
          {
            id: '4',
            materialType: 'Mixed',
            estimatedWeight: '4.0',
            address: '101 Green Living St, Eco City, EC 12345',
            scheduledDateTime: new Date(2023, 6, 3, 11, 30),
            status: 'cancelled',
            notes: 'Cancelled due to weather',
            createdAt: new Date(2023, 6, 1)
          }
        ];
        
        setCollections(mockCollections);
        setIsLoading(false);
        setIsRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching collections:', error);
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCollections();
  };
  
  // Navigate to schedule collection screen
  const handleScheduleCollection = () => {
    navigation.navigate('ScheduleCollection');
  };
  
  // View collection details
  const handleViewCollection = (collection: Collection) => {
    navigation.navigate('CollectionDetail', { collectionId: collection.id });
  };
  
  // Filter collections
  const getFilteredCollections = () => {
    if (activeFilter === 'all') {
      return collections;
    }
    return collections.filter(c => c.status === activeFilter);
  };
  
  // Status badge color
  const getStatusColor = (status: CollectionStatus): string => {
    switch (status) {
      case 'pending':
        return '#FF9500'; // Orange
      case 'confirmed':
        return '#34C759'; // Green
      case 'completed':
        return '#2C76E5'; // Blue
      case 'cancelled':
        return '#FF3B30'; // Red
      default:
        return '#8E8E93'; // Gray
    }
  };
  
  // Render collection item
  const renderCollectionItem = ({ item }: { item: Collection }) => (
    <TouchableOpacity 
      style={styles.collectionItem}
      onPress={() => handleViewCollection(item)}
    >
      <View style={styles.collectionHeader}>
        <Text style={styles.materialType}>{item.materialType}</Text>
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(item.status) }
          ]}
        >
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.collectionInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
          <Text style={styles.infoText}>
            {format(item.scheduledDateTime, 'PPP')}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#8E8E93" />
          <Text style={styles.infoText}>
            {format(item.scheduledDateTime, 'p')}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#8E8E93" />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="scale-outline" size={16} color="#8E8E93" />
          <Text style={styles.infoText}>
            {item.estimatedWeight} kg
          </Text>
        </View>
      </View>
      
      {item.notes && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteText} numberOfLines={2}>
            {item.notes}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
  
  // Render empty list
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="trash-bin-outline" size={64} color="#E5E5EA" />
      <Text style={styles.emptyTitle}>No Collections</Text>
      <Text style={styles.emptyText}>
        You haven't scheduled any collections yet.
      </Text>
      <TouchableOpacity 
        style={styles.scheduleButton}
        onPress={handleScheduleCollection}
      >
        <Text style={styles.scheduleButtonText}>Schedule Collection</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render list header with filters
  const renderListHeader = () => (
    <View style={styles.filtersContainer}>
      {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterButton,
            activeFilter === filter && styles.filterButtonActive
          ]}
          onPress={() => setActiveFilter(filter)}
        >
          <Text 
            style={[
              styles.filterButtonText,
              activeFilter === filter && styles.filterButtonTextActive
            ]}
          >
            {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Collections</Text>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('CollectionHistory')}
          >
            <Ionicons name="time-outline" size={24} color="#34C759" />
            <Text style={styles.historyButtonText}>History</Text>
          </TouchableOpacity>
          
          {!isOnline && (
            <View style={styles.offlineIndicator}>
              <Ionicons name="cloud-offline-outline" size={16} color="#FFFFFF" />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
        </View>
        
        <View style={styles.content}>
          {isLoading && !isRefreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#34C759" />
              <Text style={styles.loadingText}>Loading collections...</Text>
            </View>
          ) : (
            <FlatList
              data={getFilteredCollections()}
              renderItem={renderCollectionItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListHeaderComponent={renderListHeader}
              ListEmptyComponent={renderEmptyList}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={['#34C759']}
                  tintColor="#34C759"
                />
              }
            />
          )}
        </View>
        
        <TouchableOpacity
          style={styles.fab}
          onPress={handleScheduleCollection}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  historyButtonText: {
    marginLeft: 4,
    color: '#34C759',
    fontWeight: '500',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16
  },
  offlineText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4
  },
  content: {
    flex: 1
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
  listContent: {
    flexGrow: 1,
    paddingBottom: 80 // Account for FAB
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 80
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24
  },
  scheduleButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: '#FFFFFF'
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F2F2F7'
  },
  filterButtonActive: {
    backgroundColor: '#E3FFF1'
  },
  filterButtonText: {
    fontSize: 14,
    color: '#8E8E93'
  },
  filterButtonTextActive: {
    color: '#34C759',
    fontWeight: '600'
  },
  collectionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  materialType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  collectionInfo: {
    marginBottom: 12
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  infoText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 8,
    flex: 1
  },
  noteContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8
  },
  noteText: {
    fontSize: 14,
    color: '#8E8E93'
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  }
}); 