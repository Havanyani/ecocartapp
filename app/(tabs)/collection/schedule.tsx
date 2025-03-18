/**
 * app/(tabs)/collection/schedule.tsx
 * 
 * Screen for scheduling a new collection.
 */

import { CollectionSchedulingForm } from '@/components/collection/CollectionSchedulingForm';
import { ThemedView } from '@/components/ui/ThemedView';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScheduleCollectionScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const handleSuccess = () => {
    // Navigate to the collection page after successful scheduling
    router.push('/collection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ThemedView style={styles.content}>
        <CollectionSchedulingForm onSuccess={handleSuccess} />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
}); 