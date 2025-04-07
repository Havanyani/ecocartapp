import { ThemedText } from '@/components/ui';
import { Slider } from '@/components/ui/Slider';
import Switch from '@/components/ui/Switch';
import { useTheme } from '@/hooks/useTheme';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AIConfig {
  isEnabled: boolean;
  confidenceThreshold: number;
  maxDetections: number;
  useGPU: boolean;
  modelVersion: string;
}

export default function AIConfigScreen() {
  const { theme } = useTheme();
  const [config, setConfig] = useState<AIConfig>({
    isEnabled: true,
    confidenceThreshold: 0.7,
    maxDetections: 5,
    useGPU: false,
    modelVersion: 'v2.1.0',
  });

  const handleToggle = (key: keyof AIConfig) => {
    setConfig(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSliderChange = (key: keyof AIConfig, value: number) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <ThemedText style={styles.title}>AI Configuration</ThemedText>
          
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>General Settings</ThemedText>
            
            <View style={styles.setting}>
              <View style={styles.settingHeader}>
                <ThemedText style={styles.settingLabel}>Enable AI Detection</ThemedText>
                <Switch
                  value={config.isEnabled}
                  onValueChange={() => handleToggle('isEnabled')}
                />
              </View>
              <ThemedText style={styles.settingDescription}>
                Enable or disable AI-powered material detection
              </ThemedText>
            </View>

            <View style={styles.setting}>
              <View style={styles.settingHeader}>
                <ThemedText style={styles.settingLabel}>Use GPU Acceleration</ThemedText>
                <Switch
                  value={config.useGPU}
                  onValueChange={() => handleToggle('useGPU')}
                />
              </View>
              <ThemedText style={styles.settingDescription}>
                Use GPU for faster processing (if available)
              </ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Detection Settings</ThemedText>
            
            <View style={styles.setting}>
              <ThemedText style={styles.settingLabel}>Confidence Threshold</ThemedText>
              <Slider
                value={config.confidenceThreshold}
                onValueChange={(value) => handleSliderChange('confidenceThreshold', value)}
                minimumValue={0}
                maximumValue={1}
                step={0.1}
              />
              <ThemedText style={styles.settingValue}>
                {Math.round(config.confidenceThreshold * 100)}%
              </ThemedText>
              <ThemedText style={styles.settingDescription}>
                Minimum confidence required for material detection
              </ThemedText>
            </View>

            <View style={styles.setting}>
              <ThemedText style={styles.settingLabel}>Maximum Detections</ThemedText>
              <Slider
                value={config.maxDetections}
                onValueChange={(value) => handleSliderChange('maxDetections', value)}
                minimumValue={1}
                maximumValue={10}
                step={1}
              />
              <ThemedText style={styles.settingValue}>
                {config.maxDetections}
              </ThemedText>
              <ThemedText style={styles.settingDescription}>
                Maximum number of materials to detect in a single scan
              </ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Model Information</ThemedText>
            
            <View style={styles.setting}>
              <ThemedText style={styles.settingLabel}>Model Version</ThemedText>
              <ThemedText style={styles.settingValue}>{config.modelVersion}</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Current version of the AI model
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  setting: {
    marginBottom: 20,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    marginTop: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
}); 