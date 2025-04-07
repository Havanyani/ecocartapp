/**
 * CollectionsScreen.tsx
 * 
 * Screen for viewing and managing scheduled collections.
 * Displays a list of collections with their status and allows users to cancel or view details.
 */

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Text } from '@/components/ui/Text';
import { useCollection } from '@/contexts/CollectionContext';
import { CollectionStackParamList } from '@/navigation/CollectionStack';
import { CollectionItem } from '@/types/collections';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format, parseISO } from 'date-fns';
import React, { useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type CollectionsScreenNavigationProp = StackNavigationProp<CollectionStackParamList>;

export function CollectionsScreen() {
  const navigation = useNavigation<CollectionsScreenNavigationProp>();
  const { collections, isLoading, error, cancelCollection } = useCollection();
  const [refreshing, setRefreshing] = useState(false);
  
  // Group collections by status
  const groupedCollections = collections.reduce((acc, collection) => {
    const status = collection.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(collection);
    return acc;
  }, {} as Record<string, CollectionItem[]>);
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    // The collection context will automatically reload collections
    // when the user changes, so we just need to wait a bit
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  // Handle collection cancellation
  const handleCancelCollection = async (collection: CollectionItem) => {
    Alert.alert(
      'Cancel Collection',
      'Are you sure you want to cancel this collection?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelCollection(collection.id);
              Alert.alert('Success', 'Collection cancelled successfully');
            } catch (err) {
              Alert.alert('Error', 'Failed to cancel collection. Please try again.');
            }
          },
        },
      ]
    );
  };
  
  // Render collection item
  const renderCollectionItem = ({ item }: { item: CollectionItem }) => {
    const formattedDate = format(parseISO(item.scheduledDate), 'MMM d, yyyy');
    
    return (
      <Card style={styles.collectionCard}>
        <View style={styles.collectionHeader}>
          <Text variant="h3">{formattedDate}</Text>
          <Text
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            {formatStatus(item.status)}
          </Text>
        </View>
        
        <View style={styles.collectionDetails}>
          <Text>Time: {item.timeSlot}</Text>
          <Text>Estimated Weight: {item.estimatedWeight} kg</Text>
          {item.actualWeight && (
            <Text>Actual Weight: {item.actualWeight} kg</Text>
          )}
          {item.creditAmount && (
            <Text>Credits Earned: {item.creditAmount}</Text>
          )}
        </View>
        
        {item.status === 'scheduled' && (
          <View style={styles.actionButtons}>
            <Button
              variant="outline"
              onPress={() => handleCancelCollection(item)}
              style={styles.actionButton}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onPress={() => navigation.navigate('CollectionDetails', { collectionId: item.id })}
              style={styles.actionButton}
            >
              View Details
            </Button>
          </View>
        )}
        
        {item.status === 'in_progress' && (
          <View style={styles.actionButtons}>
            <Button
              variant="primary"
              onPress={() => navigation.navigate('DriverTracking', { collectionId: item.id })}
              style={styles.actionButton}
            >
              Track Driver
            </Button>
          </View>
        )}
      </Card>
    );
  };
  
  // Format status for display
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };
  
  // Get color for status badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#2196F3'; // Blue
      case 'in_progress':
        return '#FF9800'; // Orange
      case 'completed':
        return '#4CAF50'; // Green
      case 'cancelled':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Gray
    }
  };
  
  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <Text>Loading collections...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No collections found</Text>
        <Button
          variant="primary"
          onPress={() => navigation.navigate('ScheduleCollection')}
          style={styles.scheduleButton}
        >
          Schedule a Collection
        </Button>
      </View>
    );
  };
  
  // Render navigation menu
  const renderNavigationMenu = () => {
    const menuItems = [
      {
        title: 'Collection History',
        icon: 'history',
        screen: 'CollectionHistory',
        color: '#4CAF50',
      },
      {
        title: 'Analytics',
        icon: 'analytics',
        screen: 'CollectionAnalytics',
        color: '#2196F3',
      },
      {
        title: 'Materials',
        icon: 'recycle',
        screen: 'MaterialManagement',
        color: '#FF9800',
      },
      {
        title: 'Rewards',
        icon: 'star',
        screen: 'CollectionRewards',
        color: '#9C27B0',
      },
    ];
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.menuContainer}
        contentContainerStyle={styles.menuContent}
      >
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, { backgroundColor: item.color }]}
            onPress={() => {
              if (item.screen === 'CollectionHistory') {
                navigation.navigate('CollectionHistory');
              } else if (item.screen === 'CollectionAnalytics') {
                navigation.navigate('CollectionAnalytics');
              } else if (item.screen === 'MaterialManagement') {
                navigation.navigate('MaterialManagement');
              } else if (item.screen === 'CollectionRewards') {
                navigation.navigate('CollectionRewards');
              }
            }}
          >
            <IconSymbol name={item.icon} size={24} color="#fff" />
            <Text style={styles.menuItemText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1">My Collections</Text>
        <Button
          variant="primary"
          onPress={() => navigation.navigate('ScheduleCollection')}
        >
          Schedule New
        </Button>
      </View>
      
      {renderNavigationMenu()}
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      <FlatList
        data={collections}
        renderItem={renderCollectionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  collectionCard: {
    marginBottom: 16,
    padding: 16,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  collectionDetails: {
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginBottom: 16,
  },
  scheduleButton: {
    marginTop: 16,
  },
  errorText: {
    color: '#F44336',
    padding: 16,
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuContent: {
    padding: 12,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    width: 100,
  },
  menuItemText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 