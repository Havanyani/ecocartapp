import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Community Leaderboard Screen
 * Displays top recyclers and contributors
 */
export default function CommunityLeaderboardScreen() {
  // Sample leaderboard data
  const leaderboardData = [
    { id: 1, name: 'Sarah Johnson', points: 1250, avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Michael Chen', points: 980, avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Emma Wilson', points: 875, avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: 4, name: 'David Rodriguez', points: 720, avatar: 'https://i.pravatar.cc/150?img=4' },
    { id: 5, name: 'Anna Kim', points: 690, avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 6, name: 'John Smith', points: 580, avatar: 'https://i.pravatar.cc/150?img=6' },
    { id: 7, name: 'Lisa Wong', points: 520, avatar: 'https://i.pravatar.cc/150?img=7' },
    { id: 8, name: 'Kevin Patel', points: 440, avatar: 'https://i.pravatar.cc/150?img=8' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Community Leaderboard</Text>
          <Text style={styles.subtitle}>Top recyclers this month</Text>
        </View>
        
        <View style={styles.leaderboardContainer}>
          {leaderboardData.map((user, index) => (
            <View key={user.id} style={styles.leaderboardRow}>
              <Text style={styles.rank}>{index + 1}</Text>
              <Image 
                source={{ uri: user.avatar }} 
                style={styles.avatar} 
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <View style={styles.pointsContainer}>
                  <Text style={styles.pointsLabel}>EcoPoints</Text>
                  <Text style={styles.pointsValue}>{user.points}</Text>
                </View>
              </View>
            </View>
          ))}
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
  leaderboardContainer: {
    padding: 15,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rank: {
    width: 30,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34D399',
  },
}); 