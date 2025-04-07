import CollectionScheduler from '@/components/CollectionScheduler';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useStore } from '@/hooks/useStore';
import { UserService } from '@/services/UserService';
import { useTheme } from '@/theme';
import { TimeSlot } from '@/types/collections';
import { formatDate } from '@/utils/dateUtils';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomeScreen() {
  const { userStore, collectionStore } = useStore();
  const theme = useTheme();
  const navigation = useNavigation();

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.theme.colors.background }]}>
      <ScrollView>
        {/* Welcome Section */}
        <ThemedView style={styles.header}>
          <ThemedText style={styles.welcomeText}>Welcome back!</ThemedText>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <MaterialCommunityIcons name="bell-outline" size={24} color={theme.theme.colors.primary} />
          </TouchableOpacity>
        </ThemedView>

        {/* Stats Overview */}
        <ThemedView style={styles.statsContainer}>
          <ThemedView style={[styles.statCard, { backgroundColor: theme.theme.colors.card }]}>
            <MaterialCommunityIcons name="recycle" size={32} color={theme.theme.colors.primary} />
            <ThemedText style={styles.statValue}>
              {userStore.metrics.totalPlasticCollected}kg
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.theme.colors.textSecondary }]}>Total Recycled</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.statCard, { backgroundColor: theme.theme.colors.card }]}>
            <MaterialCommunityIcons name="wallet" size={32} color={theme.theme.colors.primary} />
            <ThemedText style={styles.statValue}>
              R{userStore.metrics.credits}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.theme.colors.textSecondary }]}>Credits Earned</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.theme.colors.primary }]}
            onPress={() => navigation.navigate('ScheduleCollection')}
          >
            <MaterialCommunityIcons name="plus-circle" size={24} color={theme.theme.colors.white} />
            <ThemedText style={[styles.actionButtonText, { color: theme.theme.colors.white }]}>Schedule Collection</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton, { borderColor: theme.theme.colors.primary }]}
            onPress={() => navigation.navigate('CollectionHistory')}
          >
            <MaterialCommunityIcons name="history" size={24} color={theme.theme.colors.primary} />
            <ThemedText style={[styles.actionButtonText, styles.secondaryButtonText, { color: theme.theme.colors.primary }]}>
              View History
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Upcoming Collections */}
        {collectionStore.upcomingCollections.length > 0 && (
          <ThemedView style={styles.upcomingContainer}>
            <ThemedText style={styles.sectionTitle}>Upcoming Collection</ThemedText>
            {collectionStore.upcomingCollections.map((collection) => (
              <ThemedView key={collection.id} style={[styles.upcomingCard, { backgroundColor: theme.theme.colors.card }]}>
                <MaterialCommunityIcons name="calendar-clock" size={24} color={theme.theme.colors.primary} />
                <ThemedView style={styles.upcomingInfo}>
                  <ThemedText style={styles.upcomingDate}>
                    {formatDate(collection.scheduledDateTime)}
                  </ThemedText>
                  <ThemedText style={[styles.upcomingTime, { color: theme.theme.colors.textSecondary }]}>
                    {new Date(collection.scheduledDateTime).toLocaleTimeString()}
                  </ThemedText>
                </ThemedView>
                <TouchableOpacity 
                  style={styles.rescheduleButton}
                  onPress={() => navigation.navigate('ScheduleCollection')}
                >
                  <ThemedText style={[styles.rescheduleText, { color: theme.theme.colors.primary }]}>Reschedule</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            ))}
          </ThemedView>
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
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8
  },
  statLabel: {
    fontSize: 16
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    padding: 16,
    borderRadius: 8
  },
  secondaryButtonText: {
    fontWeight: 'bold'
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
    fontSize: 14
  },
  rescheduleButton: {
    padding: 8
  },
  rescheduleText: {
    fontSize: 16,
    fontWeight: 'bold'
  }
}); 