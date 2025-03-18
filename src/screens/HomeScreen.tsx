import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CollectionScheduler from '@/components/CollectionScheduler';
import { ThemedText } from '@/components/ui/ThemedText';
import { useStore } from '@/hooks/useStore';
import { UserService } from '@/services/UserService';
import type { TimeSlot } from '@/types/Collection';
import type { RootStackParamList } from '@/types/navigation';
import { formatDate } from '@/utils/dateUtils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { userStore, collectionStore } = useStore();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await UserService.getUserData();
      userStore.updateUserData(data);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleScheduleCollection = (slot: TimeSlot, date: Date) => {
    collectionStore.scheduleCollection(slot, date);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Welcome Section */}
        <View style={styles.header}>
          <ThemedText style={styles.welcomeText}>Welcome back!</ThemedText>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <MaterialCommunityIcons name="bell-outline" size={24} color="#2e7d32" />
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="recycle" size={32} color="#2e7d32" />
            <ThemedText style={styles.statValue}>
              {userStore.metrics.totalPlasticCollected}kg
            </ThemedText>
            <ThemedText style={styles.statLabel}>Total Recycled</ThemedText>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="wallet" size={32} color="#2e7d32" />
            <ThemedText style={styles.statValue}>
              R{userStore.metrics.credits}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Credits Earned</ThemedText>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Schedule')}
          >
            <MaterialCommunityIcons name="plus-circle" size={24} color="#fff" />
            <ThemedText style={styles.actionButtonText}>Schedule Collection</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('CollectionHistory')}
          >
            <MaterialCommunityIcons name="history" size={24} color="#2e7d32" />
            <ThemedText style={[styles.actionButtonText, styles.secondaryButtonText]}>
              View History
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Upcoming Collections */}
        {collectionStore.upcomingCollections.length > 0 && (
          <View style={styles.upcomingContainer}>
            <ThemedText style={styles.sectionTitle}>Upcoming Collection</ThemedText>
            {collectionStore.upcomingCollections.map((collection) => (
              <View key={collection.id} style={styles.upcomingCard}>
                <MaterialCommunityIcons name="calendar-clock" size={24} color="#2e7d32" />
                <View style={styles.upcomingInfo}>
                  <ThemedText style={styles.upcomingDate}>
                    {formatDate(collection.date)}
                  </ThemedText>
                  <ThemedText style={styles.upcomingTime}>
                    {collection.slot.time}
                  </ThemedText>
                </View>
                <TouchableOpacity 
                  style={styles.rescheduleButton}
                  onPress={() => navigation.navigate('Schedule')}
                >
                  <ThemedText style={styles.rescheduleText}>Reschedule</ThemedText>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Collection Scheduler */}
        <CollectionScheduler onSchedule={handleScheduleCollection} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 16
  },
  notificationButton: {
    padding: 8
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  statCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8
  },
  statLabel: {
    fontSize: 16,
    color: '#666'
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  actionButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2e7d32',
    padding: 16,
    borderRadius: 8
  },
  secondaryButtonText: {
    color: '#2e7d32'
  },
  upcomingContainer: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8
  },
  upcomingInfo: {
    flex: 1
  },
  upcomingDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  upcomingTime: {
    fontSize: 14,
    color: '#666'
  },
  rescheduleButton: {
    padding: 8
  },
  rescheduleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32'
  }
}); 