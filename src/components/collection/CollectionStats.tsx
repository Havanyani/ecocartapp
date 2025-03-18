import { StyleSheet, View } from 'react-native';
import { useAppSelector } from '@/store';
import { selectUser } from '@/store/slices/userSlice';
import { ThemedText } from '@/components/ui/ThemedText';

export function CollectionStats() {
  const user = useAppSelector(selectUser);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <ThemedText variant="h2">{user.totalCollections}</ThemedText>
        <ThemedText variant="secondary">Collections</ThemedText>
      </View>
      <View style={styles.statItem}>
        <ThemedText variant="h2">{user.totalPoints}</ThemedText>
        <ThemedText variant="secondary">Points</ThemedText>
      </View>
      <View style={styles.statItem}>
        <ThemedText variant="h2">{user.co2Offset}kg</ThemedText>
        <ThemedText variant="secondary">CO2 Offset</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginHorizontal: 4,
  },
}); 