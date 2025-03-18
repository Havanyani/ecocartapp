import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CollectionCard } from '../../../src/components/collection/CollectionCard';
import { Button } from '../../../src/components/ui/Button';
import { ThemedText } from '../../../src/components/ui/ThemedText';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAppSelector } from '../../../src/store';
import { selectUpcomingCollections } from '../../../src/store/slices/collectionSlice';

export default function CollectionsScreen() {
  const { theme } = useTheme();
  const upcomingCollections = useAppSelector(selectUpcomingCollections);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <ThemedText variant="h1">Collections</ThemedText>
        <Link href="../../collections/history" asChild>
          <Button
            variant="outline"
            label="View History"
            icon={<Ionicons name="time-outline" size={20} color={theme.colors.primary} />}
          />
        </Link>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <ThemedText variant="h2">Upcoming Collections</ThemedText>
          {upcomingCollections.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText variant="body">No upcoming collections</ThemedText>
              <Link href="../../collections/schedule" asChild>
                <Button
                  label="Schedule Collection"
                  icon={<Ionicons name="add" size={20} color="#FFFFFF" />}
                  style={styles.scheduleButton}
                />
              </Link>
            </View>
          ) : (
            <>
              {upcomingCollections.map(collection => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
              <Link href="../../collections/schedule" asChild>
                <Button
                  label="Schedule Another Collection"
                  variant="outline"
                  icon={<Ionicons name="add" size={20} color={theme.colors.primary} />}
                  style={styles.scheduleButton}
                />
              </Link>
            </>
          )}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  section: {
    gap: 16,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  scheduleButton: {
    marginTop: 8,
  },
}); 