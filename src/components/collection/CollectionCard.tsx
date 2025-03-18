import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { Collection } from '@/store/slices/collectionSlice';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

interface CollectionCardProps {
  collection: Collection;
  showStatus?: boolean;
}

export function CollectionCard({ collection, showStatus = true }: CollectionCardProps) {
  const { theme } = useTheme();

  const getStatusColor = () => {
    switch (collection.status) {
      case 'completed':
        return theme.colors.success;
      case 'in_progress':
        return theme.colors.warning;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  return (
    <Link
      href={{
        pathname: '/collections/[id]',
        params: { id: collection.id }
      }}
      asChild
    >
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.header}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            <ThemedText variant="body" style={styles.date}>
              {formatDate(collection.scheduledDateTime)}
            </ThemedText>
          </View>
          {showStatus && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor() + '20' },
              ]}
            >
              <ThemedText
                variant="body-sm"
                style={[styles.statusText, { color: getStatusColor() }]}
              >
                {collection.status.replace('_', ' ').toUpperCase()}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.materialInfo}>
            <ThemedText variant="h3">{collection.materialType}</ThemedText>
            <ThemedText variant="body-sm">
              {collection.estimatedWeight}kg estimated
            </ThemedText>
          </View>

          <View style={styles.locationInfo}>
            <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
            <ThemedText variant="body-sm" numberOfLines={2} style={styles.address}>
              {collection.location.address}
            </ThemedText>
          </View>

          {collection.status === 'completed' && (
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <ThemedText variant="h3">{collection.actualWeight}kg</ThemedText>
                <ThemedText variant="body-sm">Actual Weight</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText variant="h3">{collection.pointsEarned}</ThemedText>
                <ThemedText variant="body-sm">Points Earned</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText variant="h3">{collection.co2Offset}kg</ThemedText>
                <ThemedText variant="body-sm">CO2 Offset</ThemedText>
              </View>
            </View>
          )}
        </View>
      </View>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    textTransform: 'uppercase',
  },
  content: {
    gap: 12,
  },
  materialInfo: {
    marginBottom: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  address: {
    flex: 1,
    marginLeft: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
}); 