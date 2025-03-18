import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Import storage tool components
import StorageExample from '../services/StorageExample';
import StorageMigrationExample from '../StorageMigrationExample';
import StorageBenchmarkScreen from './Benchmark/StorageBenchmarkScreen';
import StorageMonitoringScreen from './Monitoring/StorageMonitoringScreen';

// Tab options
type TabType = 'migration' | 'benchmark' | 'monitoring' | 'example';

/**
 * Main dashboard component for storage tools
 */
const StorageDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('example');
  
  // Render the active tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'migration':
        return <StorageMigrationExample />;
      
      case 'benchmark':
        return <StorageBenchmarkScreen />;
      
      case 'monitoring':
        return <StorageMonitoringScreen />;
      
      case 'example':
      default:
        return <StorageExample />;
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'example' && styles.activeTab]}
          onPress={() => setActiveTab('example')}
        >
          <Ionicons 
            name="cube-outline" 
            size={24} 
            color={activeTab === 'example' ? '#2e7d32' : '#555'} 
          />
          <Text style={[styles.tabText, activeTab === 'example' && styles.activeTabText]}>
            Example
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'migration' && styles.activeTab]}
          onPress={() => setActiveTab('migration')}
        >
          <Ionicons 
            name="arrow-forward-outline" 
            size={24} 
            color={activeTab === 'migration' ? '#2e7d32' : '#555'} 
          />
          <Text style={[styles.tabText, activeTab === 'migration' && styles.activeTabText]}>
            Migration
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'benchmark' && styles.activeTab]}
          onPress={() => setActiveTab('benchmark')}
        >
          <Ionicons 
            name="speedometer-outline" 
            size={24} 
            color={activeTab === 'benchmark' ? '#2e7d32' : '#555'} 
          />
          <Text style={[styles.tabText, activeTab === 'benchmark' && styles.activeTabText]}>
            Benchmark
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'monitoring' && styles.activeTab]}
          onPress={() => setActiveTab('monitoring')}
        >
          <Ionicons 
            name="analytics-outline" 
            size={24} 
            color={activeTab === 'monitoring' ? '#2e7d32' : '#555'} 
          />
          <Text style={[styles.tabText, activeTab === 'monitoring' && styles.activeTabText]}>
            Monitoring
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content Area */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    elevation: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: '#555',
  },
  activeTabText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
});

export default StorageDashboard; 