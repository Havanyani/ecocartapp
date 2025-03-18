/**
 * CollectionListScreen.tsx
 * 
 * A screen that demonstrates the offline-aware list functionality
 * for managing plastic collection items.
 */

import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OfflineAwareList } from '@/components/offline/OfflineAwareList';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import useSyncQueue from '@/hooks/useSyncQueue';

// Mock navigation props - in a real app this would come from a navigation library
interface CollectionListScreenProps {
  navigation?: {
    navigate: (screen: string, params?: any) => void;
  };
}

export function CollectionListScreen({ navigation }: CollectionListScreenProps) {
  const { isOnline } = useNetworkStatus();
  const { stats: syncStats, isSyncing, synchronize } = useSyncQueue();
  
  // In a real app, this ID would come from the user's profile or route params
  const collectionListId = 'user_collection_1';
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Collection Lists</Text>
        
        <View style={styles.headerActions}>
          {syncStats.total > 0 && isOnline && (
            <TouchableOpacity 
              style={styles.syncButton}
              onPress={synchronize}
              disabled={isSyncing}
            >
              <Ionicons 
                name={isSyncing ? "sync-circle" : "sync"} 
                size={24} 
                color="#2C76E5" 
              />
              <Text style={styles.syncText}>
                {isSyncing ? 'Syncing...' : `Sync (${syncStats.total})`}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation?.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color="#2C76E5" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.container}>
        <OfflineAwareList 
          listId={collectionListId} 
          title="My Collection Items" 
        />
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => navigation?.navigate('Dashboard')}
        >
          <Ionicons name="home-outline" size={24} color="#8E8E93" />
          <Text style={styles.footerButtonText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.footerButton, styles.activeFooterButton]}
          onPress={() => {}}
        >
          <Ionicons name="list" size={24} color="#2C76E5" />
          <Text style={[styles.footerButtonText, styles.activeFooterButtonText]}>
            Collections
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => navigation?.navigate('Map')}
        >
          <Ionicons name="map-outline" size={24} color="#8E8E93" />
          <Text style={styles.footerButtonText}>Map</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => navigation?.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={24} color="#8E8E93" />
          <Text style={styles.footerButtonText}>Profile</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#EBF2FF',
    borderRadius: 16
  },
  syncText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2C76E5'
  },
  settingsButton: {
    padding: 4
  },
  container: {
    flex: 1
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: 8
  },
  footerButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8
  },
  activeFooterButton: {
    borderTopWidth: 2,
    borderTopColor: '#2C76E5'
  },
  footerButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: '#8E8E93'
  },
  activeFooterButtonText: {
    color: '#2C76E5'
  }
});

export default CollectionListScreen; 