/**
 * CollectionHistoryScreen.tsx
 * 
 * Screen displaying both upcoming and past collection history with filtering options.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText, ThemedView } from '../../components/themed';
import { useTheme } from '../../contexts/ThemeContext';
import { useCollections } from '../../hooks/useCollections';
import useNetworkStatus from '../../hooks/useNetworkStatus';
import { CollectionItem } from '../../types/collections';

// Define types for collection data
interface CollectionHistoryScreenProps {
  navigation: any;
}

type ActiveTab = 'upcoming' | 'history';
type SortOption = 'date' | 'weight' | 'status';

const CollectionHistoryScreen = ({ navigation }: CollectionHistoryScreenProps) => {
  const { theme } = useTheme();
  const { isOnline } = useNetworkStatus();
  const [activeTab, setActiveTab] = useState<ActiveTab>('upcoming');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const {
    collections,
    stats,
    isLoading,
    error,
    loadCollections,
    cancelCollection,
    completeCollection
  } = useCollections();

  useEffect(() => {
    loadCollections({
      status: activeTab === 'upcoming' ? 'scheduled' : 'completed'
    });
  }, [activeTab, loadCollections]);

  const handleRefresh = () => {
    loadCollections({
      status: activeTab === 'upcoming' ? 'scheduled' : 'completed'
    });
  };

  const handleCancelCollection = async (id: string) => {
    Alert.alert(
      'Cancel Collection',
      'Are you sure you want to cancel this collection?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await cancelCollection(id);
              Alert.alert('Success', 'Collection cancelled successfully');
            } catch (err) {
              Alert.alert('Error', 'Failed to cancel collection');
            }
          },
        },
      ]
    );
  };

  const filterCollections = () => {
    let filtered = collections;

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter((c: CollectionItem) => c.status === activeFilter);
    }

    // Apply sorting
    filtered.sort((a: CollectionItem, b: CollectionItem) => {
      let comparison = 0;
      
      switch (sortOption) {
        case 'date':
          comparison = a.scheduledDate.getTime() - b.scheduledDate.getTime();
          break;
        case 'weight':
          comparison = (a.actualWeight || a.estimatedWeight) - (b.actualWeight || b.estimatedWeight);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return theme.primary;
      case 'completed':
        return theme.secondary;
      case 'cancelled':
        return theme.error;
      default:
        return theme.text;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderItem = ({ item }: { item: CollectionItem }) => {
    const isUpcoming = item.status === 'scheduled';
    
    return (
      <ThemedView style={styles.collectionCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.materialInfo}>
            <ThemedText style={styles.materialName}>{item.materialName}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
              <ThemedText 
                style={[styles.statusText, { color: getStatusColor(item.status) }]}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.date}>
            {formatDate(item.status === 'completed' && item.completedDate ? item.completedDate : item.scheduledDate)}
          </ThemedText>
        </View>
        
        {/* Collection details */}
        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={theme.text}
              style={styles.detailIcon}
            />
            <ThemedText style={styles.detailText}>
              {item.address}
            </ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons
              name="scale-outline"
              size={16}
              color={theme.text}
              style={styles.detailIcon}
            />
            <ThemedText style={styles.detailText}>
              {item.status === 'completed' && item.actualWeight
                ? `${item.actualWeight}kg collected (est. ${item.estimatedWeight}kg)`
                : `${item.estimatedWeight}kg estimated`}
            </ThemedText>
          </View>
          
          {item.notes ? (
            <View style={styles.detailRow}>
              <Ionicons
                name="document-text-outline"
                size={16}
                color={theme.text}
                style={styles.detailIcon}
              />
              <ThemedText style={styles.detailText}>
                Note: {item.notes}
              </ThemedText>
            </View>
          ) : null}
          
          {item.status === 'completed' && item.creditAmount ? (
            <View style={[styles.detailRow, styles.creditRow]}>
              <Ionicons
                name="leaf-outline"
                size={16}
                color={theme.primary}
                style={styles.detailIcon}
              />
              <ThemedText style={[styles.detailText, styles.creditText]}>
                {item.creditAmount.toFixed(2)} credits earned
              </ThemedText>
            </View>
          ) : null}
          
          {item.driverNotes ? (
            <View style={styles.driverNotesContainer}>
              <Ionicons
                name="chatbubble-outline"
                size={16}
                color={theme.text}
                style={styles.detailIcon}
              />
              <ThemedText style={styles.driverNotes}>
                Driver: {item.driverNotes}
              </ThemedText>
            </View>
          ) : null}
        </View>
        
        {/* Actions */}
        {isUpcoming && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('MaterialDetail', { id: item.materialId })}
            >
              <Ionicons name="information-circle-outline" size={16} color="#fff" />
              <ThemedText style={styles.actionButtonText}>View Material</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.error }]}
              onPress={() => handleCancelCollection(item.id)}
            >
              <Ionicons name="close-circle-outline" size={16} color="#fff" />
              <ThemedText style={styles.actionButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
    );
  };

  const ListEmptyComponent = () => (
    <ThemedView style={styles.emptyContainer}>
      <Image
        source={require('../../assets/images/empty-collections.png')}
        style={styles.emptyImage}
        defaultSource={
          Platform.OS === 'android'
            ? require('../../assets/images/empty-collections.png')
            : undefined
        }
      />
      <ThemedText style={styles.emptyTitle}>
        {activeTab === 'upcoming'
          ? 'No Upcoming Collections'
          : 'No Collection History'}
      </ThemedText>
      <ThemedText style={styles.emptyText}>
        {activeTab === 'upcoming'
          ? 'Schedule your first recyclable material collection by visiting material details.'
          : 'Your completed collection history will appear here.'}
      </ThemedText>
      
      {activeTab === 'upcoming' && (
        <TouchableOpacity
          style={[styles.browseButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('MaterialList')}
        >
          <ThemedText style={styles.browseButtonText}>Browse Materials</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
            <ThemedText style={styles.backButtonText}>Back</ThemedText>
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>My Collections</ThemedText>
        </ThemedView>
        
        {/* Tabs */}
        <ThemedView style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'upcoming' && { 
                borderBottomColor: theme.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab('upcoming')}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'upcoming' && { color: theme.primary },
              ]}
            >
              Upcoming
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'history' && { 
                borderBottomColor: theme.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab('history')}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'history' && { color: theme.primary },
              ]}
            >
              History
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Sort Options */}
        <ThemedView style={styles.sortContainer}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
          >
            <Ionicons
              name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'}
              size={20}
              color={theme.text}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              const options: SortOption[] = ['date', 'weight', 'status'];
              const currentIndex = options.indexOf(sortOption);
              setSortOption(options[(currentIndex + 1) % options.length]);
            }}
          >
            <ThemedText style={styles.sortButtonText}>
              {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        {/* List */}
        {isLoading && collections.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText style={styles.loadingText}>
              Loading collections...
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={filterCollections()}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
            ListEmptyComponent={ListEmptyComponent}
            showsVerticalScrollIndicator={false}
          />
        )}
        
        {/* FAB */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('MaterialList')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  collectionCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  date: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 8,
  },
  cardBody: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
    width: 16,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  creditRow: {
    marginTop: 4,
  },
  creditText: {
    fontWeight: '500',
    color: '#4CAF50',
  },
  driverNotesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  driverNotes: {
    fontSize: 14,
    fontStyle: 'italic',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 4,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyImage: {
    width: width * 0.5,
    height: width * 0.5,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 32,
    opacity: 0.7,
    marginBottom: 24,
  },
  browseButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 8,
  },
  sortButtonText: {
    fontSize: 14,
    marginLeft: 4,
  },
});

export default CollectionHistoryScreen; 