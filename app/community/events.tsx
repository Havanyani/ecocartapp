import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Community Events Screen
 * Displays eco-friendly community events
 */
export default function CommunityEventsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Community Events</Text>
          <Text style={styles.subtitle}>Upcoming sustainability events</Text>
        </View>
        
        <View style={styles.eventsContainer}>
          <View style={styles.eventCard}>
            <Text style={styles.date}>Oct 15, 2023</Text>
            <Text style={styles.eventName}>Beach Cleanup</Text>
            <Text style={styles.eventDescription}>
              Join us for a community beach cleanup. Bring gloves and water!
            </Text>
            <Text style={styles.location}>Ocean Beach, San Francisco</Text>
          </View>
          
          <View style={styles.eventCard}>
            <Text style={styles.date}>Oct 22, 2023</Text>
            <Text style={styles.eventName}>Recycling Workshop</Text>
            <Text style={styles.eventDescription}>
              Learn how to properly sort and recycle various materials.
            </Text>
            <Text style={styles.location}>Community Center</Text>
          </View>
          
          <View style={styles.eventCard}>
            <Text style={styles.date}>Nov 5, 2023</Text>
            <Text style={styles.eventName}>Sustainable Living Expo</Text>
            <Text style={styles.eventDescription}>
              Explore sustainable products and lifestyle choices.
            </Text>
            <Text style={styles.location}>Downtown Convention Center</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#34D399',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  eventsContainer: {
    padding: 15,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  date: {
    fontSize: 14,
    color: '#34D399',
    fontWeight: '500',
    marginBottom: 5,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  location: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
}); 