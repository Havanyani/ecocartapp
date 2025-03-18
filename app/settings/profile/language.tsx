import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../../../src/components/ui/ThemedText';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../../src/store';
import { selectPreferences, updatePreferences } from '../../../src/store/slices/userSlice';

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
];

export default function LanguageScreen() {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const preferences = useAppSelector(selectPreferences);

  const handleLanguageChange = (code: string) => {
    dispatch(updatePreferences({ language: code }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.section}>
          <ThemedText variant="h2">App Language</ThemedText>
          <ThemedText variant="body-sm">
            Choose your preferred language
          </ThemedText>
        </View>

        <ScrollView style={styles.languageList}>
          {languages.map(language => (
            <Pressable
              key={language.code}
              style={[
                styles.languageItem,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor:
                    language.code === preferences.language
                      ? theme.colors.primary
                      : 'transparent',
                },
              ]}
              onPress={() => handleLanguageChange(language.code)}
            >
              <View>
                <ThemedText variant="body">{language.name}</ThemedText>
                <ThemedText variant="body-sm" style={{ color: theme.colors.textSecondary }}>
                  {language.native}
                </ThemedText>
              </View>
              {language.code === preferences.language && (
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              )}
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 16,
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
  },
}); 