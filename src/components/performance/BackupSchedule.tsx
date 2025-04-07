import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import { BackupSchedule as BackupScheduleType, backupScheduler } from '@/utils/BackupScheduler';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export const BackupSchedule: React.FC = () => {
  const theme = useTheme()()();
  const [schedule, setSchedule] = useState<BackupScheduleType>({
    enabled: false,
    frequency: 'daily',
    time: '00:00',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setIsLoading(true);
      const currentSchedule = backupScheduler.getSchedule();
      setSchedule(currentSchedule);
    } catch (error) {
      console.error('Error loading schedule:', error);
      Alert.alert('Error', 'Failed to load backup schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSchedule = async () => {
    try {
      setIsLoading(true);
      const newSchedule = { ...schedule, enabled: !schedule.enabled };
      await backupScheduler.setSchedule(newSchedule);
      setSchedule(newSchedule);
    } catch (error) {
      console.error('Error toggling schedule:', error);
      Alert.alert('Error', 'Failed to update backup schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFrequencyChange = async (frequency: BackupScheduleType['frequency']) => {
    try {
      setIsLoading(true);
      const newSchedule = { ...schedule, frequency };
      await backupScheduler.setSchedule(newSchedule);
      setSchedule(newSchedule);
    } catch (error) {
      console.error('Error changing frequency:', error);
      Alert.alert('Error', 'Failed to update backup frequency');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeChange = async (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      try {
        setIsLoading(true);
        const time = selectedTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        const newSchedule = { ...schedule, time };
        await backupScheduler.setSchedule(newSchedule);
        setSchedule(newSchedule);
      } catch (error) {
        console.error('Error changing time:', error);
        Alert.alert('Error', 'Failed to update backup time');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatLastBackup = (timestamp?: number): string => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Backup Schedule</Text>
        <Switch
          value={schedule.enabled}
          onValueChange={handleToggleSchedule}
          trackColor={{ false: '#767577', true: theme.colors.primary }}
          thumbColor={schedule.enabled ? '#FFFFFF' : '#f4f3f4'}
        />
      </View>

      {schedule.enabled && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequency</Text>
            <View style={styles.frequencyButtons}>
              {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.frequencyButton,
                    schedule.frequency === freq && styles.selectedFrequency,
                  ]}
                  onPress={() => handleFrequencyChange(freq)}
                >
                  <Text
                    style={[
                      styles.frequencyButtonText,
                      schedule.frequency === freq && styles.selectedFrequencyText,
                    ]}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <IconSymbol name="clock-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.timeButtonText}>{schedule.time}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last Backup</Text>
            <Text style={styles.lastBackupText}>
              {formatLastBackup(schedule.lastBackup)}
            </Text>
          </View>
        </>
      )}

      {showTimePicker && (
        <DateTimePicker
          value={new Date(`2000-01-01T${schedule.time}`)}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: 'rgba(0,0,0,0.5)',
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  selectedFrequency: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedFrequencyText: {
    color: '#007AFF',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    gap: 8,
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  lastBackupText: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.5)',
  },
}); 