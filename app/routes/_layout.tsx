import { useTheme } from '@/hooks/useTheme';
import { Stack } from 'expo-router/stack';

export default function RoutesLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Route Management',
        }}
      />
      <Stack.Screen
        name="optimization-dashboard"
        options={{
          title: 'Route Optimization',
        }}
      />
      <Stack.Screen
        name="route-details"
        options={{
          title: 'Route Details',
        }}
      />
    </Stack>
  );
} 