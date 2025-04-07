import { ErrorView } from '@/components/ErrorView';
import { LoadingView } from '@/components/LoadingView';
import { useTheme } from '@/hooks/useTheme';
import { SmartHomeStackParamList } from '@/navigation/types';
import { SmartHomeService } from '@/services/smart-home/SmartHomeService';
import Slider from '@react-native-community/slider';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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

type DeviceSettingsScreenProps = {
  route: RouteProp<SmartHomeStackParamList, 'DeviceSettings'>;
  navigation: StackNavigationProp<SmartHomeStackParamList, 'DeviceSettings'>;
};

interface DeviceSetting {
  id: string;
  name: string;
  type: 'toggle' | 'slider' | 'select' | 'input' | 'button';
  value: any;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  category: 'general' | 'advanced' | 'power' | 'notifications' | 'maintenance';
}

export default function DeviceSettingsScreen({ route, navigation }: DeviceSettingsScreenProps) {
  const { deviceId } = route.params;
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<any>(null);
  const [settings, setSettings] = useState<DeviceSetting[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  useEffect(() => {
    loadDeviceSettings();
  }, [deviceId]);
  
  const loadDeviceSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const smartHomeService = SmartHomeService.getInstance();
      const deviceData = await smartHomeService.getDeviceById(deviceId);
      
      if (!deviceData) {
        throw new Error('Device not found');
      }
      
      setDevice(deviceData);
      
      // Load device settings
      const deviceSettings = await smartHomeService.getDeviceSettings(deviceId);
      setSettings(deviceSettings);
      
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load device settings');
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      const smartHomeService = SmartHomeService.getInstance();
      await smartHomeService.updateDeviceSettings(deviceId, settings);
      
      // Short delay to show success state
      setTimeout(() => {
        setIsSaving(false);
        Alert.alert('Success', 'Settings saved successfully');
      }, 1000);
    } catch (err) {
      setIsSaving(false);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save settings');
    }
  };
  
  const updateSetting = (settingId: string, newValue: any) => {
    const updatedSettings = settings.map(setting => 
      setting.id === settingId 
        ? { ...setting, value: newValue } 
        : setting
    );
    setSettings(updatedSettings);
  };
  
  const handleFactoryReset = () => {
    Alert.alert(
      'Factory Reset',
      'Are you sure you want to reset this device to factory settings? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              
              const smartHomeService = SmartHomeService.getInstance();
              await smartHomeService.factoryResetDevice(deviceId);
              
              setIsLoading(false);
              
              // Navigate back to device details
              navigation.goBack();
              Alert.alert('Success', 'Device has been reset to factory settings');
            } catch (err) {
              setIsLoading(false);
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to reset device');
            }
          }
        }
      ]
    );
  };
  
  const renderSettingItem = (setting: DeviceSetting) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <View key={setting.id} style={styles.settingItem}>
            <Text style={[styles.settingName, { color: theme.colors.text }]}>
              {setting.name}
            </Text>
            <Switch
              value={setting.value}
              onValueChange={(newValue) => updateSetting(setting.id, newValue)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
              thumbColor={setting.value ? theme.colors.primary : theme.colors.secondaryText}
            />
          </View>
        );
        
      case 'slider':
        return (
          <View key={setting.id} style={styles.settingItem}>
            <View style={styles.sliderHeader}>
              <Text style={[styles.settingName, { color: theme.colors.text }]}>
                {setting.name}
              </Text>
              <Text style={[styles.sliderValue, { color: theme.colors.primary }]}>
                {setting.value}{setting.unit || ''}
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={setting.min || 0}
              maximumValue={setting.max || 100}
              step={setting.step || 1}
              value={setting.value}
              onValueChange={(newValue) => updateSetting(setting.id, newValue)}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.border}
              thumbTintColor={theme.colors.primary}
            />
          </View>
        );
        
      case 'select':
        return (
          <View key={setting.id} style={styles.settingItem}>
            <Text style={[styles.settingName, { color: theme.colors.text }]}>
              {setting.name}
            </Text>
            <View style={styles.selectOptions}>
              {setting.options?.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.selectOption,
                    setting.value === option && { 
                      backgroundColor: theme.colors.primaryLight,
                      borderColor: theme.colors.primary
                    }
                  ]}
                  onPress={() => updateSetting(setting.id, option)}
                >
                  <Text 
                    style={{ 
                      color: setting.value === option ? theme.colors.primary : theme.colors.text 
                    }}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
        
      case 'input':
        return (
          <View key={setting.id} style={styles.settingItem}>
            <Text style={[styles.settingName, { color: theme.colors.text }]}>
              {setting.name}
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.card
                }
              ]}
              value={String(setting.value)}
              onChangeText={(text) => updateSetting(setting.id, text)}
              placeholder={`Enter ${setting.name.toLowerCase()}`}
              placeholderTextColor={theme.colors.secondaryText}
            />
          </View>
        );
        
      case 'button':
        return (
          <View key={setting.id} style={styles.settingItem}>
            <Text style={[styles.settingName, { color: theme.colors.text }]}>
              {setting.name}
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                // Implement specific actions based on the setting id
                if (setting.id === 'factory_reset') {
                  handleFactoryReset();
                } else {
                  // Generic action - would be customized in a real app
                  Alert.alert('Action', `Action triggered: ${setting.name}`);
                }
              }}
            >
              <Text style={[styles.actionButtonText, { color: theme.colors.white }]}>
                {setting.value || 'Execute'}
              </Text>
            </TouchableOpacity>
          </View>
        );
        
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return <LoadingView message="Loading device settings..." />;
  }
  
  if (error) {
    return <ErrorView message={error} onRetry={loadDeviceSettings} />;
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {device?.name} Settings
        </Text>
      </View>
      
      <View style={styles.categoryTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['general', 'power', 'notifications', 'advanced', 'maintenance'].map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                activeCategory === category && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text 
                style={[
                  styles.categoryText,
                  { color: activeCategory === category ? theme.colors.white : theme.colors.text }
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ScrollView style={styles.settingsContainer}>
        {settings
          .filter(setting => setting.category === activeCategory)
          .map(renderSettingItem)}
          
        {settings.filter(setting => setting.category === activeCategory).length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ color: theme.colors.secondaryText }}>
              No settings available in this category
            </Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={saveSettings}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={[styles.saveButtonText, { color: theme.colors.white }]}>
              Save Settings
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  },
  categoryTabs: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 16,
  },
  categoryText: {
    fontWeight: '500',
  },
  settingsContainer: {
    flex: 1,
    padding: 16,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingName: {
    fontSize: 16,
    marginBottom: 8,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slider: {
    height: 40,
  },
  sliderValue: {
    fontWeight: 'bold',
  },
  selectOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginRight: 8,
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  actionButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontWeight: '500',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 