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
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type CreateAutomationScreenProps = {
  route: RouteProp<SmartHomeStackParamList, 'CreateAutomation'>;
  navigation: StackNavigationProp<SmartHomeStackParamList, 'CreateAutomation'>;
};

export default function CreateAutomationScreen({ route, navigation }: CreateAutomationScreenProps) {
  const { mode, ruleId, scheduleData, deviceId } = route.params || {};
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState<string>('');
  const [triggerType, setTriggerType] = useState<'time' | 'event' | 'condition'>('time');
  const [triggerSource, setTriggerSource] = useState<string>('');
  const [triggerValue, setTriggerValue] = useState<any>('');
  const [actions, setActions] = useState<Array<any>>([]);
  const [conditions, setConditions] = useState<Array<any>>([]);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  
  // UI state
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [availableDevices, setAvailableDevices] = useState<Array<any>>([]);
  const [availableTriggers, setAvailableTriggers] = useState<Array<any>>([]);
  const [step, setStep] = useState<number>(1);
  
  useEffect(() => {
    if (mode === 'edit' && ruleId) {
      loadExistingRule();
    } else if (scheduleData) {
      initializeFromScheduleData();
    } else {
      initializeNewRule();
    }
  }, [mode, ruleId, scheduleData]);
  
  const loadExistingRule = async () => {
    try {
      setIsLoading(true);
      const smartHomeService = SmartHomeService.getInstance();
      
      // Load the rule data
      const rule = await smartHomeService.getAutomationRuleById(ruleId);
      if (!rule) {
        throw new Error('Rule not found');
      }
      
      // Set form state from rule
      setName(rule.name);
      setTriggerType(rule.trigger.type);
      setTriggerSource(rule.trigger.source);
      setTriggerValue(rule.trigger.value);
      setActions(rule.actions);
      setConditions(rule.conditions || []);
      setIsEnabled(rule.enabled);
      
      // Load available devices for selection
      const devices = await smartHomeService.getDevices();
      setAvailableDevices(devices);
      
      // Load available triggers
      const triggers = await smartHomeService.getAvailableTriggers();
      setAvailableTriggers(triggers);
      
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load automation rule');
      setIsLoading(false);
    }
  };
  
  const initializeFromScheduleData = async () => {
    try {
      setIsLoading(true);
      const smartHomeService = SmartHomeService.getInstance();
      
      // Set initial values from schedule data
      setName(`Schedule for ${deviceId ? 'device' : 'new action'}`);
      setTriggerType('time');
      setTriggerSource('schedule');
      setTriggerValue(scheduleData.time);
      
      if (deviceId) {
        const device = await smartHomeService.getDeviceById(deviceId);
        if (device) {
          // Create an action for this device
          setActions([{
            deviceId: deviceId,
            deviceName: device.name,
            action: scheduleData.action || 'on',
            value: null
          }]);
        }
      }
      
      // Load available devices for selection
      const devices = await smartHomeService.getDevices();
      setAvailableDevices(devices);
      
      // Load available triggers
      const triggers = await smartHomeService.getAvailableTriggers();
      setAvailableTriggers(triggers);
      
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize from schedule data');
      setIsLoading(false);
    }
  };
  
  const initializeNewRule = async () => {
    try {
      setIsLoading(true);
      const smartHomeService = SmartHomeService.getInstance();
      
      // Set default values for a new rule
      setName('New Automation');
      setTriggerType('time');
      setTriggerSource('schedule');
      setTriggerValue(new Date());
      setActions([]);
      
      // Load available devices for selection
      const devices = await smartHomeService.getDevices();
      setAvailableDevices(devices);
      
      // Load available triggers
      const triggers = await smartHomeService.getAvailableTriggers();
      setAvailableTriggers(triggers);
      
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize new automation');
      setIsLoading(false);
    }
  };
  
  const handleSave = async () => {
    try {
      if (!name.trim()) {
        Alert.alert('Error', 'Please enter a name for this automation');
        return;
      }
      
      if (actions.length === 0) {
        Alert.alert('Error', 'Please add at least one action');
        return;
      }
      
      setIsLoading(true);
      
      const ruleData = {
        id: mode === 'edit' ? ruleId : `rule_${Date.now()}`,
        name,
        trigger: {
          type: triggerType,
          source: triggerSource,
          value: triggerValue
        },
        actions,
        conditions,
        enabled: isEnabled
      };
      
      const smartHomeService = SmartHomeService.getInstance();
      
      if (mode === 'edit') {
        await smartHomeService.updateAutomationRule(ruleData);
      } else {
        await smartHomeService.createAutomationRule(ruleData);
      }
      
      setIsLoading(false);
      
      // Navigate back
      navigation.goBack();
    } catch (err) {
      setIsLoading(false);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save automation rule');
    }
  };
  
  const handleAddAction = () => {
    // In a real app, navigate to a device selection screen
    // For simplicity, we'll just add a dummy action
    if (availableDevices.length > 0) {
      const device = availableDevices[0];
      const newAction = {
        deviceId: device.id,
        deviceName: device.name,
        action: 'on',
        value: null
      };
      setActions([...actions, newAction]);
    } else {
      Alert.alert('Error', 'No devices available for actions');
    }
  };
  
  const handleRemoveAction = (index: number) => {
    const updatedActions = [...actions];
    updatedActions.splice(index, 1);
    setActions(updatedActions);
  };
  
  const handleAddCondition = () => {
    // For simplicity, just add a dummy condition
    const newCondition = {
      type: 'time',
      value: 'during daytime'
    };
    setConditions([...conditions, newCondition]);
  };
  
  const handleRemoveCondition = (index: number) => {
    const updatedConditions = [...conditions];
    updatedConditions.splice(index, 1);
    setConditions(updatedConditions);
  };
  
  const handleTimePickerChange = (event: any, selectedTime: Date | undefined) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTriggerValue(selectedTime);
    }
  };
  
  const renderTriggerSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Trigger
      </Text>
      
      <View style={styles.triggerTypeSelector}>
        <TouchableOpacity
          style={[
            styles.triggerTypeButton,
            triggerType === 'time' && { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => setTriggerType('time')}
        >
          <Text 
            style={[
              styles.triggerTypeText, 
              { color: triggerType === 'time' ? theme.colors.white : theme.colors.text }
            ]}
          >
            Time
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.triggerTypeButton,
            triggerType === 'event' && { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => setTriggerType('event')}
        >
          <Text 
            style={[
              styles.triggerTypeText, 
              { color: triggerType === 'event' ? theme.colors.white : theme.colors.text }
            ]}
          >
            Event
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.triggerTypeButton,
            triggerType === 'condition' && { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => setTriggerType('condition')}
        >
          <Text 
            style={[
              styles.triggerTypeText, 
              { color: triggerType === 'condition' ? theme.colors.white : theme.colors.text }
            ]}
          >
            Condition
          </Text>
        </TouchableOpacity>
      </View>
      
      {triggerType === 'time' && (
        <View style={styles.timeSelector}>
          <Text style={{ color: theme.colors.text }}>
            At:
          </Text>
          <TouchableOpacity
            style={[styles.timeValue, { backgroundColor: theme.colors.card }]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={{ color: theme.colors.text }}>
              {triggerValue instanceof Date 
                ? triggerValue.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : 'Select time'}
            </Text>
            <Ionicons name="time-outline" size={20} color={theme.colors.secondaryText} />
          </TouchableOpacity>
        </View>
      )}
      
      {triggerType === 'event' && (
        <View style={styles.eventSelector}>
          <Text style={{ color: theme.colors.text, marginBottom: 8 }}>
            When:
          </Text>
          
          {availableTriggers
            .filter(t => t.type === 'event')
            .map((trigger, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.triggerOption,
                  triggerSource === trigger.id && { 
                    backgroundColor: theme.colors.primaryLight,
                    borderColor: theme.colors.primary
                  }
                ]}
                onPress={() => {
                  setTriggerSource(trigger.id);
                  setTriggerValue(trigger.defaultValue || '');
                }}
              >
                <Text 
                  style={{ 
                    color: triggerSource === trigger.id ? theme.colors.primary : theme.colors.text 
                  }}
                >
                  {trigger.name}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      )}
      
      {triggerType === 'condition' && (
        <View style={styles.conditionSelector}>
          <Text style={{ color: theme.colors.text, marginBottom: 8 }}>
            If:
          </Text>
          
          {availableTriggers
            .filter(t => t.type === 'condition')
            .map((trigger, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.triggerOption,
                  triggerSource === trigger.id && { 
                    backgroundColor: theme.colors.primaryLight,
                    borderColor: theme.colors.primary
                  }
                ]}
                onPress={() => {
                  setTriggerSource(trigger.id);
                  setTriggerValue(trigger.defaultValue || '');
                }}
              >
                <Text 
                  style={{ 
                    color: triggerSource === trigger.id ? theme.colors.primary : theme.colors.text 
                  }}
                >
                  {trigger.name}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      )}
    </View>
  );
  
  const renderActionsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Actions
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddAction}
        >
          <Ionicons name="add" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
      
      {actions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ color: theme.colors.secondaryText }}>
            No actions added yet. Tap + to add an action.
          </Text>
        </View>
      ) : (
        actions.map((action, index) => (
          <View key={index} style={[styles.actionItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionDeviceName, { color: theme.colors.text }]}>
                {action.deviceName}
              </Text>
              <Text style={{ color: theme.colors.secondaryText }}>
                will {action.action} {action.value ? `(${action.value})` : ''}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveAction(index)}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
  
  const renderConditionsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Conditions (Optional)
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddCondition}
        >
          <Ionicons name="add" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
      
      {conditions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ color: theme.colors.secondaryText }}>
            No conditions added. Tap + to add a condition.
          </Text>
        </View>
      ) : (
        conditions.map((condition, index) => (
          <View key={index} style={[styles.conditionItem, { backgroundColor: theme.colors.card }]}>
            <Text style={{ color: theme.colors.text }}>
              {condition.type}: {condition.value}
            </Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveCondition(index)}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
  
  if (isLoading) {
    return <LoadingView message={mode === 'edit' ? 'Loading automation...' : 'Preparing...'} />;
  }
  
  if (error) {
    return <ErrorView message={error} onRetry={() => navigation.goBack()} />;
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TextInput
            style={[styles.nameInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
            value={name}
            onChangeText={setName}
            placeholder="Automation Name"
            placeholderTextColor={theme.colors.secondaryText}
          />
          
          <View style={styles.enabledContainer}>
            <Text style={{ color: theme.colors.text }}>Enabled</Text>
            <Switch
              value={isEnabled}
              onValueChange={setIsEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
              thumbColor={isEnabled ? theme.colors.primary : theme.colors.secondaryText}
            />
          </View>
        </View>
        
        {renderTriggerSection()}
        {renderActionsSection()}
        {renderConditionsSection()}
        
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
        >
          <Text style={[styles.saveButtonText, { color: theme.colors.white }]}>
            Save Automation
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      {showTimePicker && (
        <DateTimePicker
          value={triggerValue instanceof Date ? triggerValue : new Date()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimePickerChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginRight: 16,
  },
  enabledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  triggerTypeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  triggerTypeButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 4,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  triggerTypeText: {
    fontWeight: '500',
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 12,
  },
  eventSelector: {
    
  },
  conditionSelector: {
    
  },
  triggerOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    marginBottom: 8,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionInfo: {
    flex: 1,
  },
  actionDeviceName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeButton: {
    padding: 8,
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 