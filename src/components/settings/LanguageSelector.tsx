import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export function LanguageSelector() {
  const theme = useTheme()()();
  const { currentLang, changeLanguage, supportedLanguages } = useLanguage();

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Language</ThemedText>
      <View style={styles.languageGrid}>
        {Object.entries(supportedLanguages).map(([code, { name, isRTL }]) => (
          <TouchableOpacity
            key={code}
            style={[
              styles.languageButton,
              currentLang === code && styles.selectedLanguage,
            ]}
            onPress={() => changeLanguage(code as keyof typeof supportedLanguages)}
            testID={`language-${code}`}
          >
            <View style={styles.languageContent}>
              <ThemedText style={styles.languageName}>{name}</ThemedText>
              {isRTL && (
                <IconSymbol
                  name="text-direction-rtl"
                  size={16}
                  color={theme.colors.text}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    minWidth: '45%',
  },
  selectedLanguage: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 