import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { UserProfile } from '@/store/slices/userSlice';
import { ThemedText } from '@/components/ui/ThemedText';

interface ProfileStatsProps {
  profile: UserProfile;
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  const theme = useTheme()()();

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.header}>
          <ThemedText variant="h2">Your Impact</ThemedText>
          <ThemedText variant="body-sm">Keep up the great work!</ThemedText>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <Ionicons name="star" size={24} color={theme.colors.primary} />
            </View>
            <ThemedText variant="h2">{profile.totalPoints}</ThemedText>
            <ThemedText variant="body-sm">Total Points</ThemedText>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
              <Ionicons name="leaf" size={24} color={theme.colors.success} />
            </View>
            <ThemedText variant="h2">{profile.co2Offset}kg</ThemedText>
            <ThemedText variant="body-sm">CO2 Offset</ThemedText>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondary + '20' }]}>
              <Ionicons name="cube" size={24} color={theme.colors.secondary} />
            </View>
            <ThemedText variant="h2">{profile.totalCollections}</ThemedText>
            <ThemedText variant="body-sm">Collections</ThemedText>
          </View>
        </View>

        <View style={[styles.milestoneBar, { backgroundColor: theme.colors.border }]}>
          <View
            style={[
              styles.milestoneProgress,
              {
                backgroundColor: theme.colors.primary,
                width: `${Math.min((profile.totalPoints / 1000) * 100, 100)}%`,
              },
            ]}
          />
        </View>
        <ThemedText variant="caption" style={styles.milestoneText}>
          {1000 - (profile.totalPoints % 1000)} points until next milestone
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  milestoneBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  milestoneProgress: {
    height: '100%',
    borderRadius: 2,
  },
  milestoneText: {
    textAlign: 'center',
  },
}); 