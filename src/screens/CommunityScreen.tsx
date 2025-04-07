import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { StyleSheet } from 'react-native';
import { CommunityFeed } from '../components/community/CommunityFeed';
import { Leaderboard } from '../components/community/Leaderboard';
import { UserProfile } from '../components/community/UserProfile';
import { ThemedText } from '../components/ui/ThemedText';
import { ThemedView } from '../components/ui/ThemedView';
import { useTheme } from '../hooks/useTheme';

const Tab = createMaterialTopTabNavigator();

function TabBarLabel({ focused, children }: { focused: boolean; children: string }) {
  const theme = useTheme();
  return (
    <ThemedText
      style={[
        styles.tabLabel,
        {
          color: focused ? theme.theme.colors.primary : theme.theme.colors.text,
          fontWeight: focused ? 'bold' : 'normal',
        },
      ]}
    >
      {children}
    </ThemedText>
  );
}

export function CommunityScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: theme.theme.colors.background,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarIndicatorStyle: {
            backgroundColor: theme.theme.colors.primary,
          },
          tabBarLabel: ({ focused, children }) => (
            <TabBarLabel focused={focused}>{children}</TabBarLabel>
          ),
        }}
      >
        <Tab.Screen
          name="Feed"
          component={CommunityFeed}
          options={{
            title: 'Community Feed',
          }}
        />
        <Tab.Screen
          name="Profile"
          component={UserProfile}
          options={{
            title: 'My Profile',
          }}
        />
        <Tab.Screen
          name="Leaderboard"
          component={Leaderboard}
          options={{
            title: 'Leaderboard',
          }}
        />
      </Tab.Navigator>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabLabel: {
    fontSize: 14,
    textTransform: 'none',
  },
}); 