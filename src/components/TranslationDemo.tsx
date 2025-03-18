import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n, { formatters, SUPPORTED_LANGUAGES, translate, type TranslationKey } from '@/utils/i18n';

interface TranslationExample {
  key: TranslationKey;
  params?: Record<string, string | number>;
  description: string;
}

export function TranslationDemo() {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.locale);
  const [customAmount, setCustomAmount] = useState('100');
  const [customLevel, setCustomLevel] = useState('Gold');

  // Example translation keys with descriptions
  const examples: TranslationExample[] = [
    { key: 'welcome', description: 'Basic translation' },
    { key: 'collection.title' as TranslationKey, description: 'Nested translation' },
    { 
      key: 'notifications.creditEarned' as TranslationKey, 
      params: { amount: customAmount },
      description: 'Translation with number parameter' 
    },
    { 
      key: 'notifications.levelUp' as TranslationKey, 
      params: { level: customLevel },
      description: 'Translation with text parameter' 
    },
    { 
      key: 'environmental.impact.title' as TranslationKey, 
      description: 'Environmental section title' 
    }
  ];

  // Format examples
  const formatExamples = [
    { value: 1234.56, type: 'currency', description: 'Currency format' },
    { value: 2.5, type: 'weight', description: 'Weight format' }
  ];

  // Switch language and update translations
  const switchLanguage = (lang: string) => {
    i18n.locale = lang;
    setCurrentLanguage(lang);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Translation Demo</Text>
        
        {/* Language Switcher */}
        <View style={styles.languageContainer}>
          {SUPPORTED_LANGUAGES.map(lang => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.languageButton,
                currentLanguage === lang && styles.activeLanguage
              ]}
              onPress={() => switchLanguage(lang)}
            >
              <Text style={[
                styles.languageText,
                currentLanguage === lang && styles.activeLanguageText
              ]}>
                {lang.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Parameter Inputs */}
        <View style={styles.inputContainer}>
          <Text style={styles.sectionTitle}>Custom Parameters</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Amount:</Text>
            <TextInput
              style={styles.input}
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Level:</Text>
            <TextInput
              style={styles.input}
              value={customLevel}
              onChangeText={setCustomLevel}
              placeholder="Enter level"
            />
          </View>
        </View>

        {/* Translation Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Translation Examples</Text>
          {examples.map((example, index) => (
            <View key={index} style={styles.translationItem}>
              <Text style={styles.descriptionText}>{example.description}</Text>
              <Text style={styles.keyText}>{example.key}</Text>
              <Text style={styles.valueText}>
                {translate(example.key, example.params)}
              </Text>
            </View>
          ))}
        </View>

        {/* Formatting Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Formatting Examples</Text>
          {formatExamples.map((example, index) => (
            <View key={index} style={styles.translationItem}>
              <Text style={styles.descriptionText}>{example.description}</Text>
              <Text style={styles.valueText}>
                {example.type === 'currency' 
                  ? formatters.formatCurrency(example.value)
                  : formatters.formatWeight(example.value)
                }
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  languageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  languageButton: {
    padding: 8,
    margin: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    minWidth: 48,
    alignItems: 'center',
  },
  activeLanguage: {
    backgroundColor: '#007AFF',
  },
  languageText: {
    color: '#333',
    fontWeight: '500',
  },
  activeLanguageText: {
    color: '#fff',
  },
  inputContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    width: 80,
    fontSize: 16,
    color: '#666',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  translationItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  keyText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default TranslationDemo; 