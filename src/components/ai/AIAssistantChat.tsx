import { useTheme } from '@/theme';
import { useAIAssistant } from '@/providers/AIAssistantProvider';
import { AIMessage } from '@/services/ai/AIAssistantService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export interface AIAssistantChatProps {
  initialMessage?: string;
  showHeader?: boolean;
  maxHeight?: number | string;
  onClose?: () => void;
}

export function AIAssistantChat({
  initialMessage,
  showHeader = true,
  maxHeight = '80%',
  onClose
}: AIAssistantChatProps) {
  const theme = useTheme()()();
  const { 
    messages, 
    isProcessing, 
    isOffline, 
    isAIConfigured,
    aiServiceName,
    sendMessage, 
    suggestedQuestions, 
    refreshOfflineCache 
  } = useAIAssistant();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();
  
  // Send initial message if provided
  useEffect(() => {
    if (initialMessage && messages.length <= 1) {
      sendMessage(initialMessage);
    }
  }, [initialMessage, messages.length, sendMessage]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userInput = inputText;
    setInputText('');
    
    try {
      await sendMessage(userInput);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSuggestedQuestion = async (question: string) => {
    try {
      await sendMessage(question);
    } catch (error) {
      console.error('Error sending suggested question:', error);
    }
  };
  
  const handleRefreshOfflineCache = async () => {
    try {
      await refreshOfflineCache();
    } catch (error) {
      console.error('Error refreshing offline cache:', error);
    }
  };

  const navigateToConfig = () => {
    // @ts-ignore - Handle navigation typing properly
    navigation.navigate('AIConfigScreen');
  };

  const renderMessage = ({ item }: { item: AIMessage }) => {
    const isUserMessage = item.isUser;
    
    return (
      <View
        style={[
          styles.messageBubble,
          isUserMessage ? styles.userBubble : styles.aiBubble,
          isUserMessage 
            ? { backgroundColor: theme.colors.primary } 
            : { backgroundColor: theme.dark ? '#333333' : '#F1F1F1' },
        ]}
        accessibilityRole="text"
        accessibilityLabel={`${isUserMessage ? 'You' : 'Assistant'}: ${item.content}`}
      >
        {!isUserMessage && (
          <View style={styles.indicatorContainer}>
            {item.isOfflineResponse && (
              <View style={styles.messageIndicator}>
                <MaterialCommunityIcons 
                  name="wifi-off" 
                  size={14} 
                  color={theme.colors.textSecondary} 
                />
              </View>
            )}
            
            {item.isFAQ && (
              <View style={styles.messageIndicator}>
                <MaterialCommunityIcons 
                  name="frequently-asked-questions" 
                  size={14} 
                  color={theme.colors.textSecondary} 
                />
              </View>
            )}
          </View>
        )}
        
        <Text
          style={[
            styles.messageText,
            isUserMessage 
              ? { color: '#FFFFFF' } 
              : { color: theme.colors.text }
          ]}
        >
          {item.content}
        </Text>
        
        {!isUserMessage && item.isFAQ && (
          <Text
            style={[
              styles.faqSourceText,
              { color: theme.colors.primary }
            ]}
          >
            From EcoCart FAQ database
          </Text>
        )}
        
        <Text
          style={[
            styles.timestampText,
            isUserMessage 
              ? { color: '#FFFFFF' } 
              : { color: theme.colors.textSecondary }
          ]}
        >
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {showHeader && (
          <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              EcoCart Assistant
            </Text>
            <View style={styles.headerIconsContainer}>
              {!isAIConfigured && (
                <TouchableOpacity 
                  onPress={navigateToConfig}
                  style={styles.configButton}
                  accessibilityLabel="Configure AI service"
                  accessibilityHint="Set up the AI service for better responses"
                >
                  <Ionicons name="cog" size={20} color={theme.colors.primary} />
                  {aiServiceName ? (
                    <Text style={[styles.aiStatusText, { color: theme.colors.primary }]}>
                      {aiServiceName}
                    </Text>
                  ) : (
                    <Text style={[styles.aiStatusText, { color: theme.colors.primary }]}>
                      Set up AI
                    </Text>
                  )}
                </TouchableOpacity>
              )}
              {isOffline && (
                <View style={styles.offlineStatusContainer}>
                  <MaterialCommunityIcons name="wifi-off" size={16} color="#FF3B30" />
                  <Text style={[styles.offlineStatusText, { color: "#FF3B30" }]}>
                    Offline Mode
                  </Text>
                  <TouchableOpacity 
                    onPress={handleRefreshOfflineCache}
                    accessibilityLabel="Refresh offline cache"
                    accessibilityHint="Refreshes the offline response database"
                    style={styles.refreshButton}
                  >
                    <Ionicons name="refresh" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
              {isAIConfigured && (
                <TouchableOpacity 
                  onPress={navigateToConfig}
                  style={styles.aiConfiguredButton}
                  accessibilityLabel="AI service configured"
                >
                  <View style={styles.aiStatusDot} />
                  <Text style={styles.aiConfiguredText}>
                    {aiServiceName}
                  </Text>
                </TouchableOpacity>
              )}
              {onClose && (
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  accessibilityLabel="Close assistant"
                  accessibilityRole="button"
                >
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          style={{ backgroundColor: theme.colors.background }}
        />

        <View style={styles.suggestionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {suggestedQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.suggestionButton, { backgroundColor: theme.dark ? '#333333' : '#F1F1F1' }]}
                onPress={() => handleSuggestedQuestion(question)}
                accessibilityLabel={`Suggested question: ${question}`}
                accessibilityRole="button"
              >
                <Text style={[styles.suggestionText, { color: theme.colors.text }]}>
                  {question}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.background }]}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder={isOffline ? "Ask a basic recycling question..." : "Ask a question..."}
            placeholderTextColor={theme.colors.textSecondary}
            style={[styles.input, { 
              color: theme.colors.text, 
              backgroundColor: theme.dark ? '#333333' : '#F1F1F1' 
            }]}
            multiline
            onSubmitEditing={handleSend}
            accessibilityLabel="Message input"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={isProcessing || !inputText.trim()}
            style={[
              styles.sendButton,
              { opacity: isProcessing || !inputText.trim() ? 0.5 : 1 }
            ]}
            accessibilityLabel="Send message"
            accessibilityRole="button"
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Ionicons name="send" size={24} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginVertical: 4,
    maxWidth: '85%',
    position: 'relative',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    paddingRight: 22,
  },
  timestampText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 120,
  },
  sendButton: {
    padding: 10,
  },
  suggestionsContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  suggestionButton: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 14,
  },
  indicatorContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  messageIndicator: {
    marginLeft: 4,
    opacity: 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
    padding: 2,
  },
  faqSourceText: {
    fontSize: 10,
    marginTop: 4,
    marginBottom: 2,
    fontStyle: 'italic',
    opacity: 0.9,
  },
  offlineStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offlineStatusText: {
    fontSize: 12,
    marginLeft: 4,
  },
  refreshButton: {
    marginLeft: 8,
    padding: 2,
  },
  headerIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  configButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  aiStatusText: {
    fontSize: 12,
    marginLeft: 4,
  },
  aiConfiguredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  aiStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  aiConfiguredText: {
    fontSize: 12,
    color: '#4CAF50',
  },
}); 