/**
 * Collection Management Screen
 * 
 * Main screen for managing collection appointments, including
 * viewing scheduled collections and initiating new scheduling.
 */

import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { ScheduleResponse, SchedulingService } from '@/services/SchedulingService';
import { addDays, format, isBefore, isToday, isTomorrow } from 'date-fns';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CollectionScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [collections, setCollections] = useState<ScheduleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setIsLoading(true);
      const data = await SchedulingService.getScheduledCollections();
      setCollections(data);
    } catch (error) {
      console.error('Failed to load collections:', error);
      Alert.alert('Error', 'Failed to load your scheduled collections');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCollections();
  };

  const handleCancelCollection = async (collectionId: string, isRecurring: boolean) => {
    if (isRecurring) {
      Alert.alert(
        'Cancel Collection',
        'Would you like to cancel just this collection or the entire series?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'This Collection',
            onPress: async () => {
              await cancelCollection(collectionId, false);
            },
          },
          {
            text: 'Entire Series',
            style: 'destructive',
            onPress: async () => {
              await cancelCollection(collectionId, true);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Cancel Collection',
        'Are you sure you want to cancel this collection?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes',
            style: 'destructive',
            onPress: async () => {
              await cancelCollection(collectionId, false);
            },
          },
        ]
      );
    }
  };

  const cancelCollection = async (collectionId: string, cancelEntireSeries: boolean) => {
    try {
      await SchedulingService.cancelCollection(collectionId, cancelEntireSeries);
      Alert.alert('Success', 'Collection has been cancelled successfully');
      loadCollections();
    } catch (error) {
      console.error('Failed to cancel collection:', error);
      Alert.alert('Error', 'Failed to cancel collection');
    }
  };

  const formatCollectionDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'EEE, MMM d, h:mm a');
    }
  };

  const getStatusColor = (status: string, scheduledTime: string) => {
    const date = new Date(scheduledTime);
    
    switch (status) {
      case 'SCHEDULED':
        return isBefore(date, new Date()) ? theme.colors.error : theme.colors.primary;
      case 'COMPLETED':
        return theme.colors.success;
      case 'CANCELLED':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };

  const renderCollectionsBySection = () => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const nextWeek = addDays(today, 7);
    
    const todayCollections = collections.filter(c => 
      isToday(new Date(c.scheduledTime)) && c.status === 'SCHEDULED'
    );
    
    const tomorrowCollections = collections.filter(c => 
      isTomorrow(new Date(c.scheduledTime)) && c.status === 'SCHEDULED'
    );
    
    const upcomingCollections = collections.filter(c => {
      const date = new Date(c.scheduledTime);
      return !isToday(date) && !isTomorrow(date) && 
        isBefore(date, nextWeek) && c.status === 'SCHEDULED';
    });
    
    const laterCollections = collections.filter(c => {
      const date = new Date(c.scheduledTime);
      return !isBefore(date, nextWeek) && c.status === 'SCHEDULED';
    });
    
    const pastCollections = collections.filter(c => 
      (c.status === 'COMPLETED' || c.status === 'CANCELLED') ||
      (c.status === 'SCHEDULED' && isBefore(new Date(c.scheduledTime), today))
    );

    return (
      <>
        {todayCollections.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Today</ThemedText>
            {todayCollections.map(renderCollectionItem)}
          </View>
        )}
        
        {tomorrowCollections.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Tomorrow</ThemedText>
            {tomorrowCollections.map(renderCollectionItem)}
          </View>
        )}
        
        {upcomingCollections.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>This Week</ThemedText>
            {upcomingCollections.map(renderCollectionItem)}
          </View>
        )}
        
        {laterCollections.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Later</ThemedText>
            {laterCollections.map(renderCollectionItem)}
          </View>
        )}
        
        {pastCollections.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Past</ThemedText>
            {pastCollections.slice(0, 5).map(renderCollectionItem)}
            
            {pastCollections.length > 5 && (
              <TouchableOpacity 
                style={styles.viewMoreButton}
                onPress={() => router.push('/collection/history')}
              >
                <ThemedText style={styles.viewMoreText}>
                  View {pastCollections.length - 5} more past collections
                </ThemedText>
                <IconSymbol name="chevron-right" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {collections.length === 0 && !isLoading && (
          <ThemedView style={styles.emptyState}>
            <IconSymbol name="calendar-x" size={48} color={theme.colors.textSecondary} />
            <ThemedText style={styles.emptyStateTitle}>No Collections Scheduled</ThemedText>
            <ThemedText style={styles.emptyStateText}>
              You don't have any scheduled collections yet. Tap the button below to schedule your first collection.
            </ThemedText>
          </ThemedView>
        )}
      </>
    );
  };

  const renderCollectionItem = (collection: ScheduleResponse) => (
    <TouchableOpacity
      key={collection.collectionId}
      style={styles.collectionItem}
      onPress={() => router.push(`/collection/details/${collection.collectionId}`)}
    >
      <View style={styles.collectionItemHeader}>
        <View style={styles.statusSection}>
          <View 
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(collection.status, collection.scheduledTime) }
            ]}
          />
          <ThemedText style={styles.dateText}>
            {formatCollectionDate(collection.scheduledTime)}
          </ThemedText>
        </View>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCancelCollection(
            collection.collectionId, 
            Boolean(collection.recurrenceId)
          )}
        >
          <IconSymbol name="x" size={16} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.materialsContainer}>
        {collection.materials.slice(0, 3).map((materialId, index) => (
          <View key={materialId} style={styles.materialTag}>
            <ThemedText style={styles.materialText}>
              {materialId.charAt(0).toUpperCase() + materialId.slice(1)}
            </ThemedText>
          </View>
        ))}
        
        {collection.materials.length > 3 && (
          <View style={styles.materialTag}>
            <ThemedText style={styles.materialText}>
              +{collection.materials.length - 3} more
            </ThemedText>
          </View>
        )}
      </View>
      
      {collection.recurrenceId && (
        <View style={styles.recurrenceIndicator}>
          <IconSymbol name="repeat" size={14} color={theme.colors.primary} />
          <ThemedText style={styles.recurrenceText}>Recurring</ThemedText>
        </View>
      )}
      
      {collection.notes && (
        <ThemedText numberOfLines={1} style={styles.notesText}>
          Note: {collection.notes}
        </ThemedText>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Collections',
          headerRight: () => (
            <Button
              variant="text"
              onPress={() => router.push('/collection/schedule')}
              leftIcon={<IconSymbol name="plus" size={16} color={theme.colors.primary} />}
            >
              Schedule
            </Button>
          ),
        }}
      />

      <View style={styles.container}>
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <ThemedText style={styles.loadingText}>Loading collections...</ThemedText>
          </View>
        ) : (
          <>
            <ScrollView 
              style={styles.scrollView}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {renderCollectionsBySection()}
            </ScrollView>
            
            <View style={styles.floatingButtonContainer}>
              <TouchableOpacity
                style={[styles.floatingButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/collection/schedule')}
              >
                <IconSymbol name="plus" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  collectionItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  collectionItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    padding: 8,
  },
  materialsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  materialTag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  materialText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recurrenceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recurrenceText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  notesText: {
    fontSize: 13,
    color: '#757575',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  viewMoreText: {
    fontSize: 14,
    marginRight: 4,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
}); 