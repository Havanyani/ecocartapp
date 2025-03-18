import ThemeSwitcher from '@/components/ThemeSwitcher';
import { ThemeName, useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ThemeOptionProps {
  name: string;
  themeName: ThemeName;
  isSelected: boolean;
  onSelect: () => void;
  iconName: keyof typeof Ionicons.glyphMap;
}

function ThemeOption({ name, isSelected, onSelect, iconName }: ThemeOptionProps) {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.themeOption,
        {
          backgroundColor: isSelected ? theme.colors.primary + '20' : theme.colors.card,
          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
        },
      ]}
      onPress={onSelect}
    >
      <Ionicons 
        name={iconName} 
        size={24} 
        color={isSelected ? theme.colors.primary : theme.colors.text} 
      />
      <Text
        style={[
          styles.themeOptionText,
          { color: isSelected ? theme.colors.primary : theme.colors.text },
        ]}
      >
        {name}
      </Text>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
      )}
    </TouchableOpacity>
  );
}

export default function AppearanceScreen() {
  const router = useRouter();
  const { theme, themePreferences, setTheme } = useTheme();

  const themeOptions: Array<{
    name: string;
    value: ThemeName;
    icon: keyof typeof Ionicons.glyphMap;
  }> = [
    { name: 'Light', value: 'light', icon: 'sunny' },
    { name: 'Dark', value: 'dark', icon: 'moon' },
    { name: 'Sepia', value: 'sepia', icon: 'book' },
    { name: 'High Contrast', value: 'high-contrast', icon: 'contrast' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Appearance</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Theme Mode
          </Text>
          <ThemeSwitcher style={{ 
            ...styles.card, 
            backgroundColor: theme.colors.card
          }} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Theme Options
          </Text>
          <View 
            style={{ 
              ...styles.card, 
              backgroundColor: theme.colors.card 
            }}
          >
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              Choose a theme preset
            </Text>
            
            <View style={styles.themeOptionsContainer}>
              {themeOptions.map((option) => (
                <ThemeOption
                  key={option.value}
                  name={option.name}
                  themeName={option.value}
                  isSelected={
                    !themePreferences.useSystemTheme && 
                    themePreferences.themeName === option.value
                  }
                  onSelect={() => setTheme(option.value)}
                  iconName={option.icon}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Text Display
          </Text>
          <View 
            style={{ 
              ...styles.card, 
              backgroundColor: theme.colors.card 
            }}
          >
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              Text size and accessibility settings will be added in a future update
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  } as ViewStyle,
  cardText: {
    fontSize: 16,
    marginBottom: 16,
  },
  themeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  themeOptionText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
}); 