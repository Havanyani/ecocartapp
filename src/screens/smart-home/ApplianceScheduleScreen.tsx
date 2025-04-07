import { ErrorView } from '@/components/ErrorView';
import { LoadingView } from '@/components/LoadingView';
import { useTheme } from '@/hooks/useTheme';
import { SmartHomeStackParamList } from '@/navigation/types';
import { SmartHomeService } from '@/services/smart-home/SmartHomeService';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ApplianceScheduleScreenProps = {
  route: RouteProp<SmartHomeStackParamList, 'ApplianceSchedule'>;
  navigation: StackNavigationProp<SmartHomeStackParamList, 'ApplianceSchedule'>;
};

interface ScheduleItem {
  id: string;
  time: Date;
  days: string[];
  action: 'on' | 'off' | 'eco';
  enabled: boolean;
}

export default function ApplianceScheduleScreen({ route, navigation }: ApplianceScheduleScreenProps) {
  const { deviceId } = route.params;
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [device, setDevice] = useState<any>(null);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [currentSchedule, setCurrentSchedule] = useState<ScheduleItem | null>(null);
  const [timePickerMode, setTimePickerMode] = useState<'add' | 'edit'>('add');
  
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  useEffect(() => {
    loadDeviceAndSchedules();
  }, [deviceId]);
  
  const loadDeviceAndSchedules = async () => {
    try {
      setIsLoading(true);
      const smartHomeService = SmartHomeService.getInstance();
      const deviceData = await smartHomeService.getDeviceById(deviceId);
      
      if (!deviceData) {
        throw new Error('Device not found');
      }
      
      setDevice(deviceData);
      
      // Load schedules for this device
      const deviceSchedules = await smartHomeService.getDeviceSchedules(deviceId);
      setSchedules(deviceSchedules);
      
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load device schedule');
      setIsLoading(false);
    }
  };
  
  const handleAddSchedule = () => {
    const newSchedule: ScheduleItem = {
      id: `schedule_${Date.now()}`,
      time: new Date(),
      days: ['Mon', 'Wed', 'Fri'],
      action: 'on',
      enabled: true
    };
    
    setCurrentSchedule(newSchedule);
    setTimePickerMode('add');
    setShowTimePicker(true);
  };
  
  const handleEditSchedule = (schedule: ScheduleItem) => {
    setCurrentSchedule(schedule);
    setTimePickerMode('edit');
    setShowTimePicker(true);
  };
  
  const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    setShowTimePicker(false);
    
    if (!selectedTime || !currentSchedule) return;
    
    const updatedSchedule = { ...currentSchedule, time: selectedTime };
    
    if (timePickerMode === 'add') {
      // Navigate to detail screen for adding more schedule information
      navigation.navigate('CreateAutomation', {
        scheduleData: updatedSchedule,
        deviceId: deviceId,
        mode: 'schedule'
      });
    } else {
      // Update existing schedule
      saveScheduleChanges(updatedSchedule);
    }
  };
  
  const saveScheduleChanges = async (updatedSchedule: ScheduleItem) => {
    try {
      setIsLoading(true);
      const smartHomeService = SmartHomeService.getInstance();
      
      // Save updated schedule
      await smartHomeService.updateDeviceSchedule(deviceId, updatedSchedule);
      
      // Refresh schedules
      const deviceSchedules = await smartHomeService.getDeviceSchedules(deviceId);
      setSchedules(deviceSchedules);
      
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update schedule');
      setIsLoading(false);
    }
  };
  
  const toggleScheduleEnabled = async (scheduleId: string, currentlyEnabled: boolean) => {
    try {
      const updatedSchedules = schedules.map(schedule => {
        if (schedule.id === scheduleId) {
          return { ...schedule, enabled: !currentlyEnabled };
        }
        return schedule;
      });
      
      setSchedules(updatedSchedules);
      
      const smartHomeService = SmartHomeService.getInstance();
      await smartHomeService.updateDeviceScheduleStatus(
        deviceId, 
        scheduleId, 
        !currentlyEnabled
      );
    } catch (err) {
      // Revert the change on error
      setSchedules(prevSchedules => [...prevSchedules]);
      Alert.alert('Error', 'Failed to update schedule status');
    }
  };
  
  const deleteSchedule = (scheduleId: string) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const smartHomeService = SmartHomeService.getInstance();
              await smartHomeService.deleteDeviceSchedule(deviceId, scheduleId);
              
              // Update local state
              setSchedules(schedules.filter(s => s.id !== scheduleId));
              setIsLoading(false);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to delete schedule');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };
  
  if (isLoading) {
    return <LoadingView message="Loading schedules..." />;
  }
  
  if (error) {
    return <ErrorView message={error} onRetry={loadDeviceAndSchedules} />;
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {device?.name} Schedules
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
          Manage when your device turns on and off
        </Text>
      </View>
      
      <ScrollView style={styles.schedulesContainer}>
        {schedules.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={theme.colors.secondaryText} />
            <Text style={[styles.emptyStateText, { color: theme.colors.secondaryText }]}>
              No schedules yet
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.colors.secondaryText }]}>
              Tap the + button to create a schedule
            </Text>
          </View>
        ) : (
          schedules.map(schedule => (
            <View 
              key={schedule.id} 
              style={[
                styles.scheduleItem, 
                { 
                  backgroundColor: theme.colors.card,
                  opacity: schedule.enabled ? 1 : 0.6
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.scheduleItemContent}
                onPress={() => handleEditSchedule(schedule)}
              >
                <View style={styles.scheduleTime}>
                  <Text style={[styles.timeText, { color: theme.colors.text }]}>
                    {schedule.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text style={[styles.actionText, { color: theme.colors.primary }]}>
                    {schedule.action.toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.scheduleDays}>
                  {daysOfWeek.map(day => (
                    <View 
                      key={day}
                      style={[
                        styles.dayBubble,
                        schedule.days.includes(day) 
                          ? { backgroundColor: theme.colors.primary } 
                          : { backgroundColor: theme.colors.border }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.dayText, 
                          { 
                            color: schedule.days.includes(day) 
                              ? theme.colors.white 
                              : theme.colors.secondaryText 
                          }
                        ]}
                      >
                        {day[0]}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
              
              <View style={styles.scheduleActions}>
                <TouchableOpacity
                  onPress={() => toggleScheduleEnabled(schedule.id, schedule.enabled)}
                  style={styles.toggleButton}
                >
                  <Ionicons 
                    name={schedule.enabled ? "checkmark-circle" : "ellipse-outline"} 
                    size={24} 
                    color={schedule.enabled ? theme.colors.success : theme.colors.border} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => deleteSchedule(schedule.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddSchedule}
      >
        <Ionicons name="add" size={24} color={theme.colors.white} />
      </TouchableOpacity>
      
      {showTimePicker && currentSchedule && (
        <DateTimePicker
          value={currentSchedule.time}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  schedulesContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  scheduleItem: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  scheduleItemContent: {
    flex: 1,
    padding: 16,
  },
  scheduleTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleDays: {
    flexDirection: 'row',
    marginTop: 8,
  },
  dayBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  dayText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  scheduleActions: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 8,
    alignItems: 'center',
  },
  toggleButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
}); 