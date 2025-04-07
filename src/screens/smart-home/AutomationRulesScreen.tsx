import { ErrorView } from '@/components/ErrorView';
import { LoadingView } from '@/components/LoadingView';
import { useTheme } from '@/hooks/useTheme';
import { SmartHomeStackParamList } from '@/navigation/types';
import { SmartHomeService } from '@/services/smart-home/SmartHomeService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AutomationRulesScreenProps = {
  navigation: StackNavigationProp<SmartHomeStackParamList, 'AutomationRules'>;
};

interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    type: 'time' | 'event' | 'condition';
    source: string;
    value?: any;
  };
  actions: Array<{
    deviceId: string;
    deviceName: string;
    action: string;
    value?: any;
  }>;
  conditions?: Array<{
    type: string;
    value: any;
  }>;
  enabled: boolean;
  lastTriggered?: Date;
}

export default function AutomationRulesScreen({ navigation }: AutomationRulesScreenProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  
  // Load automation rules when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAutomationRules();
    }, [])
  );
  
  const loadAutomationRules = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const smartHomeService = SmartHomeService.getInstance();
      const rules = await smartHomeService.getAutomationRules();
      
      setAutomationRules(rules);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load automation rules');
      setIsLoading(false);
    }
  };
  
  const handleCreateAutomation = () => {
    navigation.navigate('CreateAutomation', {
      mode: 'create'
    });
  };
  
  const handleEditAutomation = (ruleId: string) => {
    navigation.navigate('CreateAutomation', {
      mode: 'edit',
      ruleId
    });
  };
  
  const toggleRuleEnabled = async (ruleId: string, currentlyEnabled: boolean) => {
    try {
      // Update local state immediately for responsive UI
      setAutomationRules(prevRules => 
        prevRules.map(rule => 
          rule.id === ruleId 
            ? { ...rule, enabled: !currentlyEnabled } 
            : rule
        )
      );
      
      // Update on the server
      const smartHomeService = SmartHomeService.getInstance();
      await smartHomeService.updateAutomationRuleStatus(ruleId, !currentlyEnabled);
      
    } catch (err) {
      // Revert change if failed
      setAutomationRules(prevRules => [...prevRules]);
      Alert.alert('Error', 'Failed to update rule status');
    }
  };
  
  const deleteRule = (ruleId: string) => {
    Alert.alert(
      'Delete Automation',
      'Are you sure you want to delete this automation rule?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              
              const smartHomeService = SmartHomeService.getInstance();
              await smartHomeService.deleteAutomationRule(ruleId);
              
              // Update local state
              setAutomationRules(automationRules.filter(rule => rule.id !== ruleId));
              
              setIsLoading(false);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to delete automation rule');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const getTriggerDescription = (trigger: AutomationRule['trigger']) => {
    switch (trigger.type) {
      case 'time':
        return `At ${trigger.value}`;
      case 'event':
        return `When ${trigger.source} ${trigger.value}`;
      case 'condition':
        return `If ${trigger.source} ${trigger.value}`;
      default:
        return 'Unknown trigger';
    }
  };
  
  const getActionDescription = (actions: AutomationRule['actions']) => {
    if (actions.length === 0) return 'No actions';
    if (actions.length === 1) {
      return `${actions[0].deviceName} will ${actions[0].action}`;
    }
    return `${actions.length} devices will be controlled`;
  };
  
  const renderAutomationItem = ({ item }: { item: AutomationRule }) => (
    <View 
      style={[
        styles.ruleCard, 
        { 
          backgroundColor: theme.colors.card,
          opacity: item.enabled ? 1 : 0.6
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.ruleContent}
        onPress={() => handleEditAutomation(item.id)}
      >
        <View style={styles.ruleHeader}>
          <Text style={[styles.ruleName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          {item.lastTriggered && (
            <Text style={[styles.lastTriggered, { color: theme.colors.secondaryText }]}>
              Last: {new Date(item.lastTriggered).toLocaleTimeString()}
            </Text>
          )}
        </View>
        
        <View style={styles.ruleDetails}>
          <View style={styles.triggerSection}>
            <Ionicons 
              name="flash-outline" 
              size={18} 
              color={theme.colors.primary} 
              style={styles.sectionIcon}
            />
            <Text style={[styles.triggerText, { color: theme.colors.text }]}>
              {getTriggerDescription(item.trigger)}
            </Text>
          </View>
          
          <View style={styles.actionSection}>
            <Ionicons 
              name="checkmark-circle-outline" 
              size={18} 
              color={theme.colors.success} 
              style={styles.sectionIcon}
            />
            <Text style={[styles.actionText, { color: theme.colors.text }]}>
              {getActionDescription(item.actions)}
            </Text>
          </View>
          
          {item.conditions && item.conditions.length > 0 && (
            <View style={styles.conditionSection}>
              <Ionicons 
                name="options-outline" 
                size={18} 
                color={theme.colors.info} 
                style={styles.sectionIcon}
              />
              <Text style={[styles.conditionText, { color: theme.colors.text }]}>
                Only if conditions are met
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.ruleActions}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => toggleRuleEnabled(item.id, item.enabled)}
        >
          <Ionicons 
            name={item.enabled ? "checkmark-circle" : "ellipse-outline"} 
            size={24} 
            color={item.enabled ? theme.colors.success : theme.colors.border} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteRule(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  if (isLoading) {
    return <LoadingView message="Loading automations..." />;
  }
  
  if (error) {
    return <ErrorView message={error} onRetry={loadAutomationRules} />;
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Automation Rules
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
          Create smart sequences for your EcoCart devices
        </Text>
      </View>
      
      {automationRules.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons 
            name="git-branch-outline" 
            size={64} 
            color={theme.colors.secondaryText} 
          />
          <Text style={[styles.emptyStateText, { color: theme.colors.secondaryText }]}>
            No automation rules yet
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: theme.colors.secondaryText }]}>
            Create your first automation to make your home smarter
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleCreateAutomation}
          >
            <Text style={[styles.createButtonText, { color: theme.colors.white }]}>
              Create Automation
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={automationRules}
          renderItem={renderAutomationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.rulesList}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {automationRules.length > 0 && (
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleCreateAutomation}
        >
          <Ionicons name="add" size={24} color={theme.colors.white} />
        </TouchableOpacity>
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
    marginBottom: 24,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rulesList: {
    padding: 16,
  },
  ruleCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ruleContent: {
    flex: 1,
    padding: 16,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastTriggered: {
    fontSize: 12,
  },
  ruleDetails: {
    marginTop: 8,
  },
  triggerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  conditionSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 8,
  },
  triggerText: {
    flex: 1,
  },
  actionText: {
    flex: 1,
  },
  conditionText: {
    flex: 1,
    fontStyle: 'italic',
  },
  ruleActions: {
    padding: 8,
    justifyContent: 'space-between',
  },
  toggleButton: {
    padding: 8,
    marginBottom: 16,
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