import { StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../../../src/components/ui/ThemedText';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../../src/store';
import { selectPreferences, updatePreferences } from '../../../src/store/slices/userSlice';

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const preferences = useAppSelector(selectPreferences);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.section}>
          <ThemedText variant="h2">Push Notifications</ThemedText>
          <ThemedText variant="body-sm">
            Control which notifications you want to receive
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.settingItem}>
            <View>
              <ThemedText variant="body">Collection Reminders</ThemedText>
              <ThemedText variant="body-sm" style={{ color: theme.colors.textSecondary }}>
                Get notified about upcoming collections
              </ThemedText>
            </View>
            <Switch
              value={preferences.notifications}
              onValueChange={(value) => {
                dispatch(updatePreferences({ notifications: value }));
              }}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <ThemedText variant="body">Points Updates</ThemedText>
              <ThemedText variant="body-sm" style={{ color: theme.colors.textSecondary }}>
                Get notified when you earn points
              </ThemedText>
            </View>
            <Switch
              value={preferences.notifications}
              onValueChange={(value) => {
                dispatch(updatePreferences({ notifications: value }));
              }}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <ThemedText variant="body">Community Updates</ThemedText>
              <ThemedText variant="body-sm" style={{ color: theme.colors.textSecondary }}>
                Get notified about community milestones
              </ThemedText>
            </View>
            <Switch
              value={preferences.notifications}
              onValueChange={(value) => {
                dispatch(updatePreferences({ notifications: value }));
              }}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText variant="h2">Email Notifications</ThemedText>
          <ThemedText variant="body-sm">
            Control which emails you want to receive
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.settingItem}>
            <View>
              <ThemedText variant="body">Monthly Summary</ThemedText>
              <ThemedText variant="body-sm" style={{ color: theme.colors.textSecondary }}>
                Get a monthly summary of your impact
              </ThemedText>
            </View>
            <Switch
              value={preferences.notifications}
              onValueChange={(value) => {
                dispatch(updatePreferences({ notifications: value }));
              }}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <ThemedText variant="body">News & Updates</ThemedText>
              <ThemedText variant="body-sm" style={{ color: theme.colors.textSecondary }}>
                Get updates about new features and tips
              </ThemedText>
            </View>
            <Switch
              value={preferences.notifications}
              onValueChange={(value) => {
                dispatch(updatePreferences({ notifications: value }));
              }}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
}); 