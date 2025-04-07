import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  ConflictData,
  ConflictResolutionStrategy,
  getSuggestedStrategy
} from '../utils/ConflictResolution';

interface ConflictResolutionDialogProps<T> {
  conflict: ConflictData<T>;
  visible: boolean;
  onResolve: (resolvedData: T) => void;
  onCancel: () => void;
  title?: string;
  loading?: boolean;
}

export function ConflictResolutionDialog<T extends Record<string, any>>({
  conflict,
  visible,
  onResolve,
  onCancel,
  title = 'Resolve Conflicts',
  loading = false
}: ConflictResolutionDialogProps<T>) {
  const theme = useTheme()()();
  const [resolvedData, setResolvedData] = useState<T>({ ...conflict.clientData });
  const [fieldChoices, setFieldChoices] = useState<Record<string, 'server' | 'client'>>({});
  
  // Get conflict fields
  const conflictFields = conflict.conflictFields || [];
  
  // Get suggested strategies on mount
  useEffect(() => {
    const strategies = getSuggestedStrategy(conflict);
    
    // Initialize field choices based on suggested strategies
    const initialChoices: Record<string, 'server' | 'client'> = {};
    
    for (const field of conflictFields) {
      const strategy = strategies[field];
      
      if (strategy === ConflictResolutionStrategy.SERVER_WINS) {
        initialChoices[field] = 'server';
      } else {
        initialChoices[field] = 'client';
      }
    }
    
    setFieldChoices(initialChoices);
    updateResolvedData(initialChoices);
  }, [conflict]);
  
  // Update resolved data when field choices change
  const updateResolvedData = (choices: Record<string, 'server' | 'client'>) => {
    const newData = { ...conflict.clientData };
    
    for (const [field, choice] of Object.entries(choices)) {
      if (choice === 'server' && field in conflict.serverData) {
        newData[field as keyof T] = conflict.serverData[field as keyof T];
      }
      // For 'client' choice, keep client data (which is already in newData)
    }
    
    setResolvedData(newData);
  };
  
  // Handle field choice change
  const handleChoiceChange = (field: string, choice: 'server' | 'client') => {
    const newChoices = { ...fieldChoices, [field]: choice };
    setFieldChoices(newChoices);
    updateResolvedData(newChoices);
  };
  
  // Apply conflict resolution
  const handleResolve = () => {
    onResolve(resolvedData);
  };
  
  // Apply server data for all fields
  const handleUseServer = () => {
    const newChoices: Record<string, 'server' | 'client'> = {};
    for (const field of conflictFields) {
      newChoices[field] = 'server';
    }
    setFieldChoices(newChoices);
    updateResolvedData(newChoices);
  };
  
  // Apply client data for all fields
  const handleUseClient = () => {
    const newChoices: Record<string, 'server' | 'client'> = {};
    for (const field of conflictFields) {
      newChoices[field] = 'client';
    }
    setFieldChoices(newChoices);
    updateResolvedData(newChoices);
  };
  
  // Format values for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'Not set';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };
  
  // Get field label from camelCase
  const getFieldLabel = (field: string): string => {
    return field
      // Add spaces before capital letters
      .replace(/([A-Z])/g, ' $1')
      // Capitalize first letter
      .replace(/^./, str => str.toUpperCase());
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View 
          style={[
            styles.modalContent, 
            { backgroundColor: theme.colors.background }
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Please choose which version of the data to keep
          </Text>
          
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.primary + '20' }]} 
              onPress={handleUseServer}
            >
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                Use Server Data
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.primary + '20' }]} 
              onPress={handleUseClient}
            >
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                Use Local Data
              </Text>
            </TouchableOpacity>
          </View>
          
          {conflictFields.length === 0 ? (
            <View style={styles.noConflicts}>
              <Ionicons name="checkmark-circle" size={48} color={theme.colors.success} />
              <Text style={[styles.noConflictsText, { color: theme.colors.text }]}>
                No conflicts found. Data can be synchronized without changes.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.fieldsContainer}>
              {conflictFields.map((field) => (
                <View key={field} style={styles.fieldRow}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
                    {getFieldLabel(field)}
                  </Text>
                  
                  <View style={styles.valueContainer}>
                    <TouchableOpacity
                      style={[
                        styles.valueOption,
                        fieldChoices[field] === 'server' && 
                          { backgroundColor: theme.colors.primary + '20' }
                      ]}
                      onPress={() => handleChoiceChange(field, 'server')}
                    >
                      <View style={styles.valueHeader}>
                        <Text style={[styles.valueSource, { color: theme.colors.primary }]}>
                          Server
                        </Text>
                        <View style={styles.radioButton}>
                          {fieldChoices[field] === 'server' && (
                            <View style={[styles.radioFill, { backgroundColor: theme.colors.primary }]} />
                          )}
                        </View>
                      </View>
                      <Text 
                        style={[styles.valueText, { color: theme.colors.text }]}
                        numberOfLines={2}
                      >
                        {formatValue(conflict.serverData[field])}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.valueOption,
                        fieldChoices[field] === 'client' && 
                          { backgroundColor: theme.colors.primary + '20' }
                      ]}
                      onPress={() => handleChoiceChange(field, 'client')}
                    >
                      <View style={styles.valueHeader}>
                        <Text style={[styles.valueSource, { color: theme.colors.primary }]}>
                          Local
                        </Text>
                        <View style={styles.radioButton}>
                          {fieldChoices[field] === 'client' && (
                            <View style={[styles.radioFill, { backgroundColor: theme.colors.primary }]} />
                          )}
                        </View>
                      </View>
                      <Text 
                        style={[styles.valueText, { color: theme.colors.text }]}
                        numberOfLines={2}
                      >
                        {formatValue(conflict.clientData[field])}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.cancelButton, { borderColor: theme.colors.textSecondary }]} 
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.resolveButton, 
                { backgroundColor: theme.colors.primary },
                loading && { opacity: 0.7 }
              ]} 
              onPress={handleResolve}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.resolveButtonText}>
                  Apply Resolution
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  closeButton: {
    padding: 4
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 0.48
  },
  actionButtonText: {
    textAlign: 'center',
    fontWeight: '500'
  },
  noConflicts: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  noConflictsText: {
    textAlign: 'center',
    marginTop: 16
  },
  fieldsContainer: {
    flex: 1,
    marginBottom: 16
  },
  fieldRow: {
    marginBottom: 20
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  valueOption: {
    flex: 0.48,
    borderRadius: 8,
    padding: 12
  },
  valueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  valueSource: {
    fontWeight: '500',
    fontSize: 14
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioFill: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  valueText: {
    fontSize: 14
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  cancelButton: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center'
  },
  resolveButton: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    fontWeight: '500'
  },
  resolveButtonText: {
    color: 'white',
    fontWeight: '500'
  }
});

export default ConflictResolutionDialog; 