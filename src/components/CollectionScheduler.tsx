import { TimeSlot } from '@/types/collections';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HapticTab } from './ui/HapticTab';
import { ThemedText } from './ui/ThemedText';
import { ThemedView } from './ui/ThemedView';

interface Props {
  onSchedule: (slot: TimeSlot, date: Date) => void;
  timeSlots?: TimeSlot[];
}

const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { id: '1', startTime: '09:00', endTime: '12:00', isAvailable: true },
  { id: '2', startTime: '12:00', endTime: '15:00', isAvailable: true },
  { id: '3', startTime: '15:00', endTime: '18:00', isAvailable: true }
];

export default function CollectionScheduler({ 
  onSchedule, 
  timeSlots = DEFAULT_TIME_SLOTS 
}: Props) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }
    onSchedule(selectedSlot, new Date());
    Haptics.selectionAsync();
  };

  const formatTimeSlot = (slot: TimeSlot) => {
    return `${slot.startTime}-${slot.endTime}`;
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Schedule Collection</ThemedText>
      
      <View style={styles.timeSlots}>
        {timeSlots.map((slot) => (
          <HapticTab
            key={slot.id}
            testID={`time-slot-${slot.id}`}
            style={[
              styles.timeSlot,
              selectedSlot?.id === slot.id && styles.selectedTimeSlot
            ]}
            disabled={!slot.isAvailable}
            accessibilityLabel={`Select time slot ${formatTimeSlot(slot)}`}
            accessibilityRole="button"
            onPress={() => {
              setSelectedSlot(slot);
              setError('');
            }}
          >
            <ThemedText style={styles.timeSlotText}>{formatTimeSlot(slot)}</ThemedText>
          </HapticTab>
        ))}
      </View>

      {error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : null}

      <HapticTab
        testID="confirm-collection-button"
        style={styles.confirmButton}
        onPress={handleConfirm}
        accessibilityLabel="Confirm collection schedule"
      >
        <ThemedText style={styles.confirmButtonText}>
          Confirm Collection
        </ThemedText>
      </HapticTab>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timeSlots: {
    flexDirection: 'column',
    gap: 8,
  },
  timeSlot: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedTimeSlot: {
    backgroundColor: '#2e7d32',
  },
  timeSlotText: {
    textAlign: 'center',
  },
  errorText: {
    color: '#d32f2f',
    marginTop: 8,
  },
  confirmButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
