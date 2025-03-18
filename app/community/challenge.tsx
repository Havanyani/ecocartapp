import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Community Challenge Screen
 * Displays eco-friendly challenges for the community
 */
export default function CommunityChallengeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Community Challenges</Text>
          <Text style={styles.subtitle}>Join eco-friendly activities with others</Text>
        </View>
        
        <View style={styles.challengeContainer}>
          <View style={styles.challengeCard}>
            <Text style={styles.challengeName}>Weekly Recycling</Text>
            <Text style={styles.challengeDescription}>
              Recycle at least 5kg of materials this week and earn bonus points!
            </Text>
            <Text style={styles.participants}>42 participants</Text>
          </View>
          
          <View style={styles.challengeCard}>
            <Text style={styles.challengeName}>Plastic-Free Month</Text>
            <Text style={styles.challengeDescription}>
              Avoid single-use plastics for 30 days to earn exclusive badges.
            </Text>
            <Text style={styles.participants}>78 participants</Text>
          </View>
          
          <View style={styles.challengeCard}>
            <Text style={styles.challengeName}>Community Cleanup</Text>
            <Text style={styles.challengeDescription}>
              Join local cleanup events in your area and track your impact.
            </Text>
            <Text style={styles.participants}>23 participants</Text>
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
  challengeContainer: {
    padding: 15,
  },
  challengeCard: {
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
  challengeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  participants: {
    fontSize: 12,
    color: '#34D399',
    fontWeight: '500',
  },
}); 