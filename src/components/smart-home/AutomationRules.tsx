import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { AutomationRule, SmartHomeService } from '../../services/smart-home/SmartHomeService';

interface AutomationRulesProps {
  onClose?: () => void;
}

function AutomationRules({ onClose }: AutomationRulesProps) {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRule, setCurrentRule] = useState<AutomationRule | null>(null);
  const [editRuleModal, setEditRuleModal] = useState(false);
  
  const theme = useTheme();

  // Form state for rule editing
  const [ruleName, setRuleName] = useState('');
  const [ruleEnabled, setRuleEnabled] = useState(true);
  const [ruleDeviceId, setRuleDeviceId] = useState('');
  const [ruleTrigger, setRuleTrigger] = useState('');
  const [ruleAction, setRuleAction] = useState('');
  const [ruleCondition, setRuleCondition] = useState('');

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setIsLoading(true);
    try {
      const smartHomeService = SmartHomeService.getInstance();
      const automationRules = await smartHomeService.getAutomationRules();
      setRules(automationRules);
    } catch (error) {
      console.error('Error loading automation rules:', error);
      Alert.alert(
        'Error',
        'Could not load automation rules. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      // Find the rule to update
      const ruleToUpdate = rules.find(rule => rule.id === ruleId);
      if (!ruleToUpdate) return;
      
      // Update local state first for responsiveness
      const updatedRules = rules.map(rule => 
        rule.id === ruleId ? { ...rule, enabled } : rule
      );
      setRules(updatedRules);
      
      // Update in the service
      const smartHomeService = SmartHomeService.getInstance();
      await smartHomeService.updateAutomationRule({
        ...ruleToUpdate,
        enabled
      });
    } catch (error) {
      console.error('Error toggling rule:', error);
      // Revert the local state change if there was an error
      loadRules();
      Alert.alert(
        'Error',
        'Could not update rule. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    Alert.alert(
      'Delete Rule',
      'Are you sure you want to delete this automation rule?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const smartHomeService = SmartHomeService.getInstance();
              await smartHomeService.deleteAutomationRule(ruleId);
              
              // Update local state
              setRules(rules.filter(rule => rule.id !== ruleId));
              
              Alert.alert('Success', 'Rule deleted successfully');
            } catch (error) {
              console.error('Error deleting rule:', error);
              Alert.alert(
                'Error',
                'Could not delete rule. Please try again.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const openEditRuleModal = (rule: AutomationRule | null = null) => {
    setIsEditing(!!rule);
    setCurrentRule(rule);
    
    if (rule) {
      setRuleName(rule.name);
      setRuleEnabled(rule.enabled);
      setRuleDeviceId(rule.deviceId);
      setRuleTrigger(rule.trigger.type);
      setRuleCondition(rule.condition || '');
      setRuleAction(rule.action.type);
    } else {
      // Default values for new rule
      setRuleName('');
      setRuleEnabled(true);
      setRuleDeviceId('');
      setRuleTrigger('');
      setRuleCondition('');
      setRuleAction('');
    }
    
    setEditRuleModal(true);
  };

  const handleSaveRule = async () => {
    try {
      if (!ruleName || !ruleDeviceId || !ruleTrigger || !ruleAction) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }
      
      const smartHomeService = SmartHomeService.getInstance();
      
      const ruleData: AutomationRule = {
        id: isEditing && currentRule ? currentRule.id : `rule-${Date.now()}`,
        name: ruleName,
        enabled: ruleEnabled,
        deviceId: ruleDeviceId,
        trigger: {
          type: ruleTrigger,
          value: ruleTrigger.includes('level') ? 80 : undefined, // Default value for level triggers
        },
        condition: ruleCondition || undefined,
        action: {
          type: ruleAction,
          parameters: ruleAction.includes('notification') 
            ? { message: `Your smart device needs attention: ${ruleName}` } 
            : {},
        },
        createdAt: isEditing && currentRule ? currentRule.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      if (isEditing && currentRule) {
        await smartHomeService.updateAutomationRule(ruleData);
        
        // Update local state
        setRules(rules.map(rule => 
          rule.id === ruleData.id ? ruleData : rule
        ));
        
        Alert.alert('Success', 'Rule updated successfully');
      } else {
        await smartHomeService.addAutomationRule(ruleData);
        
        // Update local state
        setRules([...rules, ruleData]);
        
        Alert.alert('Success', 'Rule created successfully');
      }
      
      setEditRuleModal(false);
    } catch (error) {
      console.error('Error saving rule:', error);
      Alert.alert(
        'Error',
        'Could not save rule. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderRuleItem = ({ item }: { item: AutomationRule }) => {
    const getTriggerDescription = (rule: AutomationRule) => {
      const { trigger } = rule;
      
      switch (trigger.type) {
        case 'fillLevel':
          return `Fill level reaches ${trigger.value || 80}%`;
        case 'connectionStatus':
          return 'Connection status changes';
        case 'batteryLevel':
          return `Battery level drops below ${trigger.value || 20}%`;
        case 'contaminationDetected':
          return 'Contamination is detected';
        default:
          return 'Triggered by device event';
      }
    };
    
    const getActionDescription = (rule: AutomationRule) => {
      const { action } = rule;
      
      switch (action.type) {
        case 'sendNotification':
          return 'Send notification';
        case 'schedulePickup':
          return 'Schedule recycling pickup';
        case 'logEvent':
          return 'Log event to history';
        default:
          return 'Perform action';
      }
    };
    
    const getIconName = (rule: AutomationRule) => {
      if (rule.trigger.type.includes('fill')) {
        return 'water-outline';
      } else if (rule.trigger.type.includes('battery')) {
        return 'battery-half-outline';
      } else if (rule.trigger.type.includes('connection')) {
        return 'bluetooth-outline';
      } else if (rule.trigger.type.includes('contamination')) {
        return 'alert-circle-outline';
      } else {
        return 'cog-outline';
      }
    };

    return (
      <View style={styles.ruleItem}>
        <View style={styles.ruleIconContainer}>
          <Ionicons name={getIconName(item)} size={24} color={item.enabled ? theme.colors.primary : '#ccc'} />
        </View>
        
        <View style={styles.ruleContent}>
          <View style={styles.ruleHeader}>
            <Text style={styles.ruleName}>{item.name}</Text>
            <Switch
              value={item.enabled}
              onValueChange={(enabled) => handleToggleRule(item.id, enabled)}
            />
          </View>
          
          <Text style={styles.ruleDescription}>
            When: <Text style={styles.ruleHighlight}>{getTriggerDescription(item)}</Text>
          </Text>
          
          {item.condition && (
            <Text style={styles.ruleDescription}>
              If: <Text style={styles.ruleHighlight}>{item.condition}</Text>
            </Text>
          )}
          
          <Text style={styles.ruleDescription}>
            Then: <Text style={styles.ruleHighlight}>{getActionDescription(item)}</Text>
          </Text>
          
          <View style={styles.ruleActions}>
            <TouchableOpacity
              style={styles.ruleAction}
              onPress={() => openEditRuleModal(item)}
            >
              <Ionicons name="pencil-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.ruleActionText, { color: theme.colors.primary }]}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.ruleAction}
              onPress={() => handleDeleteRule(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#F44336" />
              <Text style={[styles.ruleActionText, { color: '#F44336' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Automation Rules</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading automation rules...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <FlatList
            data={rules}
            renderItem={renderRuleItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.rulesList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="options-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No automation rules</Text>
                <Text style={styles.emptySubText}>
                  Create rules to automate your smart home devices
                </Text>
              </View>
            }
          />
          
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => openEditRuleModal()}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Create Rule</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Edit Rule Modal */}
      <Modal
        visible={editRuleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditRuleModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Rule' : 'Create Rule'}
              </Text>
              <TouchableOpacity onPress={() => setEditRuleModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Rule Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={ruleName}
                  onChangeText={setRuleName}
                  placeholder="Enter a name for this rule"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Enable Rule</Text>
                <Switch
                  value={ruleEnabled}
                  onChangeText={setRuleEnabled}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Device</Text>
                <View style={styles.formInput}>
                  <Text>Select a device (mock)</Text>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Trigger</Text>
                <View style={styles.formButtons}>
                  {['fillLevel', 'batteryLevel', 'connectionStatus', 'contaminationDetected'].map(trigger => (
                    <TouchableOpacity
                      key={trigger}
                      style={[
                        styles.triggerButton,
                        ruleTrigger === trigger && { 
                          backgroundColor: theme.colors.primary + '20',
                          borderColor: theme.colors.primary 
                        }
                      ]}
                      onPress={() => setRuleTrigger(trigger)}
                    >
                      <Text style={[
                        styles.triggerButtonText,
                        ruleTrigger === trigger && { color: theme.colors.primary }
                      ]}>
                        {trigger === 'fillLevel' ? 'Fill Level' :
                         trigger === 'batteryLevel' ? 'Battery Level' :
                         trigger === 'connectionStatus' ? 'Connection' :
                         trigger === 'contaminationDetected' ? 'Contamination' : trigger}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Condition (Optional)</Text>
                <TextInput
                  style={styles.formInput}
                  value={ruleCondition}
                  onChangeText={setRuleCondition}
                  placeholder="If..."
                  multiline
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Action</Text>
                <View style={styles.formButtons}>
                  {['sendNotification', 'schedulePickup', 'logEvent'].map(action => (
                    <TouchableOpacity
                      key={action}
                      style={[
                        styles.actionButton,
                        ruleAction === action && { 
                          backgroundColor: theme.colors.primary + '20',
                          borderColor: theme.colors.primary 
                        }
                      ]}
                      onPress={() => setRuleAction(action)}
                    >
                      <Text style={[
                        styles.actionButtonText,
                        ruleAction === action && { color: theme.colors.primary }
                      ]}>
                        {action === 'sendNotification' ? 'Send Notification' :
                         action === 'schedulePickup' ? 'Schedule Pickup' :
                         action === 'logEvent' ? 'Log Event' : action}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditRuleModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveRule}
              >
                <Text style={styles.saveButtonText}>
                  {isEditing ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  rulesList: {
    padding: 16,
    paddingBottom: 80,
  },
  ruleItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  ruleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ruleContent: {
    flex: 1,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleName: {
    fontSize: 16,
    fontWeight: '600',
  },
  ruleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ruleHighlight: {
    color: '#444',
    fontWeight: '500',
  },
  ruleActions: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  ruleAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  ruleActionText: {
    fontSize: 14,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    color: '#666',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalScrollView: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#444',
  },
  formInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  formButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  triggerButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 8,
    marginBottom: 8,
  },
  triggerButtonText: {
    color: '#555',
  },
  actionButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#555',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    padding: 12,
    borderRadius: 6,
    width: '48%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AutomationRules; 