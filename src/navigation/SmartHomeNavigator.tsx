import { useTheme } from '@/hooks/useTheme';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

// Import screens
import ApplianceScheduleScreen from '@/screens/smart-home/ApplianceScheduleScreen';
import AutomationRulesScreen from '@/screens/smart-home/AutomationRulesScreen';
import CreateAutomationScreen from '@/screens/smart-home/CreateAutomationScreen';
import DeviceDetailsScreen from '@/screens/smart-home/DeviceDetailsScreen';
import DeviceDiscoveryScreen from '@/screens/smart-home/DeviceDiscoveryScreen';
import DeviceSettingsScreen from '@/screens/smart-home/DeviceSettingsScreen';
import EnergyHistoryScreen from '@/screens/smart-home/EnergyHistoryScreen';
import EnergySavingTipsScreen from '@/screens/smart-home/EnergySavingTipsScreen';
import EnergyUsageScreen from '@/screens/smart-home/EnergyUsageScreen';
import RecyclingHistoryScreen from '@/screens/smart-home/RecyclingHistoryScreen';
import SmartDeviceControlScreen from '@/screens/smart-home/SmartDeviceControlScreen';
import SmartHomeOverviewScreen from '@/screens/smart-home/SmartHomeOverviewScreen';

// Define the parameter types for the stack navigator
export type SmartHomeStackParamList = {
  SmartHomeOverview: undefined;
  DeviceDiscovery: undefined;
  DeviceDetails: { deviceId: string };
  SmartDeviceControl: { deviceId: string };
  DeviceSettings: { deviceId: string };
  ApplianceSchedule: { 
    deviceId: string;
    deviceName: string;
    currentSchedule: string | null;
  };
  EnergyUsage: { deviceId: string };
  EnergySavingTips: { applianceType: string | null };
  RecyclingHistory: { deviceId: string };
  EnergyHistory: { deviceId: string };
  AutomationRules: undefined;
  CreateAutomation: { existingRuleId?: string };
};

const Stack = createStackNavigator<SmartHomeStackParamList>();

export default function SmartHomeNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="SmartHomeOverview"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: theme.colors.background }
      }}
    >
      <Stack.Screen 
        name="SmartHomeOverview" 
        component={SmartHomeOverviewScreen}
        options={{ title: 'Smart Home' }}
      />
      <Stack.Screen 
        name="DeviceDiscovery" 
        component={DeviceDiscoveryScreen}
        options={{ title: 'Add Device' }}
      />
      <Stack.Screen 
        name="DeviceDetails" 
        component={DeviceDetailsScreen}
        options={{ title: 'Device Details' }}
      />
      <Stack.Screen 
        name="SmartDeviceControl" 
        component={SmartDeviceControlScreen}
        options={{ title: 'Device Control' }}
      />
      <Stack.Screen 
        name="DeviceSettings" 
        component={DeviceSettingsScreen}
        options={{ title: 'Device Settings' }}
      />
      <Stack.Screen 
        name="ApplianceSchedule" 
        component={ApplianceScheduleScreen}
        options={{ title: 'Schedule Device' }}
      />
      <Stack.Screen 
        name="EnergyUsage" 
        component={EnergyUsageScreen}
        options={{ title: 'Energy Usage' }}
      />
      <Stack.Screen 
        name="EnergySavingTips" 
        component={EnergySavingTipsScreen}
        options={{ title: 'Energy Saving Tips' }}
      />
      <Stack.Screen 
        name="RecyclingHistory" 
        component={RecyclingHistoryScreen}
        options={{ title: 'Recycling History' }}
      />
      <Stack.Screen 
        name="EnergyHistory" 
        component={EnergyHistoryScreen}
        options={{ title: 'Energy History' }}
      />
      <Stack.Screen 
        name="AutomationRules" 
        component={AutomationRulesScreen}
        options={{ title: 'Automation Rules' }}
      />
      <Stack.Screen 
        name="CreateAutomation" 
        component={CreateAutomationScreen}
        options={{ title: 'Create Automation' }}
      />
    </Stack.Navigator>
  );
} 