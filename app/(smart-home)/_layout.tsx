import { useTheme } from '@/hooks/useTheme';
import { Stack } from 'expo-router';

export default function SmartHomeLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Smart Home',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="device-discovery"
        options={{
          title: 'Discover Devices',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="device-details"
        options={{
          title: 'Device Details',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="device-control"
        options={{
          title: 'Device Control',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="device-settings"
        options={{
          title: 'Device Settings',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="appliance-schedule"
        options={{
          title: 'Schedule Appliance',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="energy-usage"
        options={{
          title: 'Energy Usage',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="energy-saving-tips"
        options={{
          title: 'Energy Saving Tips',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="recycling-history"
        options={{
          title: 'Recycling History',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="energy-history"
        options={{
          title: 'Energy History',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="automation-rules"
        options={{
          title: 'Automation Rules',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="create-automation"
        options={{
          title: 'Create Automation',
          headerShown: true,
        }}
      />
    </Stack>
  );
} 