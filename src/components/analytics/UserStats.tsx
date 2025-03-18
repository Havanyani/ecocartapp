import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useTheme } from '../../hooks/useTheme';

interface UserStatsProps {
  userId: string;
}

export function UserStats({ userId }: UserStatsProps) {
  const { colors } = useTheme();
  const { stats, isLoading, error } = useAnalytics(userId);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, { color: colors.text }]}>Loading stats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, { color: colors.error }]}>
          Error loading stats: {error.message}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.title, { color: colors.text }]}>Shopping Stats</Text>
        <View style={styles.statRow}>
          <Text style={[styles.label, { color: colors.text }]}>Total Purchases:</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {stats?.totalPurchases || 0}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.label, { color: colors.text }]}>Eco-Friendly Items:</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {stats?.ecoFriendlyItems || 0}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.label, { color: colors.text }]}>Carbon Saved:</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {stats?.carbonSaved || 0} kg
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.title, { color: colors.text }]}>Achievements</Text>
        {stats?.achievements.map((achievement) => (
          <View key={achievement.id} style={styles.achievement}>
            <Text style={[styles.achievementTitle, { color: colors.text }]}>
              {achievement.title}
            </Text>
            <Text style={[styles.achievementDesc, { color: colors.text }]}>
              {achievement.description}
            </Text>
            <Text style={[styles.achievementDate, { color: colors.text }]}>
              {new Date(achievement.earnedAt).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.title, { color: colors.text }]}>Shopping Trends</Text>
        <View style={styles.statRow}>
          <Text style={[styles.label, { color: colors.text }]}>Most Bought Category:</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {stats?.topCategory || 'N/A'}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.label, { color: colors.text }]}>Average Order Value:</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            ${stats?.averageOrderValue || 0}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  achievement: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    opacity: 0.7,
  },
}); 