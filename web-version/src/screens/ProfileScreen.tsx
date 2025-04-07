import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../components/shared';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image
            source={require('../../assets/placeholder.png')}
            style={styles.profileImage}
          />
        </View>
        <ThemedText style={styles.userName}>Jane Doe</ThemedText>
        <ThemedText style={styles.userBio}>Eco-conscious shopper since 2022</ThemedText>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>36kg</ThemedText>
            <ThemedText style={styles.statLabel}>CO₂ Saved</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>12</ThemedText>
            <ThemedText style={styles.statLabel}>Orders</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>85</ThemedText>
            <ThemedText style={styles.statLabel}>Eco Score</ThemedText>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Account Settings</ThemedText>
        <TouchableOpacity style={styles.menuItem}>
          <ThemedText style={styles.menuItemText}>Edit Profile</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <ThemedText style={styles.menuItemText}>Change Password</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <ThemedText style={styles.menuItemText}>Notification Preferences</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Eco Journey</ThemedText>
        <TouchableOpacity style={styles.menuItem}>
          <ThemedText style={styles.menuItemText}>Environmental Impact</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <ThemedText style={styles.menuItemText}>Sustainability Badges</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <ThemedText style={styles.menuItemText}>Eco Challenges</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Orders & Payments</ThemedText>
        <TouchableOpacity style={styles.menuItem}>
          <ThemedText style={styles.menuItemText}>Order History</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <ThemedText style={styles.menuItemText}>Saved Payment Methods</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <ThemedText style={styles.menuItemText}>Shipping Addresses</ThemedText>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.logoutButton}>
        <ThemedText style={styles.logoutButtonText}>Log Out</ThemedText>
      </TouchableOpacity>
      
      <View style={styles.versionContainer}>
        <ThemedText style={styles.versionText}>EcoCart v1.0.0</ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#2a9d8f',
    padding: 20,
    alignItems: 'center',
    paddingBottom: 30,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
    marginVertical: 15,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    paddingVertical: 10,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  menuItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#555',
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#e76f51',
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#888',
  },
}); 