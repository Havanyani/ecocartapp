import { Link } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Community Main Screen
 * Displays community features and navigation
 */
export default function CommunityScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>EcoCart Community</Text>
          <Text style={styles.subtitle}>Connect with eco-conscious individuals</Text>
        </View>
        
        <View style={styles.featuresContainer}>
          <Link href="/community/challenge" asChild>
            <Pressable style={styles.featureCard}>
              <Text style={styles.featureName}>Challenges</Text>
              <Text style={styles.featureDescription}>
                Join eco-friendly challenges with the community
              </Text>
            </Pressable>
          </Link>
          
          <Link href="/community/events" asChild>
            <Pressable style={styles.featureCard}>
              <Text style={styles.featureName}>Events</Text>
              <Text style={styles.featureDescription}>
                Discover local recycling and sustainability events
              </Text>
            </Pressable>
          </Link>
          
          <Link href="/community/leaderboard" asChild>
            <Pressable style={styles.featureCard}>
              <Text style={styles.featureName}>Leaderboard</Text>
              <Text style={styles.featureDescription}>
                See top recyclers and eco-warriors in your area
              </Text>
            </Pressable>
          </Link>
          
          <Link href="/community/tips" asChild>
            <Pressable style={styles.featureCard}>
              <Text style={styles.featureName}>Recycling Tips</Text>
              <Text style={styles.featureDescription}>
                Share and discover user-generated recycling tips
              </Text>
            </Pressable>
          </Link>
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
  featuresContainer: {
    padding: 15,
  },
  featureCard: {
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
  featureName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 