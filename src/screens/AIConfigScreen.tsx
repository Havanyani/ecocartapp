import { useAIAssistant } from '@/providers/AIAssistantProvider';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface AIConfigScreenProps {
  navigation: any;
}

export default function AIConfigScreen({ navigation }: AIConfigScreenProps) {
  const theme = useTheme()()();
  const { isAIConfigured, aiServiceName, configureAI } = useAIAssistant();
  
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hideApiKey, setHideApiKey] = useState(true);
  
  const handleSaveConfig = async () => {
    if (!apiKey.trim()) {
      Alert.alert(
        'Missing API Key',
        'Please enter your API key to configure the AI service.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await configureAI(apiKey);
      
      if (success) {
        Alert.alert(
          'Configuration Successful',
          'The AI service has been configured successfully.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Configuration Failed',
          'Failed to configure the AI service. Please check your API key and try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error configuring AI service:', error);
      Alert.alert(
        'Error',
        'An error occurred while configuring the AI service.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          AI Assistant Configuration
        </Text>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusLabel, { color: theme.colors.text }]}>
              AI Service Status:
            </Text>
            <View style={styles.statusIndicatorContainer}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: isAIConfigured ? theme.colors.success : theme.colors.error }
                ]}
              />
              <Text style={[styles.statusText, { color: theme.colors.text }]}>
                {isAIConfigured 
                  ? `Connected (${aiServiceName || 'Unknown Service'})` 
                  : 'Not Configured'}
              </Text>
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              OpenAI Configuration
            </Text>
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
              To enable AI functionality, you need to provide your OpenAI API key. 
              Visit https://platform.openai.com/api-keys to get your API key.
            </Text>
            
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              API Key
            </Text>
            <View style={styles.apiKeyContainer}>
              <TextInput
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="Enter your OpenAI API key"
                placeholderTextColor={theme.colors.textSecondary}
                style={[
                  styles.input,
                  { 
                    color: theme.colors.text,
                    backgroundColor: theme.dark ? '#333333' : '#F1F1F1' 
                  }
                ]}
                secureTextEntry={hideApiKey}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="API Key input"
              />
              <TouchableOpacity
                onPress={() => setHideApiKey(!hideApiKey)}
                style={styles.visibilityButton}
                accessibilityLabel={hideApiKey ? "Show API key" : "Hide API key"}
                accessibilityRole="button"
              >
                <Ionicons 
                  name={hideApiKey ? "eye" : "eye-off"} 
                  size={24} 
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle-outline" size={20} color={theme.colors.secondary} />
            <Text style={[styles.noteText, { color: theme.colors.textSecondary }]}>
              Your API key is stored securely on your device and is never shared with our servers.
              Usage charges from OpenAI apply based on your account.
            </Text>
          </View>
        </ScrollView>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: theme.colors.primary },
              isSubmitting && styles.disabledButton
            ]}
            onPress={handleSaveConfig}
            disabled={isSubmitting}
            accessibilityLabel="Save configuration"
            accessibilityRole="button"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Configuration</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  backButton: {
    padding: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  apiKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visibilityButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  noteText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 24,
  },
  saveButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
}); 