import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CollectionCard } from '../../../src/components/collection/CollectionCard';
import { ThemedText } from '../../../src/components/ui/ThemedText';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAppSelector } from '../../../src/store';
import { selectCompletedCollections } from '../../../src/store/slices/collectionSlice';

export default function CollectionHistoryScreen() {
  const { theme } = useTheme();
  const completedCollections = useAppSelector(selectCompletedCollections);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <ThemedText variant="h1">Collection History</ThemedText>
        <ThemedText variant="body">View your completed collections</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {completedCollections.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText variant="body">No completed collections yet</ThemedText>
          </View>
        ) : (
          completedCollections.map(collection => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              showStatus={false}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
}); 