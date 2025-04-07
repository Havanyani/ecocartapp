import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SmartHomeService, { RecyclingAlert, SmartHomeDevice } from '../services/SmartHomeService';

interface FormState {
  id: string;
  title: string;
  message: string;
  deviceId: string;
  triggerType: 'schedule' | 'weight' | 'items' | 'manual';
  triggerValue?: string | number;
  isActive: boolean;
}

export default function RecyclingAlertScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const alertId = params.alertId as string | undefined;
  const isEditMode = !!alertId;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [devices, setDevices] = useState<SmartHomeDevice[]>([]);
  const [formState, setFormState] = useState<FormState>({
    id: '',
    title: '',
    message: '',
    deviceId: '',
    triggerType: 'schedule',
    triggerValue: '0 9 * * 1', // Default to Monday at 9am (cron format)
    isActive: true
  });
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const config = await SmartHomeService.getConfiguration();
      
      // Filter only connected devices that support notifications
      const notificationDevices = config.connectedDevices.filter(
        device => device.connected && device.capabilities.includes('notification')
      );
      
      setDevices(notificationDevices);
      
      // Set default device if available
      if (notificationDevices.length > 0 && !formState.deviceId) {
        setFormState(prev => ({
          ...prev,
          deviceId: config.preferredNotificationDevice || notificationDevices[0].id
        }));
      }
      
      // Load alert data if editing
      if (isEditMode && alertId) {
        const alert = config.recyclingAlerts.find(a => a.id === alertId);
        if (alert) {
          setFormState({
            id: alert.id,
            title: alert.title,
            message: alert.message,
            deviceId: alert.deviceId,
            triggerType: alert.triggerType,
            triggerValue: alert.triggerValue,
            isActive: alert.isActive
          });
        } else {
          Alert.alert('Error', 'Alert not found');
          router.back();
          return;
        }
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate form
    if (!formState.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    
    if (!formState.message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    
    if (!formState.deviceId) {
      Alert.alert('Error', 'Please select a device');
      return;
    }
    
    // Validate triggerValue based on triggerType
    if (formState.triggerType === 'weight' || formState.triggerType === 'items') {
      const numValue = Number(formState.triggerValue);
      if (isNaN(numValue) || numValue <= 0) {
        Alert.alert('Error', `Please enter a valid ${formState.triggerType === 'weight' ? 'weight' : 'item count'}`);
        return;
      }
    } else if (formState.triggerType === 'schedule' && !formState.triggerValue) {
      Alert.alert('Error', 'Please select a schedule');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Create alert object
      const alert: RecyclingAlert = {
        id: isEditMode ? formState.id : `alert_${Date.now()}`,
        title: formState.title.trim(),
        message: formState.message.trim(),
        deviceId: formState.deviceId,
        triggerType: formState.triggerType,
        triggerValue: formState.triggerValue,
        isActive: formState.isActive,
        createdAt: isEditMode ? 
          (await SmartHomeService.getAlertById(formState.id))?.createdAt || new Date().toISOString() : 
          new Date().toISOString()
      };
      
      // Save alert
      let success = false;
      if (isEditMode) {
        success = await SmartHomeService.updateAlert(alert);
      } else {
        success = await SmartHomeService.createAlert(alert);
      }
      
      if (success) {
        router.back();
      } else {
        Alert.alert('Error', 'Failed to save alert. Please try again.');
      }
    } catch (error) {
      console.error('Error saving alert:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderTriggerValueInput = () => {
    switch (formState.triggerType) {
      case 'schedule':
        // Simplified for this implementation - in a real app you'd have a proper schedule picker
        return (
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Choose a schedule:</Text>
            <Picker
              selectedValue={formState.triggerValue}
              style={styles.picker}
              onValueChange={(value) => 
                setFormState(prev => ({ ...prev, triggerValue: value }))
              }
            >
              <Picker.Item label="Monday 9:00 AM" value="0 9 * * 1" />
              <Picker.Item label="Tuesday 9:00 AM" value="0 9 * * 2" />
              <Picker.Item label="Wednesday 9:00 AM" value="0 9 * * 3" />
              <Picker.Item label="Thursday 9:00 AM" value="0 9 * * 4" />
              <Picker.Item label="Friday 9:00 AM" value="0 9 * * 5" />
              <Picker.Item label="Saturday 9:00 AM" value="0 9 * * 6" />
              <Picker.Item label="Sunday 9:00 AM" value="0 9 * * 0" />
              <Picker.Item label="Every day 9:00 AM" value="0 9 * * *" />
              <Picker.Item label="Every day 6:00 PM" value="0 18 * * *" />
            </Picker>
          </View>
        );
      
      case 'weight':
        return (
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Trigger when weight reaches (kg):</Text>
            <TextInput
              style={styles.numberInput}
              value={formState.triggerValue?.toString() || ''}
              onChangeText={(text) => 
                setFormState(prev => ({ ...prev, triggerValue: text }))
              }
              keyboardType="numeric"
              placeholder="Enter weight"
            />
          </View>
        );
      
      case 'items':
        return (
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Trigger when item count reaches:</Text>
            <TextInput
              style={styles.numberInput}
              value={formState.triggerValue?.toString() || ''}
              onChangeText={(text) => 
                setFormState(prev => ({ ...prev, triggerValue: text }))
              }
              keyboardType="numeric"
              placeholder="Enter count"
            />
          </View>
        );
      
      case 'manual':
        return (
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              This alert will be triggered manually from the app.
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#2196F3" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {isEditMode ? 'Edit Alert' : 'Create Alert'}
            </Text>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Form */}
          <View style={styles.form}>
            {/* Title */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                value={formState.title}
                onChangeText={(text) => 
                  setFormState(prev => ({ ...prev, title: text }))
                }
                placeholder="Enter alert title"
              />
            </View>
            
            {/* Message */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formState.message}
                onChangeText={(text) => 
                  setFormState(prev => ({ ...prev, message: text }))
                }
                placeholder="Enter alert message"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            {/* Device */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Device</Text>
              <View style={styles.pickerContainer}>
                {devices.length === 0 ? (
                  <Text style={styles.noDevicesText}>
                    No compatible devices found. Please add devices in the Smart Home screen.
                  </Text>
                ) : (
                  <Picker
                    selectedValue={formState.deviceId}
                    style={styles.picker}
                    onValueChange={(value) => 
                      setFormState(prev => ({ ...prev, deviceId: value }))
                    }
                  >
                    {devices.map(device => (
                      <Picker.Item 
                        key={device.id} 
                        label={device.name} 
                        value={device.id} 
                      />
                    ))}
                  </Picker>
                )}
              </View>
            </View>
            
            {/* Trigger Type */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Trigger Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formState.triggerType}
                  style={styles.picker}
                  onValueChange={(value) => 
                    setFormState(prev => ({ 
                      ...prev, 
                      triggerType: value as 'schedule' | 'weight' | 'items' | 'manual',
                      // Set default value based on type
                      triggerValue: value === 'schedule' ? '0 9 * * 1' : 
                                   (value === 'weight' || value === 'items') ? '10' : undefined
                    }))
                  }
                >
                  <Picker.Item label="Schedule" value="schedule" />
                  <Picker.Item label="Weight Threshold" value="weight" />
                  <Picker.Item label="Item Count" value="items" />
                  <Picker.Item label="Manual Trigger" value="manual" />
                </Picker>
              </View>
            </View>
            
            {/* Trigger Value (conditional based on type) */}
            <View style={styles.inputContainer}>
              {renderTriggerValueInput()}
            </View>
            
            {/* Is Active */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Alert Active</Text>
              <Switch
                value={formState.isActive}
                onValueChange={(value) => 
                  setFormState(prev => ({ ...prev, isActive: value }))
                }
                trackColor={{ false: "#ccc", true: "#81D4FA" }}
                thumbColor={formState.isActive ? "#2196F3" : "#f4f3f4"}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  pickerLabel: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  inputRow: {
    marginBottom: 8,
  },
  numberInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  noteContainer: {
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#827717',
    lineHeight: 20,
  },
  noDevicesText: {
    fontSize: 14,
    color: '#F44336',
    padding: 12,
    textAlign: 'center',
  },
}); 