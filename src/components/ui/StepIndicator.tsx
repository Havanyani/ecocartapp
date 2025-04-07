import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  onStepPress?: (index: number) => void;
}

export function StepIndicator({ 
  steps, 
  currentStep, 
  onStepPress 
}: StepIndicatorProps) {
  const theme = useTheme()()();

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isActive = currentStep >= index;
        const isCurrentStep = currentStep === index;
        
        return (
          <React.Fragment key={`step-${index}`}>
            {index > 0 && (
              <View 
                style={[
                  styles.connector, 
                  { backgroundColor: isActive ? '#2e7d32' : '#e0e0e0' }
                ]} 
              />
            )}
            
            <TouchableOpacity
              style={styles.stepItem}
              onPress={() => onStepPress && onStepPress(index)}
              disabled={!onStepPress || index > currentStep}
            >
              <View 
                style={[
                  styles.dot,
                  isActive ? styles.activeDot : styles.inactiveDot,
                  isCurrentStep && styles.currentDot
                ]}
              >
                {isActive && !isCurrentStep && (
                  <View style={styles.checkmark} />
                )}
              </View>
              
              <ThemedText 
                style={[
                  styles.stepLabel,
                  isActive ? styles.activeLabel : styles.inactiveLabel
                ]}
                numberOfLines={1}
              >
                {step}
              </ThemedText>
            </TouchableOpacity>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activeDot: {
    backgroundColor: '#2e7d32',
  },
  inactiveDot: {
    backgroundColor: '#e0e0e0',
  },
  currentDot: {
    borderWidth: 2,
    borderColor: '#2e7d32',
    backgroundColor: 'white',
  },
  connector: {
    height: 2,
    flex: 1,
  },
  checkmark: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  stepLabel: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  activeLabel: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  inactiveLabel: {
    color: '#757575',
  },
}); 