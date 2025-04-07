import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useStore } from '@/hooks/useStore';
import { useTheme } from '@/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const CollectionScreen = observer(() => {
  const { collectionStore } = useStore();
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [estimatedWeight, setEstimatedWeight] = useState<number>(0);

  const handleScheduleCollection = async () => {
    if (!selectedDate || estimatedWeight <= 0) return;

    const collection = await collectionStore.scheduleCollection(
      estimatedWeight,
      selectedDate
    );

    if (collection) {
      setSelectedDate(null);
      setEstimatedWeight(0);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.theme.colors.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Schedule Plastic Collection</ThemedText>
      </ThemedView>
      <ThemedView style={styles.scheduleSection}>
        <TouchableOpacity 
          style={[styles.scheduleButton, { backgroundColor: theme.theme.colors.primary }]}
          onPress={handleScheduleCollection}
        >
          <ThemedText style={[styles.buttonText, { color: theme.theme.colors.white }]}>
            Schedule New Pickup
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <ThemedView style={styles.scheduleForm}>
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          onChange={(event, date) => setSelectedDate(date)}
        />
        <TextInput
          style={[styles.weightInput, { borderColor: theme.theme.colors.border }]}
          placeholder="Estimated plastic weight (kg)"
          keyboardType="numeric"
          value={estimatedWeight.toString()}
          onChangeText={text => setEstimatedWeight(Number(text))}
        />
      </ThemedView>
      <ThemedView style={styles.historySection}>
        <ThemedText style={styles.sectionTitle}>Collection History</ThemedText>
        {/* Collection history list will go here */}
      </ThemedView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scheduleSection: {
    padding: 16,
    alignItems: 'center',
  },
  scheduleButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleForm: {
    padding: 16,
    alignItems: 'center',
  },
  weightInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
    borderRadius: 4,
  },
  historySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
}); 