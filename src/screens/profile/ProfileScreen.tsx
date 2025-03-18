/**
 * ProfileScreen.tsx
 * 
 * Screen for displaying and editing user profile information.
 */

import { useAuth } from '@/contexts/AuthContext';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout } = useAuth();
  const { isOnline } = useNetworkStatus();
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'An error occurred while logging out. Please try again.');
    }
  };
  
  // Confirm logout
  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: handleLogout, style: 'destructive' }
      ]
    );
  };
  
  // Navigate to settings
  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Profile</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={navigateToSettings}
          >
            <Ionicons name="settings-outline" size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        
        {/* Offline Banner */}
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline" size={20} color="#FFFFFF" />
            <Text style={styles.offlineText}>
              You're currently offline. Profile updates will be synced when you're back online.
            </Text>
          </View>
        )}
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            {user?.profilePictureUrl ? (
              <Image 
                source={{ uri: user.profilePictureUrl }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileInitials}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editPhotoButton}>
              <Ionicons name="camera" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
          
          <View style={styles.badgesContainer}>
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={16} color="#34C759" />
              <Text style={styles.badgeText}>Verified</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="leaf" size={16} color="#34C759" />
              <Text style={styles.badgeText}>Eco Pioneer</Text>
            </View>
          </View>
        </View>
        
        {/* Progress */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '65%' }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>65% to next level</Text>
              <Text style={styles.progressLevel}>Level 3</Text>
            </View>
          </View>
        </View>
        
        {/* Account Options */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionContent}>
                <Ionicons name="person" size={22} color="#2C3E50" />
                <Text style={styles.optionText}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => navigation.navigate('Achievements')}
            >
              <View style={styles.optionContent}>
                <Ionicons name="trophy" size={22} color="#2C3E50" />
                <Text style={styles.optionText}>Achievements & Badges</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionContent}>
                <Ionicons name="notifications" size={22} color="#2C3E50" />
                <Text style={styles.optionText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionContent}>
                <Ionicons name="lock-closed" size={22} color="#2C3E50" />
                <Text style={styles.optionText}>Privacy & Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionContent}>
                <Ionicons name="language" size={22} color="#2C3E50" />
                <Text style={styles.optionText}>Language</Text>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionValue}>English</Text>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => navigation.navigate('performance')}
            >
              <View style={styles.optionContent}>
                <Ionicons name="speedometer" size={22} color="#2C3E50" />
                <Text style={styles.optionText}>Performance Monitor</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => navigation.navigate('FAQDemo')}
            >
              <View style={styles.optionContent}>
                <Ionicons name="help-circle" size={22} color="#2C3E50" />
                <Text style={styles.optionText}>FAQ Help Center</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Preferences */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionContent}>
                <Ionicons name="location" size={22} color="#2C3E50" />
                <Text style={styles.optionText}>Location</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionContent}>
                <Ionicons name="moon" size={22} color="#2C3E50" />
                <Text style={styles.optionText}>Dark Mode</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Support */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionContent}>
                <Ionicons name="help-circle" size={22} color="#2C3E50" />
                <Text style={styles.optionText}>Help Center</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionContent}>
                <Ionicons name="chatbubble-ellipses" size={22} color="#2C3E50" />
                <Text style={styles.optionText}>Contact Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionContent}>
                <Ionicons name="document-text" size={22} color="#2C3E50" />
                <Text style={styles.optionText}>Terms & Policies</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={confirmLogout}
        >
          <Ionicons name="log-out" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
        {/* App Version */}
        <Text style={styles.versionText}>EcoCart v1.0.0</Text>
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
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center'
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
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileInitials: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2C76E5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4
  },
  userEmail: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 16
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3FFF1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4
  },
  badgeText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
    marginLeft: 4
  },
  sectionContainer: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12
  },
  progressContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93'
  },
  progressLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759'
  },
  optionsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    overflow: 'hidden'
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  optionText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 12
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  optionValue: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF2F2',
    borderRadius: 8,
    paddingVertical: 14,
    marginVertical: 24
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8
  },
  versionText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24
  }
}); 