/**
 * HomeScreen.tsx
 * 
 * Main dashboard screen for authenticated users.
 */

import NotificationIcon from '@/components/ui/NotificationIcon';
import { useAuth } from '@/contexts/AuthContext';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome{user?.name ? `, ${user.name}` : ''}!</Text>
            <Text style={styles.subtitleText}>Ready to make an impact today?</Text>
          </View>
          <View style={styles.headerButtons}>
            <NotificationIcon />
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={24} color="#2C3E50" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Offline Banner */}
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline" size={20} color="#FFFFFF" />
            <Text style={styles.offlineText}>
              You're currently offline. Some features may be limited.
            </Text>
          </View>
        )}
        
        {/* Eco Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Eco Impact</Text>
          <TouchableOpacity 
            style={styles.viewImpactButton}
            onPress={() => navigation.navigate('EnvironmentalImpact')}
          >
            <Text style={styles.viewImpactText}>View Detailed Impact</Text>
            <Ionicons name="chevron-forward" size={16} color="#34C759" />
          </TouchableOpacity>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="trash-outline" size={28} color="#34C759" />
              <Text style={styles.statNumber}>27</Text>
              <Text style={styles.statLabel}>Items Recycled</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="leaf-outline" size={28} color="#34C759" />
              <Text style={styles.statNumber}>5.2kg</Text>
              <Text style={styles.statLabel}>CO₂ Saved</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="water-outline" size={28} color="#34C759" />
              <Text style={styles.statNumber}>12L</Text>
              <Text style={styles.statLabel}>Water Saved</Text>
            </View>
          </View>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Materials')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#E3FFF1' }]}>
                <Ionicons name="search-outline" size={24} color="#34C759" />
              </View>
              <Text style={styles.actionText}>Browse Materials</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Collections')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#E6F9FF' }]}>
                <Ionicons name="calendar-outline" size={24} color="#2C76E5" />
              </View>
              <Text style={styles.actionText}>Schedule Pickup</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('EnvironmentalImpact')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="analytics-outline" size={24} color="#2E7D32" />
              </View>
              <Text style={styles.actionText}>Impact Dashboard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('BarcodeScanner')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFEFF0' }]}>
                <Ionicons name="barcode-outline" size={24} color="#FF3B30" />
              </View>
              <Text style={styles.actionText}>Scan Item</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Challenges')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#F4EDFF' }]}>
                <Ionicons name="people-outline" size={24} color="#5E35B1" />
              </View>
              <Text style={styles.actionText}>Community Challenges</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/components')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#E0F7FA' }]}>
                <Ionicons name="construct-outline" size={24} color="#00BCD4" />
              </View>
              <Text style={styles.actionText}>UI Components</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Conversations')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="chatbubbles-outline" size={24} color="#FF9800" />
              </View>
              <Text style={styles.actionText}>Messages</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <View style={styles.activityHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#E3FFF1' }]}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#34C759" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Plastic bottle recycled</Text>
                <Text style={styles.activityTime}>Today, 10:30 AM</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </View>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#E6F9FF' }]}>
                <Ionicons name="calendar-outline" size={20} color="#2C76E5" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Scheduled collection</Text>
                <Text style={styles.activityTime}>Yesterday, 2:15 PM</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </View>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#FFF8E6' }]}>
                <Ionicons name="trophy-outline" size={20} color="#FF9500" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Earned Green Badge</Text>
                <Text style={styles.activityTime}>2 days ago</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  container: {
    flex: 1,
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4
  },
  subtitleText: {
    fontSize: 16,
    color: '#8E8E93'
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    marginLeft: 16,
    padding: 4,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    flex: 1
  },
  statsContainer: {
    marginBottom: 24
  },
  viewImpactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  viewImpactText: {
    fontSize: 14,
    color: '#34C759',
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginVertical: 8
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center'
  },
  actionsContainer: {
    marginBottom: 24
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50'
  },
  activityContainer: {
    marginBottom: 24
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  viewAllText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '500'
  },
  activityList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    overflow: 'hidden'
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  activityContent: {
    flex: 1
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 4
  },
  activityTime: {
    fontSize: 12,
    color: '#8E8E93'
  }
});