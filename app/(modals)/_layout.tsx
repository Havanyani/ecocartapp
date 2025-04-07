import { useTheme } from '@/hooks/useTheme';
import { Stack } from 'expo-router';

export default function ModalsLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        animation: 'slide_from_bottom',
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    />
  );
} 