/**
 * RecurrencePatternSelector.tsx
 * 
 * A component that allows users to select a recurrence pattern for
 * scheduling recurring collection appointments.
 */

import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/theme';
import { RecurrenceFrequency, RecurrencePattern } from '@/services/SchedulingService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDays, addMonths, format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface RecurrencePatternSelectorProps {
  initialPattern?: RecurrencePattern;
  onChange: (pattern: RecurrencePattern) => void;
  onCancel?: () => void;
}

export function RecurrencePatternSelector({
  initialPattern,
  onChange,
  onCancel,
}: RecurrencePatternSelectorProps) {
  const theme = useTheme()()()()();
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(
    initialPattern?.frequency || RecurrenceFrequency.WEEKLY
  );
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>(
    initialPattern?.dayOfWeek || [new Date().getDay()]
  );
  const [selectedDaysOfMonth, setSelectedDaysOfMonth] = useState<number[]>(
    initialPattern?.dayOfMonth || [new Date().getDate()]
  );
  const [endType, setEndType] = useState<'date' | 'occurrences'>(
    initialPattern?.endDate ? 'date' : 'occurrences'
  );
  const [endDate, setEndDate] = useState<Date>(
    initialPattern?.endDate ? new Date(initialPattern.endDate) : addMonths(new Date(), 3)
  );
  const [occurrences, setOccurrences] = useState<number>(
    initialPattern?.occurrences || 10
  );
  const [interval, setInterval] = useState<number>(
    initialPattern?.interval || 1
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Days of the week labels
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Update the pattern when any value changes
  useEffect(() => {
    const pattern: RecurrencePattern = {
      frequency,
      ...(frequency === RecurrenceFrequency.WEEKLY && { dayOfWeek: selectedDaysOfWeek }),
      ...(frequency === RecurrenceFrequency.BI_WEEKLY && { dayOfWeek: selectedDaysOfWeek }),
      ...(frequency === RecurrenceFrequency.MONTHLY && { dayOfMonth: selectedDaysOfMonth }),
      ...(frequency === RecurrenceFrequency.CUSTOM && { interval }),
      ...(endType === 'date' && { endDate: endDate.toISOString() }),
      ...(endType === 'occurrences' && { occurrences }),
    };
    onChange(pattern);
  }, [
    frequency,
    selectedDaysOfWeek,
    selectedDaysOfMonth,
    endType,
    endDate,
    occurrences,
    interval,
  ]);

  // Toggle a day of the week
  const toggleDayOfWeek = (day: number) => {
    if (selectedDaysOfWeek.includes(day)) {
      // Don't allow removing all days
      if (selectedDaysOfWeek.length > 1) {
        setSelectedDaysOfWeek(selectedDaysOfWeek.filter((d) => d !== day));
      }
    } else {
      setSelectedDaysOfWeek([...selectedDaysOfWeek, day]);
    }
  };

  // Toggle a day of the month
  const toggleDayOfMonth = (day: number) => {
    if (selectedDaysOfMonth.includes(day)) {
      // Don't allow removing all days
      if (selectedDaysOfMonth.length > 1) {
        setSelectedDaysOfMonth(selectedDaysOfMonth.filter((d) => d !== day));
      }
    } else {
      setSelectedDaysOfMonth([...selectedDaysOfMonth, day]);
    }
  };

  // Generate next few occurrences preview
  const getOccurrencesPreview = () => {
    const today = new Date();
    const dates: Date[] = [];
    const maxToShow = 3;

    switch (frequency) {
      case RecurrenceFrequency.WEEKLY:
        for (let day of selectedDaysOfWeek) {
          let date = new Date(today);
          date.setDate(date.getDate() + ((day - today.getDay() + 7) % 7));
          if (date <= today) {
            date.setDate(date.getDate() + 7);
          }
          dates.push(date);
        }
        dates.sort((a, b) => a.getTime() - b.getTime());
        break;

      case RecurrenceFrequency.BI_WEEKLY:
        for (let day of selectedDaysOfWeek) {
          let date = new Date(today);
          date.setDate(date.getDate() + ((day - today.getDay() + 7) % 7));
          if (date <= today) {
            date.setDate(date.getDate() + 7);
          }
          dates.push(date);
          
          // Add next bi-weekly occurrence
          let nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 14);
          dates.push(nextDate);
        }
        dates.sort((a, b) => a.getTime() - b.getTime());
        break;

      case RecurrenceFrequency.MONTHLY:
        for (let day of selectedDaysOfMonth) {
          let date = new Date(today.getFullYear(), today.getMonth(), day);
          if (date <= today) {
            date = new Date(today.getFullYear(), today.getMonth() + 1, day);
          }
          dates.push(date);
          
          // Add next monthly occurrence
          let nextDate = new Date(date);
          nextDate.setMonth(nextDate.getMonth() + 1);
          dates.push(nextDate);
        }
        dates.sort((a, b) => a.getTime() - b.getTime());
        break;

      case RecurrenceFrequency.CUSTOM:
        // For custom frequency, we'll just add the interval in days
        let date = new Date(today);
        for (let i = 0; i < maxToShow; i++) {
          date = addDays(date, 7 * interval);
          dates.push(new Date(date));
        }
        break;
    }

    return dates.slice(0, maxToShow);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Set Collection Schedule</ThemedText>
      
      {/* Frequency selection */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Repeats</ThemedText>
        
        <View style={styles.options}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              frequency === RecurrenceFrequency.WEEKLY && styles.selectedOption,
            ]}
            onPress={() => setFrequency(RecurrenceFrequency.WEEKLY)}
          >
            <ThemedText
              style={[
                styles.optionText,
                frequency === RecurrenceFrequency.WEEKLY && styles.selectedOptionText,
              ]}
            >
              Weekly
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionButton,
              frequency === RecurrenceFrequency.BI_WEEKLY && styles.selectedOption,
            ]}
            onPress={() => setFrequency(RecurrenceFrequency.BI_WEEKLY)}
          >
            <ThemedText
              style={[
                styles.optionText,
                frequency === RecurrenceFrequency.BI_WEEKLY && styles.selectedOptionText,
              ]}
            >
              Bi-Weekly
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionButton,
              frequency === RecurrenceFrequency.MONTHLY && styles.selectedOption,
            ]}
            onPress={() => setFrequency(RecurrenceFrequency.MONTHLY)}
          >
            <ThemedText
              style={[
                styles.optionText,
                frequency === RecurrenceFrequency.MONTHLY && styles.selectedOptionText,
              ]}
            >
              Monthly
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionButton,
              frequency === RecurrenceFrequency.CUSTOM && styles.selectedOption,
            ]}
            onPress={() => setFrequency(RecurrenceFrequency.CUSTOM)}
          >
            <ThemedText
              style={[
                styles.optionText,
                frequency === RecurrenceFrequency.CUSTOM && styles.selectedOptionText,
              ]}
            >
              Custom
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
      
      {/* Days selection based on frequency */}
      {(frequency === RecurrenceFrequency.WEEKLY || frequency === RecurrenceFrequency.BI_WEEKLY) && (
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {frequency === RecurrenceFrequency.WEEKLY ? 'Repeats On' : 'Repeats Every Other Week On'}
          </ThemedText>
          
          <View style={styles.daysContainer}>
            {daysOfWeek.map((day, index) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  selectedDaysOfWeek.includes(index) && styles.selectedDayButton,
                ]}
                onPress={() => toggleDayOfWeek(index)}
              >
                <ThemedText
                  style={[
                    styles.dayText,
                    selectedDaysOfWeek.includes(index) && styles.selectedDayText,
                  ]}
                >
                  {day}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>
      )}
      
      {/* Monthly day selection */}
      {frequency === RecurrenceFrequency.MONTHLY && (
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Repeats On Day</ThemedText>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysOfMonthScroll}>
            <View style={styles.daysOfMonthContainer}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayOfMonthButton,
                    selectedDaysOfMonth.includes(day) && styles.selectedDayButton,
                  ]}
                  onPress={() => toggleDayOfMonth(day)}
                >
                  <ThemedText
                    style={[
                      styles.dayOfMonthText,
                      selectedDaysOfMonth.includes(day) && styles.selectedDayText,
                    ]}
                  >
                    {day}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </ThemedView>
      )}
      
      {/* Custom interval */}
      {frequency === RecurrenceFrequency.CUSTOM && (
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Repeat Every</ThemedText>
          
          <View style={styles.intervalContainer}>
            <TouchableOpacity
              style={styles.intervalButton}
              onPress={() => setInterval(Math.max(1, interval - 1))}
            >
              <IconSymbol name="minus" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            
            <ThemedText style={styles.intervalText}>
              {interval} {interval === 1 ? 'Week' : 'Weeks'}
            </ThemedText>
            
            <TouchableOpacity
              style={styles.intervalButton}
              onPress={() => setInterval(interval + 1)}
            >
              <IconSymbol name="plus" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </ThemedView>
      )}
      
      {/* End selection */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Ends</ThemedText>
        
        <View style={styles.endOptions}>
          <TouchableOpacity
            style={styles.endOptionRow}
            onPress={() => setEndType('occurrences')}
          >
            <View style={styles.radioButton}>
              {endType === 'occurrences' && <View style={styles.radioButtonInner} />}
            </View>
            <ThemedText style={styles.endOptionText}>After</ThemedText>
            
            <View style={styles.occurrencesContainer}>
              <TouchableOpacity
                style={styles.occurrenceButton}
                onPress={() => setOccurrences(Math.max(1, occurrences - 1))}
              >
                <IconSymbol name="minus" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
              
              <ThemedText style={styles.occurrencesText}>
                {occurrences} {occurrences === 1 ? 'occurrence' : 'occurrences'}
              </ThemedText>
              
              <TouchableOpacity
                style={styles.occurrenceButton}
                onPress={() => setOccurrences(occurrences + 1)}
              >
                <IconSymbol name="plus" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.endOptionRow}
            onPress={() => setEndType('date')}
          >
            <View style={styles.radioButton}>
              {endType === 'date' && <View style={styles.radioButtonInner} />}
            </View>
            <ThemedText style={styles.endOptionText}>On date</ThemedText>
            
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText style={styles.dateButtonText}>
                {format(endDate, 'MMM d, yyyy')}
              </ThemedText>
              <IconSymbol name="calendar" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
        
        {showDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setEndDate(selectedDate);
              }
            }}
            minimumDate={new Date()}
          />
        )}
      </ThemedView>
      
      {/* Preview upcoming dates */}
      <ThemedView style={styles.previewSection}>
        <ThemedText style={styles.previewTitle}>Upcoming Dates</ThemedText>
        
        <View style={styles.previewDates}>
          {getOccurrencesPreview().map((date, index) => (
            <ThemedView key={index} style={styles.previewDateItem}>
              <IconSymbol name="calendar-check" size={16} color={theme.colors.primary} />
              <ThemedText style={styles.previewDateText}>
                {format(date, 'EEEE, MMMM d, yyyy')}
              </ThemedText>
            </ThemedView>
          ))}
        </View>
      </ThemedView>
      
      {/* Buttons */}
      {onCancel && (
        <View style={styles.buttonContainer}>
          <Button
            variant="outline"
            onPress={onCancel}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          
          <Button
            onPress={() => {
              const pattern: RecurrencePattern = {
                frequency,
                ...(frequency === RecurrenceFrequency.WEEKLY && { dayOfWeek: selectedDaysOfWeek }),
                ...(frequency === RecurrenceFrequency.BI_WEEKLY && { dayOfWeek: selectedDaysOfWeek }),
                ...(frequency === RecurrenceFrequency.MONTHLY && { dayOfMonth: selectedDaysOfMonth }),
                ...(frequency === RecurrenceFrequency.CUSTOM && { interval }),
                ...(endType === 'date' && { endDate: endDate.toISOString() }),
                ...(endType === 'occurrences' && { occurrences }),
              };
              onChange(pattern);
            }}
            style={styles.applyButton}
          >
            Apply
          </Button>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  selectedDayButton: {
    backgroundColor: '#007AFF',
  },
  dayText: {
    fontSize: 14,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  daysOfMonthScroll: {
    maxHeight: 120,
  },
  daysOfMonthContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 8,
  },
  dayOfMonthButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  dayOfMonthText: {
    fontSize: 14,
  },
  intervalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intervalButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  intervalText: {
    fontSize: 16,
    marginHorizontal: 16,
  },
  endOptions: {
    marginTop: 8,
  },
  endOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  endOptionText: {
    marginRight: 12,
  },
  occurrencesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  occurrenceButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  occurrencesText: {
    marginHorizontal: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  dateButtonText: {
    marginRight: 8,
  },
  previewSection: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewDates: {},
  previewDateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewDateText: {
    marginLeft: 8,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelButton: {
    marginRight: 12,
  },
  applyButton: {
    minWidth: 100,
  },
}); 