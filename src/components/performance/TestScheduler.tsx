import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import { TestCase } from '@/types/Performance';
import { PerformanceScheduler } from '@/utils/PerformanceScheduler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface TestSchedulerProps {
  testCases: TestCase[];
}

interface ScheduleModalState {
  visible: boolean;
  testId: string;
  interval: 'hourly' | 'daily' | 'weekly';
  startTime: Date;
  daysOfWeek: number[];
  alertThresholds: {
    metric: keyof TestCase['thresholds'];
    threshold: number;
    condition: '>' | '<' | '=';
  }[];
}

export const TestScheduler: React.FC<TestSchedulerProps> = ({ testCases }) => {
  const theme = useTheme()()();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [modal, setModal] = useState<ScheduleModalState>({
    visible: false,
    testId: '',
    interval: 'daily',
    startTime: new Date(),
    daysOfWeek: [],
    alertThresholds: [],
  });

  useEffect(() => {
    PerformanceScheduler.initialize().catch(console.error);
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      // TODO: Implement loading schedules from PerformanceScheduler
      setSchedules([]);
    } catch (error) {
      console.error('Failed to load schedules:', error);
      Alert.alert('Error', 'Failed to load test schedules');
    }
  };

  const handleCreateSchedule = async () => {
    try {
      const id = await PerformanceScheduler.scheduleTest({
        testId: modal.testId,
        interval: modal.interval,
        startTime: format(modal.startTime, 'HH:mm'),
        daysOfWeek: modal.interval === 'weekly' ? modal.daysOfWeek : undefined,
        alertThreshold: modal.alertThresholds,
      });

      await loadSchedules();
      setModal(prev => ({ ...prev, visible: false }));
    } catch (error) {
      console.error('Failed to create schedule:', error);
      Alert.alert('Error', 'Failed to create test schedule');
    }
  };

  const handleToggleSchedule = async (id: string, enabled: boolean) => {
    try {
      await PerformanceScheduler.toggleSchedule(id, enabled);
      await loadSchedules();
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
      Alert.alert('Error', 'Failed to update test schedule');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await PerformanceScheduler.deleteSchedule(id);
      await loadSchedules();
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      Alert.alert('Error', 'Failed to delete test schedule');
    }
  };

  const renderScheduleList = () => (
    <ScrollView style={styles.scheduleList}>
      {schedules.map(schedule => (
        <View key={schedule.id} style={styles.scheduleItem}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.scheduleName}>
              {testCases.find(t => t.id === schedule.config.testId)?.name || 'Unknown Test'}
            </Text>
            <TouchableOpacity
              style={[styles.toggleButton, schedule.enabled && styles.toggleButtonEnabled]}
              onPress={() => handleToggleSchedule(schedule.id, !schedule.enabled)}
            >
              <Text style={styles.toggleButtonText}>
                {schedule.enabled ? 'Enabled' : 'Disabled'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.scheduleDetails}>
            <Text style={styles.scheduleInterval}>
              {schedule.config.interval.charAt(0).toUpperCase() + schedule.config.interval.slice(1)}
            </Text>
            {schedule.config.startTime && (
              <Text style={styles.scheduleTime}>at {schedule.config.startTime}</Text>
            )}
            {schedule.config.daysOfWeek?.length > 0 && (
              <Text style={styles.scheduleDays}>
                on {schedule.config.daysOfWeek.map(day => 
                  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
                ).join(', ')}
              </Text>
            )}
          </View>

          {schedule.config.alertThreshold?.length > 0 && (
            <View style={styles.alertThresholds}>
              <Text style={styles.alertThresholdsTitle}>Alert Thresholds:</Text>
              {schedule.config.alertThreshold.map((threshold, index) => (
                <Text key={index} style={styles.threshold}>
                  {threshold.metric} {threshold.condition} {threshold.threshold}
                </Text>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteSchedule(schedule.id)}
          >
            <IconSymbol name="trash" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderScheduleModal = () => (
    <Modal
      visible={modal.visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModal(prev => ({ ...prev, visible: false }))}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Schedule Test</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Test</Text>
            <View style={styles.testSelector}>
              {testCases.map(test => (
                <TouchableOpacity
                  key={test.id}
                  style={[
                    styles.testOption,
                    modal.testId === test.id && styles.selectedTest,
                  ]}
                  onPress={() => setModal(prev => ({ ...prev, testId: test.id }))}
                >
                  <Text style={[
                    styles.testOptionText,
                    modal.testId === test.id && styles.selectedTestText,
                  ]}>
                    {test.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Interval</Text>
            <View style={styles.intervalSelector}>
              {(['hourly', 'daily', 'weekly'] as const).map(interval => (
                <TouchableOpacity
                  key={interval}
                  style={[
                    styles.intervalOption,
                    modal.interval === interval && styles.selectedInterval,
                  ]}
                  onPress={() => setModal(prev => ({ ...prev, interval }))}
                >
                  <Text style={[
                    styles.intervalOptionText,
                    modal.interval === interval && styles.selectedIntervalText,
                  ]}>
                    {interval.charAt(0).toUpperCase() + interval.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {modal.interval !== 'hourly' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Start Time</Text>
              <DateTimePicker
                value={modal.startTime}
                mode="time"
                is24Hour={true}
                onChange={(event, date) => {
                  if (date) {
                    setModal(prev => ({ ...prev, startTime: date }));
                  }
                }}
              />
            </View>
          )}

          {modal.interval === 'weekly' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Days of Week</Text>
              <View style={styles.daysSelector}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayOption,
                      modal.daysOfWeek.includes(index) && styles.selectedDay,
                    ]}
                    onPress={() => {
                      setModal(prev => ({
                        ...prev,
                        daysOfWeek: prev.daysOfWeek.includes(index)
                          ? prev.daysOfWeek.filter(d => d !== index)
                          : [...prev.daysOfWeek, index],
                      }));
                    }}
                  >
                    <Text style={[
                      styles.dayOptionText,
                      modal.daysOfWeek.includes(index) && styles.selectedDayText,
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Alert Thresholds</Text>
            {modal.alertThresholds.map((threshold, index) => (
              <View key={index} style={styles.thresholdInput}>
                <View style={styles.thresholdMetric}>
                  <Text style={styles.thresholdLabel}>Metric</Text>
                  <View style={styles.metricSelector}>
                    {Object.keys(testCases[0].thresholds).map(metric => (
                      <TouchableOpacity
                        key={metric}
                        style={[
                          styles.metricOption,
                          threshold.metric === metric && styles.selectedMetric,
                        ]}
                        onPress={() => {
                          const newThresholds = [...modal.alertThresholds];
                          newThresholds[index].metric = metric as keyof TestCase['thresholds'];
                          setModal(prev => ({ ...prev, alertThresholds: newThresholds }));
                        }}
                      >
                        <Text style={[
                          styles.metricOptionText,
                          threshold.metric === metric && styles.selectedMetricText,
                        ]}>
                          {metric}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.thresholdCondition}>
                  <Text style={styles.thresholdLabel}>Condition</Text>
                  <View style={styles.conditionSelector}>
                    {(['>', '<', '='] as const).map(condition => (
                      <TouchableOpacity
                        key={condition}
                        style={[
                          styles.conditionOption,
                          threshold.condition === condition && styles.selectedCondition,
                        ]}
                        onPress={() => {
                          const newThresholds = [...modal.alertThresholds];
                          newThresholds[index].condition = condition;
                          setModal(prev => ({ ...prev, alertThresholds: newThresholds }));
                        }}
                      >
                        <Text style={[
                          styles.conditionOptionText,
                          threshold.condition === condition && styles.selectedConditionText,
                        ]}>
                          {condition}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.thresholdValue}>
                  <Text style={styles.thresholdLabel}>Value</Text>
                  <TextInput
                    style={styles.valueInput}
                    keyboardType="numeric"
                    value={threshold.threshold.toString()}
                    onChangeText={(text) => {
                      const newThresholds = [...modal.alertThresholds];
                      newThresholds[index].threshold = parseFloat(text) || 0;
                      setModal(prev => ({ ...prev, alertThresholds: newThresholds }));
                    }}
                  />
                </View>

                <TouchableOpacity
                  style={styles.removeThreshold}
                  onPress={() => {
                    const newThresholds = [...modal.alertThresholds];
                    newThresholds.splice(index, 1);
                    setModal(prev => ({ ...prev, alertThresholds: newThresholds }));
                  }}
                >
                  <IconSymbol name="minus-circle" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addThreshold}
              onPress={() => {
                setModal(prev => ({
                  ...prev,
                  alertThresholds: [
                    ...prev.alertThresholds,
                    {
                      metric: Object.keys(testCases[0].thresholds)[0] as keyof TestCase['thresholds'],
                      threshold: 0,
                      condition: '>',
                    },
                  ],
                }));
              }}
            >
              <IconSymbol name="plus" size={20} color={theme.colors.primary} />
              <Text style={styles.addThresholdText}>Add Threshold</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModal(prev => ({ ...prev, visible: false }))}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.createButton]}
              onPress={handleCreateSchedule}
            >
              <Text style={[styles.modalButtonText, styles.createButtonText]}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Test Schedules</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModal(prev => ({ ...prev, visible: true }))}
        >
          <IconSymbol name="plus" size={20} color={theme.colors.primary} />
          <Text style={styles.addButtonText}>New Schedule</Text>
        </TouchableOpacity>
      </View>

      {renderScheduleList()}
      {renderScheduleModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  addButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  scheduleList: {
    flex: 1,
  },
  scheduleItem: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleName: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  toggleButtonEnabled: {
    backgroundColor: '#34C759',
  },
  toggleButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  scheduleDetails: {
    marginBottom: 8,
  },
  scheduleInterval: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.6)',
  },
  scheduleTime: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.6)',
  },
  scheduleDays: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.6)',
  },
  alertThresholds: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
  },
  alertThresholdsTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  threshold: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  testSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  testOption: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  selectedTest: {
    backgroundColor: '#007AFF',
  },
  testOptionText: {
    fontSize: 14,
  },
  selectedTestText: {
    color: '#FFFFFF',
  },
  intervalSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  intervalOption: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  selectedInterval: {
    backgroundColor: '#007AFF',
  },
  intervalOptionText: {
    fontSize: 14,
  },
  selectedIntervalText: {
    color: '#FFFFFF',
  },
  daysSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  dayOption: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: '#007AFF',
  },
  dayOptionText: {
    fontSize: 14,
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  thresholdInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  thresholdMetric: {
    flex: 2,
  },
  thresholdLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  metricOption: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  selectedMetric: {
    backgroundColor: '#007AFF',
  },
  metricOptionText: {
    fontSize: 12,
  },
  selectedMetricText: {
    color: '#FFFFFF',
  },
  thresholdCondition: {
    flex: 1,
  },
  conditionSelector: {
    flexDirection: 'row',
    gap: 4,
  },
  conditionOption: {
    flex: 1,
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  selectedCondition: {
    backgroundColor: '#007AFF',
  },
  conditionOptionText: {
    fontSize: 12,
  },
  selectedConditionText: {
    color: '#FFFFFF',
  },
  thresholdValue: {
    flex: 1,
  },
  valueInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    padding: 4,
    fontSize: 12,
  },
  removeThreshold: {
    padding: 4,
  },
  addThreshold: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  addThresholdText: {
    fontSize: 14,
    color: '#007AFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  createButtonText: {
    color: '#FFFFFF',
  },
}); 