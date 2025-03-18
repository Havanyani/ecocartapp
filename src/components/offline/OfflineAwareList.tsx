/**
 * OfflineAwareList.tsx
 * 
 * A component that demonstrates offline-aware data handling
 * using local storage and sync capabilities.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useLocalStorage from '@/hooks/useLocalStorage';
import useSyncQueue from '@/hooks/useSyncQueue';
import useNetworkStatus from '@/hooks/useNetworkStatus';

interface Item {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OfflineAwareListProps {
  listId: string;
  title: string;
}

// Create a simple validation schema for list items
const itemValidator = (value: any): value is Item[] => {
  if (!Array.isArray(value)) return false;
  
  return value.every(item => 
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.text === 'string' &&
    typeof item.completed === 'boolean' &&
    typeof item.createdAt === 'string' &&
    typeof item.updatedAt === 'string'
  );
};

export function OfflineAwareList({ listId, title }: OfflineAwareListProps) {
  const [newItemText, setNewItemText] = useState('');
  
  // Get network status information
  const { isOnline, networkDetails } = useNetworkStatus();
  
  // Get synchronization queue
  const { 
    addToQueue, 
    stats: syncStats,
    isSyncing,
    synchronize
  } = useSyncQueue();
  
  // Use local storage hook to persist items
  const {
    value: items,
    setValue: setItems,
    isLoading,
    error
  } = useLocalStorage<Item[]>(`list_${listId}`, {
    defaultValue: [],
    validate: true,
    offlineSync: true,
    schema: itemValidator
  });
  
  // Generate a unique ID for new items
  const generateId = () => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Add a new item to the list
  const addItem = useCallback(async () => {
    if (!newItemText.trim()) return;
    
    const timestamp = new Date().toISOString();
    const newItem: Item = {
      id: generateId(),
      text: newItemText.trim(),
      completed: false,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    // Update local state
    const updatedItems = [...(items || []), newItem];
    await setItems(updatedItems);
    
    // Add to sync queue if we're offline
    if (!isOnline) {
      await addToQueue({
        action: 'create',
        endpoint: `/api/lists/${listId}/items`,
        data: newItem,
        priority: 1
      });
      
      Alert.alert(
        'Offline Mode',
        'Your item has been saved locally and will be synchronized when you're back online.',
        [{ text: 'OK' }]
      );
    }
    
    // Clear input
    setNewItemText('');
  }, [newItemText, items, setItems, isOnline, addToQueue, listId]);
  
  // Toggle item completion status
  const toggleItem = useCallback(async (id: string) => {
    if (!items) return;
    
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          completed: !item.completed,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
    
    // Update local state
    await setItems(updatedItems);
    
    // Find the updated item
    const updatedItem = updatedItems.find(item => item.id === id);
    
    // Add to sync queue if we're offline
    if (!isOnline && updatedItem) {
      await addToQueue({
        action: 'update',
        endpoint: `/api/lists/${listId}/items/${id}`,
        data: updatedItem,
        priority: 2
      });
    }
  }, [items, setItems, isOnline, addToQueue, listId]);
  
  // Delete an item
  const deleteItem = useCallback(async (id: string) => {
    if (!items) return;
    
    // Update local state
    const updatedItems = items.filter(item => item.id !== id);
    await setItems(updatedItems);
    
    // Add to sync queue if we're offline
    if (!isOnline) {
      await addToQueue({
        action: 'delete',
        endpoint: `/api/lists/${listId}/items/${id}`,
        data: { id },
        priority: 3
      });
    }
  }, [items, setItems, isOnline, addToQueue, listId]);
  
  // Try to synchronize data when back online
  useEffect(() => {
    if (isOnline && syncStats.total > 0 && !isSyncing) {
      synchronize();
    }
  }, [isOnline, syncStats.total, isSyncing, synchronize]);
  
  // Render connection status indicator
  const renderConnectionStatus = () => (
    <View style={styles.connectionStatus}>
      <View 
        style={[
          styles.statusIndicator, 
          isOnline ? styles.statusOnline : styles.statusOffline
        ]} 
      />
      <Text style={styles.statusText}>
        {isOnline ? 'Online' : 'Offline'}
        {syncStats.total > 0 && ` (${syncStats.total} pending)`}
      </Text>
      {syncStats.total > 0 && isOnline && (
        <TouchableOpacity 
          style={styles.syncButton}
          onPress={synchronize}
          disabled={isSyncing}
        >
          <Ionicons 
            name={isSyncing ? "sync-circle" : "sync"} 
            size={18} 
            color="#2C76E5" 
          />
        </TouchableOpacity>
      )}
    </View>
  );
  
  // Render a list item
  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.item}>
      <TouchableOpacity 
        style={styles.checkbox}
        onPress={() => toggleItem(item.id)}
      >
        <Ionicons 
          name={item.completed ? "checkmark-circle" : "ellipse-outline"} 
          size={24} 
          color={item.completed ? "#34C759" : "#8E8E93"} 
        />
      </TouchableOpacity>
      
      <Text 
        style={[
          styles.itemText,
          item.completed && styles.completedText
        ]}
      >
        {item.text}
      </Text>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteItem(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {renderConnectionStatus()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2C76E5" />
          <Text style={styles.loadingText}>Loading items...</Text>
        </View>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {renderConnectionStatus()}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>Failed to load items</Text>
          <Text style={styles.errorDetail}>{error.message}</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {renderConnectionStatus()}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newItemText}
          onChangeText={setNewItemText}
          placeholder="Add new item..."
          placeholderTextColor="#8E8E93"
          onSubmitEditing={addItem}
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={addItem}
          disabled={!newItemText.trim()}
        >
          <Ionicons 
            name="add-circle" 
            size={24} 
            color={newItemText.trim() ? "#2C76E5" : "#C7C7CC"} 
          />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="list" size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>No items yet</Text>
            <Text style={styles.emptySubtext}>Add your first item above</Text>
          </View>
        }
      />
      
      {networkDetails?.type && (
        <Text style={styles.networkInfo}>
          Network: {networkDetails.type}
          {networkDetails.isWifi && ' (WiFi)'}
          {networkDetails.isCellular && ' (Cellular)'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000'
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8
  },
  statusOnline: {
    backgroundColor: '#34C759'
  },
  statusOffline: {
    backgroundColor: '#FF9500'
  },
  statusText: {
    fontSize: 14,
    color: '#3C3C43'
  },
  syncButton: {
    marginLeft: 'auto',
    padding: 4
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000000'
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    width: 48,
    height: 48
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingBottom: 16
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  checkbox: {
    padding: 4
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: '#000000'
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#8E8E93'
  },
  deleteButton: {
    padding: 8
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8E8E93',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30'
  },
  errorDetail: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center'
  },
  networkInfo: {
    marginTop: 8,
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right'
  }
});

export default OfflineAwareList;