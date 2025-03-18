import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Stack } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * User Profile Screen
 * Displays user information and settings
 */
export default function ProfileScreen() {
  // Sample user data
  const userData = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    joined: 'June 2023',
    recyclingPoints: 750,
    recycledItems: 28,
    co2Saved: 12.5,
    profileImage: 'https://i.pravatar.cc/300'
  };

  return (
    <ErrorBoundary componentName="Profile Screen">
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'My Profile',
            headerShown: true,
          }}
        />
        <ScrollView>
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: userData.profileImage }}
              style={styles.profileImage}
            />
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
            <Text style={styles.joinDate}>Member since {userData.joined}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userData.recyclingPoints}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userData.recycledItems}</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userData.co2Saved} kg</Text>
              <Text style={styles.statLabel}>CO2 Saved</Text>
            </View>
          </View>

          <View style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <ThemeSwitcher compact />
            </View>
            
            <Pressable style={styles.settingRow}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingValue}>On</Text>
            </Pressable>
            
            <Pressable style={styles.settingRow}>
              <Text style={styles.settingLabel}>Privacy Settings</Text>
              <Text style={styles.settingValue}>Manage</Text>
            </Pressable>
            
            <Pressable style={styles.settingRow}>
              <Text style={styles.settingLabel}>Account Settings</Text>
              <Text style={styles.settingValue}>Manage</Text>
            </Pressable>
            
            <Pressable style={styles.settingRow}>
              <Text style={styles.settingLabel}>Help & Support</Text>
              <Text style={styles.settingValue}>Contact</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#34D399',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userEmail: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
    opacity: 0.8,
  },
  joinDate: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 1,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  settingsContainer: {
    backgroundColor: '#fff',
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingValue: {
    fontSize: 16,
    color: '#34D399',
  },
}); 