import { CollectionCard } from '@/components/collection/CollectionCard';
import CollectionScheduler from '@/components/collection/CollectionScheduler';
import { CollectionStats } from '@/components/collection/CollectionStats';
import { HapticTab } from '@/components/ui/HapticTab';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { collectionService } from '@/services/CollectionService';
import { Collection, selectCollections, selectError, selectIsLoading, setCollections, setError, setLoading } from '@/store/slices/collectionSlice';
import { TimeSlot } from '@/types/collections';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

type Tab = 'history' | 'schedule' | 'tracking';

export default function CollectionManagementScreen() {
  const dispatch = useDispatch();
  const collections = useSelector(selectCollections);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const [activeTab, setActiveTab] = useState<Tab>('history');
  const [refreshing, setRefreshing] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'schedule') {
      loadTimeSlots();
    }
  }, [activeTab]);

  const loadTimeSlots = async () => {
    try {
      const slots = await collectionService.getTimeSlots(new Date());
      setTimeSlots(slots);
    } catch (err) {
      dispatch(setError('Failed to load available time slots. Please try again.'));
    }
  };

  const loadData = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const history = await collectionService.getCollectionHistory();
      dispatch(setCollections(history));
    } catch (err) {
      dispatch(setError('Failed to load data. Please try again.'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    if (activeTab === 'schedule') {
      await loadTimeSlots();
    }
    setRefreshing(false);
  };

  const handleSchedule = async (timeSlot: TimeSlot) => {
    setIsScheduling(true);
    dispatch(setError(null));
    try {
      await collectionService.scheduleCollection(timeSlot);
      await loadData();
      await loadTimeSlots(); // Refresh time slots after scheduling
    } catch (err) {
      dispatch(setError('Failed to schedule collection. Please try again.'));
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCancel = async (collectionId: string) => {
    setIsCanceling(true);
    dispatch(setError(null));
    try {
      await collectionService.cancelCollection(collectionId);
      await loadData();
    } catch (err) {
      dispatch(setError('Failed to cancel collection. Please try again.'));
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReschedule = async (collectionId: string, newTimeSlot: TimeSlot) => {
    setIsRescheduling(true);
    dispatch(setError(null));
    try {
      await collectionService.rescheduleCollection(collectionId, newTimeSlot);
      await loadData();
      await loadTimeSlots(); // Refresh time slots after rescheduling
    } catch (err) {
      dispatch(setError('Failed to reschedule collection. Please try again.'));
    } finally {
      setIsRescheduling(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <ThemedView style={styles.centerContent}>
          <ThemedText>Loading...</ThemedText>
        </ThemedView>
      );
    }

    if (error) {
      return (
        <ThemedView style={styles.centerContent}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <HapticTab
            style={styles.retryButton}
            onPress={loadData}
            accessibilityLabel="Retry loading data"
            accessibilityRole="button"
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </HapticTab>
        </ThemedView>
      );
    }

    const filteredCollections = collections.filter((collection: Collection) => {
      switch (activeTab) {
        case 'history':
          return true;
        case 'tracking':
          return collection.status === 'pending' || 
                 collection.status === 'scheduled' || 
                 collection.status === 'in_progress';
        default:
          return true;
      }
    });

    switch (activeTab) {
      case 'history':
        return (
          <>
            <CollectionStats />
            <ScrollView style={styles.collectionList}>
              {filteredCollections.map((collection: Collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                />
              ))}
            </ScrollView>
          </>
        );
      case 'schedule':
        return (
          <CollectionScheduler
            onSchedule={handleSchedule}
            timeSlots={timeSlots}
            isLoading={isScheduling}
            error={error}
          />
        );
      case 'tracking':
        return (
          <ScrollView style={styles.collectionList}>
            {filteredCollections.map((collection: Collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
              />
            ))}
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Collection Management</ThemedText>
      </ThemedView>

      <ThemedView style={styles.tabs}>
        <HapticTab
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
          accessibilityLabel="View collection history"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'history' }}
        >
          <ThemedText style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
          </ThemedText>
        </HapticTab>

        <HapticTab
          style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
          onPress={() => setActiveTab('schedule')}
          accessibilityLabel="Schedule new collection"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'schedule' }}
        >
          <ThemedText style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>
            Schedule
          </ThemedText>
        </HapticTab>

        <HapticTab
          style={[styles.tab, activeTab === 'tracking' && styles.activeTab]}
          onPress={() => setActiveTab('tracking')}
          accessibilityLabel="Track active collections"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'tracking' }}
        >
          <ThemedText style={[styles.tabText, activeTab === 'tracking' && styles.activeTabText]}>
            Tracking
          </ThemedText>
        </HapticTab>
      </ThemedView>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2e7d32',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  collectionList: {
    padding: 16,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 