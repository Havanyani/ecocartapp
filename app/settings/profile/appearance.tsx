import { StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../../../src/components/ui/ThemedText';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../../src/store';
import { selectPreferences, updatePreferences } from '../../../src/store/slices/userSlice';

export default function AppearanceScreen() {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const preferences = useAppSelector(selectPreferences);

  const handleDarkModeChange = (value: boolean) => {
    dispatch(updatePreferences({ darkMode: value }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.section}>
          <ThemedText variant="h2">Theme</ThemedText>
          <ThemedText variant="body-sm">
            Customize the app's appearance
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.settingItem}>
            <View>
              <ThemedText variant="body">Dark Mode</ThemedText>
              <ThemedText variant="body-sm" style={{ color: theme.colors.textSecondary }}>
                Use dark theme for better visibility in low light
              </ThemedText>
            </View>
            <Switch
              value={preferences.darkMode}
              onValueChange={handleDarkModeChange}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <ThemedText variant="body">System Theme</ThemedText>
              <ThemedText variant="body-sm" style={{ color: theme.colors.textSecondary }}>
                Follow system dark mode settings
              </ThemedText>
            </View>
            <Switch
              value={preferences.darkMode}
              onValueChange={handleDarkModeChange}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText variant="h2">Text Size</ThemedText>
          <ThemedText variant="body-sm">
            Adjust text size for better readability
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.settingItem}>
            <View>
              <ThemedText variant="body">Large Text</ThemedText>
              <ThemedText variant="body-sm" style={{ color: theme.colors.textSecondary }}>
                Use larger text throughout the app
              </ThemedText>
            </View>
            <Switch
              value={preferences.darkMode}
              onValueChange={handleDarkModeChange}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <ThemedText variant="body">Bold Text</ThemedText>
              <ThemedText variant="body-sm" style={{ color: theme.colors.textSecondary }}>
                Use bold text for better contrast
              </ThemedText>
            </View>
            <Switch
              value={preferences.darkMode}
              onValueChange={handleDarkModeChange}
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