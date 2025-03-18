import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { TimeSlot } from '@/types/Collection';
import { format } from 'date-fns';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface TimeSlotSelectorProps {
  date: Date;
  onDateChange: (date: Date) => void;
  availableSlots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
}

export function TimeSlotSelector({
  date,
  onDateChange,
  availableSlots,
  selectedSlot,
  onSelectSlot,
}: TimeSlotSelectorProps) {
  const { theme } = useTheme();

  const handleDateSelection = (newDate: Date) => {
    onDateChange(newDate);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.dateContainer}>
        <ThemedText style={styles.dateLabel}>Collection Date</ThemedText>
        <ThemedText style={styles.dateValue}>
          {format(date, 'EEEE, MMMM d, yyyy')}
        </ThemedText>
      </View>

      <ThemedText style={styles.title}>Available Time Slots</ThemedText>
      
      {availableSlots.length === 0 ? (
        <ThemedView style={styles.emptySlots}>
          <ThemedText style={styles.emptyText}>
            No available time slots for this date. Please try another day.
          </ThemedText>
        </ThemedView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {availableSlots.map((slot) => (
            <TouchableOpacity
              key={slot.id}
              onPress={() => onSelectSlot(slot)}
              disabled={!slot.available}
              style={[
                styles.slot,
                {
                  backgroundColor: selectedSlot?.id === slot.id
                    ? '#2e7d32'
                    : slot.available
                    ? '#f5f5f5'
                    : '#e0e0e0',
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.time,
                  {
                    color: selectedSlot?.id === slot.id
                      ? 'white'
                      : '#333333',
                  },
                ]}
              >
                {slot.startTime}
              </ThemedText>
              <ThemedText
                style={[
                  styles.timeSeparator,
                  {
                    color: selectedSlot?.id === slot.id
                      ? 'white'
                      : '#757575',
                  },
                ]}
              >
                to
              </ThemedText>
              <ThemedText
                style={[
                  styles.time,
                  {
                    color: selectedSlot?.id === slot.id
                      ? 'white'
                      : '#333333',
                  },
                ]}
              >
                {slot.endTime}
              </ThemedText>
              {!slot.available && (
                <ThemedText style={styles.unavailable}>
                  Unavailable
                </ThemedText>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  dateContainer: {
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2e7d32',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  slot: {
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 6,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  time: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeSeparator: {
    fontSize: 12,
    fontWeight: '400',
    marginVertical: 4,
  },
  unavailable: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    color: '#F44336',
  },
  emptySlots: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
  }
}); 