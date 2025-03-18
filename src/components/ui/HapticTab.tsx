import * as Haptics from 'expo-haptics';
import React from 'react';
import { AccessibilityRole, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface Tab {
  key: string;
  label: string;
}

interface HapticTabProps {
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  children?: React.ReactNode;
  style?: any;
  onPress?: () => void;
  active?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: { selected?: boolean };
  testID?: string;
}

export function HapticTab({ 
  tabs, 
  activeTab, 
  onTabChange, 
  children, 
  style, 
  onPress, 
  active,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  testID 
}: HapticTabProps): JSX.Element {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress();
  };

  if (tabs && activeTab && onTabChange) {
    return (
      <View style={styles.container}>
        {tabs.map(tab => (
          <Pressable
            key={tab.key}
            onPress={() => handlePress()}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            testID={`${tab.key}-tab`}
          >
            <ThemedText style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.tab, active && styles.activeTab, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      testID={testID}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#E0E0E0',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '700',
  },
}); 