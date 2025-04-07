import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/theme';
import { Collection } from '@/types/Collection';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface CollectionCardProps {
  collection: Collection;
  showStatus?: boolean;
}

export function CollectionCard({ collection, showStatus = true }: CollectionCardProps) {
  const theme = useTheme();
  const navigation = useNavigation();

  const getStatusColor = () => {
    switch (collection.status) {
      case 'completed':
        return theme.theme.colors.success;
      case 'in_progress':
        return theme.theme.colors.warning;
      case 'cancelled':
        return theme.theme.colors.error;
      default:
        return theme.theme.colors.primary;
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

  const handlePress = () => {
    navigation.navigate('CollectionDetails', { id: collection.id });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={[styles.container, { backgroundColor: theme.theme.colors.background }]}>
        <View style={styles.header}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={20} color={theme.theme.colors.primary} />
            <ThemedText style={styles.date}>
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
                style={[styles.statusText, { color: getStatusColor() }]}
              >
                {collection.status.replace('_', ' ').toUpperCase()}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.materialInfo}>
            <ThemedText style={styles.materialTitle}>{collection.materialType}</ThemedText>
            <ThemedText style={styles.materialSubtitle}>
              {collection.estimatedWeight}kg estimated
            </ThemedText>
          </View>

          <View style={styles.locationInfo}>
            <Ionicons name="location-outline" size={20} color={theme.theme.colors.primary} />
            <ThemedText numberOfLines={2} style={styles.address}>
              {collection.location.address}
            </ThemedText>
          </View>

          {collection.status === 'completed' && (
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{collection.actualWeight}kg</ThemedText>
                <ThemedText style={styles.statLabel}>Actual Weight</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{collection.pointsEarned}</ThemedText>
                <ThemedText style={styles.statLabel}>Points Earned</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{collection.co2Offset}kg</ThemedText>
                <ThemedText style={styles.statLabel}>CO2 Offset</ThemedText>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
  materialTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  materialSubtitle: {
    fontSize: 14,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  address: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
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
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 14,
  },
}); 