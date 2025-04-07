import { useTheme } from '@/theme';
import { collectionService } from '@/services/CollectionService';
import { selectCollections, selectError, selectIsLoading, setCollections, setError } from '@/store/slices/collectionSlice';
import { Collection, CollectionStatus } from '@/types/Collection';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from './ui/Card';
import { HapticTab } from './ui/HapticTab';
import { ThemedText } from './ui/ThemedText';
import { ThemedView } from './ui/ThemedView';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  type: 'collection' | 'delivery' | 'other';
  collectionId?: string;
}

interface TodoProps {
  type?: 'collection' | 'delivery' | 'all';
  maxItems?: number;
  onTaskComplete?: (taskId: string) => void;
  onViewAll?: () => void;
  testID?: string;
}

export function Todo({ type = 'all', maxItems = 3, onTaskComplete, onViewAll, testID }: TodoProps) {
  const theme = useTheme()()();
  const dispatch = useDispatch();
  const collections = useSelector(selectCollections);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    convertCollectionsToTasks();
  }, [collections]);

  const loadCollections = async () => {
    try {
      const data = await collectionService.getCollectionHistory();
      dispatch(setCollections(data));
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to load collections'));
    }
  };

  const convertCollectionsToTasks = () => {
    if (!collections || !collections.length) return;

    const today = new Date();
    const collectionTasks = collections
      .filter((collection: Collection) => 
        collection.status === 'pending' || 
        collection.status === 'confirmed' ||
        collection.status === 'in_progress'
      )
      .map((collection: Collection) => {
        const scheduledDate = new Date(collection.scheduledDateTime);
        const isOverdue = scheduledDate < today && collection.status !== 'completed';
        
        return {
          id: `collection-${collection.id}`,
          title: `Collection #${collection.id.substring(0, 8)}`,
          description: `${collection.materials.length} material types to collect`,
          dueDate: scheduledDate,
          status: isOverdue ? 'overdue' as const : (collection.status === 'completed' ? 'completed' as const : 'pending' as const),
          priority: isOverdue ? 'high' as const : 'medium' as const,
          type: 'collection' as const,
          collectionId: collection.id
        };
      });

    setTasks(collectionTasks);
  };

  const handleCompleteTask = async (taskId: string, collectionId: string) => {
    try {
      await collectionService.updateCollectionStatus(collectionId, 'completed' as CollectionStatus);
      
      // Update local state
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, status: 'completed' } 
            : task
        )
      );
      
      if (onTaskComplete) {
        onTaskComplete(taskId);
      }
      
      // Refresh collection data
      await loadCollections();
    } catch (error: any) {
      dispatch(setError('Failed to update task status. Please try again.'));
    }
  };

  const filteredTasks = useMemo(() => {
    if (type === 'all') return tasks;
    return tasks.filter(task => task.type === type);
  }, [tasks, type]);

  const visibleTasks = useMemo(() => {
    return filteredTasks.slice(0, maxItems);
  }, [filteredTasks, maxItems]);

  const renderItem = ({ item }: { item: Task }) => (
    <Card style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <ThemedText style={styles.taskTitle}>{item.title}</ThemedText>
          {item.status === 'overdue' && (
            <View style={styles.overdueBadge}>
              <ThemedText style={styles.overdueBadgeText}>Overdue</ThemedText>
            </View>
          )}
        </View>
        <TouchableOpacity 
          onPress={() => handleCompleteTask(item.id, item.collectionId!)}
          disabled={item.status === 'completed'}
          accessibilityLabel={item.status === 'completed' ? "Task completed" : "Mark task as complete"}
          accessibilityRole="button"
        >
          <Ionicons 
            name={item.status === 'completed' ? "checkmark-circle" : "checkmark-circle-outline"} 
            size={24} 
            color={item.status === 'completed' ? '#4caf50' : '#2e7d32'} 
          />
        </TouchableOpacity>
      </View>
      
      <ThemedText style={styles.taskDescription}>{item.description}</ThemedText>
      
      <View style={styles.taskFooter}>
        <View style={styles.taskMetadata}>
          <Ionicons name="calendar-outline" size={16} color="#757575" />
          <ThemedText style={styles.taskDate}>
            {format(item.dueDate, 'MMM d, yyyy')}
          </ThemedText>
        </View>
        
        <View style={[
          styles.priorityBadge, 
          { backgroundColor: item.priority === 'high' 
            ? '#f44336' 
            : item.priority === 'medium' 
              ? '#ff9800' 
              : '#4caf50' 
          }
        ]}>
          <ThemedText style={styles.priorityText}>
            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
          </ThemedText>
        </View>
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <ThemedView 
        style={styles.loadingContainer} 
        testID={testID ? `${testID}-loading` : 'todo-loading'}
      >
        <ActivityIndicator size="large" color="#2e7d32" />
      </ThemedView>
    );
  }

  if (!visibleTasks.length) {
    return (
      <ThemedView style={styles.emptyContainer} testID={testID ? `${testID}-empty` : undefined}>
        <Ionicons name="checkmark-done-circle" size={48} color="#4caf50" />
        <ThemedText style={styles.emptyText}>All tasks completed!</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container} testID={testID}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Upcoming Tasks</ThemedText>
        {filteredTasks.length > maxItems && (
          <HapticTab 
            onPress={onViewAll || (() => {})}
            accessibilityLabel="View all tasks"
            accessibilityRole="button"
            testID={testID ? `${testID}-view-all` : undefined}
          >
            <ThemedText style={styles.viewAll}>View All</ThemedText>
          </HapticTab>
        )}
      </View>

      <FlatList
        data={visibleTasks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        testID={testID ? `${testID}-list` : undefined}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2e7d32',
  },
  list: {
    width: '100%',
  },
  listContent: {
    gap: 12,
  },
  taskCard: {
    padding: 16,
    borderRadius: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  overdueBadge: {
    backgroundColor: '#f44336',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  overdueBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 12,
    color: '#666',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskDate: {
    fontSize: 12,
    color: '#666',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
}); 