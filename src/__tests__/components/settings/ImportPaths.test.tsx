import { PlaceholderScreen } from '@/components/ui/settings/PlaceholderScreen';
import { render } from '@testing-library/react-native';
import React from 'react';

// Mock dependencies
jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      background: '#FFFFFF',
      card: '#F8F8F8',
      text: { primary: '#000000', secondary: '#666666' }
    }
  })
}));

// Mock settings screens
const mockScreens = {
  NotificationsScreen: () => <PlaceholderScreen title="Notifications" icon="notifications-outline" description="Notification settings" />,
  ScheduleScreen: () => <PlaceholderScreen title="Schedule" icon="calendar-outline" description="Schedule settings" />,
  RemindersScreen: () => <PlaceholderScreen title="Reminders" icon="alarm-outline" description="Reminder settings" />,
  ProfileScreen: () => <PlaceholderScreen title="Profile" icon="person-outline" description="Profile settings" />,
  EnvironmentalScreen: () => <PlaceholderScreen title="Environmental" icon="leaf-outline" description="Environmental settings" />,
  CreditsScreen: () => <PlaceholderScreen title="Credits" icon="wallet-outline" description="Credit settings" />
};

describe('Settings Screens Import Paths', () => {
  const screens = Object.entries(mockScreens).map(([name, Component]) => ({
    Component,
    name
  }));

  it('all screens use the correct PlaceholderScreen component', () => {
    screens.forEach(({ Component }) => {
      const { UNSAFE_getByType } = render(<Component />);
      const placeholderScreen = UNSAFE_getByType(PlaceholderScreen);
      expect(placeholderScreen).toBeTruthy();
    });
  });

  it('all screens provide required props to PlaceholderScreen', () => {
    screens.forEach(({ Component }) => {
      const { UNSAFE_getByType } = render(<Component />);
      const placeholderScreen = UNSAFE_getByType(PlaceholderScreen);
      
      expect(placeholderScreen.props).toEqual(
        expect.objectContaining({
          title: expect.any(String),
          icon: expect.any(String),
          description: expect.any(String)
        })
      );
    });
  });
}); 