import { HapticTab } from '@/components/ui/HapticTab';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { TimeSlot } from '@/types/Collection';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface Props {
  onSchedule: (slot: TimeSlot) => Promise<void>;
  timeSlots?: TimeSlot[];
  isLoading?: boolean;
  error?: string;
}

const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { 
    id: '1', 
    date: new Date(), 
    startTime: '09:00', 
    endTime: '12:00', 
    available: true,
    maxCollections: 5,
    currentCollections: 0
  },
  { 
    id: '2', 
    date: new Date(), 
    startTime: '12:00', 
    endTime: '15:00', 
    available: true,
    maxCollections: 5,
    currentCollections: 0
  },
  { 
    id: '3', 
    date: new Date(), 
    startTime: '15:00', 
    endTime: '18:00', 
    available: true,
    maxCollections: 5,
    currentCollections: 0
  }
];

export default function CollectionScheduler({ 
  onSchedule, 
  timeSlots = DEFAULT_TIME_SLOTS,
  isLoading = false,
  error: externalError
}: Props) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setSelectedSlot(null);
      setError('');
    }
  };

  const handleConfirm = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    try {
      await onSchedule(selectedSlot);
      Haptics.selectionAsync();
      setError('');
    } catch (err) {
      setError('Failed to schedule collection. Please try again.');
    }
  };

  const filteredTimeSlots = timeSlots.filter(slot => 
    format(slot.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Schedule Collection</ThemedText>
      
      <HapticTab
        testID="date-selector"
        style={styles.dateSelector}
        onPress={() => setShowDatePicker(true)}
        accessibilityLabel="Select collection date"
        accessibilityRole="button"
      >
        <ThemedText style={styles.dateText}>
          {format(selectedDate, 'MMMM d, yyyy')}
        </ThemedText>
      </HapticTab>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      <View style={styles.timeSlots}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#2e7d32" />
        ) : filteredTimeSlots.length > 0 ? (
          filteredTimeSlots.map((slot) => (
            <HapticTab
              key={slot.id}
              testID={`time-slot-${slot.id}`}
              style={[
                styles.timeSlot,
                selectedSlot?.id === slot.id && styles.selectedTimeSlot,
                !slot.available && styles.unavailableSlot
              ]}
              disabled={!slot.available}
              accessibilityLabel={`Select time slot ${slot.startTime}-${slot.endTime}`}
              accessibilityRole="button"
              accessibilityState={{ 
                disabled: !slot.available,
                selected: selectedSlot?.id === slot.id 
              }}
              onPress={() => {
                setSelectedSlot(slot);
                setError('');
              }}
            >
              <ThemedText style={styles.timeSlotText}>
                {slot.startTime}-{slot.endTime}
              </ThemedText>
              <ThemedText style={styles.slotAvailability}>
                {slot.currentCollections}/{slot.maxCollections} collections
              </ThemedText>
            </HapticTab>
          ))
        ) : (
          <ThemedText style={styles.noSlotsText}>
            No available time slots for this date
          </ThemedText>
        )}
      </View>

      {error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : null}

      <HapticTab
        testID="confirm-collection-button"
        style={[
          styles.confirmButton,
          (!selectedSlot || isLoading) && styles.disabledButton
        ]}
        onPress={handleConfirm}
        disabled={!selectedSlot || isLoading}
        accessibilityLabel="Confirm collection schedule"
        accessibilityRole="button"
        accessibilityState={{ disabled: !selectedSlot || isLoading }}
      >
        <ThemedText style={styles.confirmButtonText}>
          {isLoading ? 'Scheduling...' : 'Confirm Collection'}
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
  dateSelector: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
  },
  dateText: {
    textAlign: 'center',
    fontSize: 16,
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
  unavailableSlot: {
    opacity: 0.5,
  },
  timeSlotText: {
    textAlign: 'center',
    fontSize: 16,
  },
  slotAvailability: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },
  noSlotsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorText: {
    color: '#d32f2f',
    marginTop: 8,
    textAlign: 'center',
  },
  confirmButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 