import { MessagingService } from '@/services/MessagingService';
import { UserService } from '@/services/UserService';
import { Message, MessageStatus, MessageType } from '@/types/Message';
import { User } from '@/types/User';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { formatRelative } from 'date-fns';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Current user ID - would come from authentication service in a real app
const CURRENT_USER_ID = '1';

type ChatRouteParams = {
  conversationId: string;
  title: string;
};

export default function ChatScreen() {
  const route = useRoute<RouteProp<Record<string, ChatRouteParams>, string>>();
  const { conversationId, title } = route.params;
  const navigation = useNavigation();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [participants, setParticipants] = useState<Record<string, User>>({});
  
  const flatListRef = useRef<FlatList>(null);

  // Set navigation options
  useEffect(() => {
    navigation.setOptions({
      headerTitle: title,
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton} onPress={handleInfo}>
          <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, title]);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const conversationMessages = await MessagingService.getConversationMessages(conversationId);
      setMessages(conversationMessages);
      
      // Mark conversation as read
      await MessagingService.markConversationAsRead(conversationId, CURRENT_USER_ID);
      
      // Load participant data
      const conversation = await MessagingService.getConversation(conversationId);
      if (conversation) {
        const participantIds = conversation.participants.map(p => p.userId);
        
        const participantsData = await Promise.all(
          participantIds.map(async (userId) => {
            const userData = await UserService.getUser(userId);
            return { userId, userData };
          })
        );
        
        const participantsMap: Record<string, User> = {};
        participantsData.forEach(({ userId, userData }) => {
          participantsMap[userId] = userData;
        });
        
        setParticipants(participantsMap);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleInfo = () => {
    // Navigate to conversation info screen
    navigation.navigate('ConversationInfo' as never, { 
      conversationId 
    } as never);
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    
    const trimmedMessage = inputMessage.trim();
    setInputMessage('');
    setSendingMessage(true);
    
    try {
      const newMessage = await MessagingService.sendMessage({
        conversationId,
        senderId: CURRENT_USER_ID,
        content: trimmedMessage,
        timestamp: new Date().toISOString(),
        type: MessageType.TEXT,
        attachments: [],
      });
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error toast
    } finally {
      setSendingMessage(false);
    }
  };

  const handleReaction = (message: Message, emoji: string) => {
    // Check if user already reacted with this emoji
    const alreadyReacted = message.reactions.some(
      reaction => reaction.userId === CURRENT_USER_ID && reaction.emoji === emoji
    );
    
    if (alreadyReacted) {
      MessagingService.removeMessageReaction(
        conversationId,
        message.id,
        CURRENT_USER_ID,
        emoji
      );
      
      // Update UI optimistically
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.id === message.id) {
            return {
              ...msg,
              reactions: msg.reactions.filter(
                reaction => !(reaction.userId === CURRENT_USER_ID && reaction.emoji === emoji)
              ),
            };
          }
          return msg;
        })
      );
    } else {
      MessagingService.addMessageReaction(
        conversationId,
        message.id,
        CURRENT_USER_ID,
        emoji
      );
      
      // Update UI optimistically
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.id === message.id) {
            return {
              ...msg,
              reactions: [
                ...msg.reactions,
                {
                  userId: CURRENT_USER_ID,
                  emoji,
                  timestamp: new Date().toISOString(),
                },
              ],
            };
          }
          return msg;
        })
      );
    }
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      return formatRelative(new Date(timestamp), new Date());
    } catch (error) {
      return '';
    }
  };

  const renderMessageStatus = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.SENDING:
        return <Text style={styles.messageStatus}>Sending...</Text>;
      case MessageStatus.SENT:
        return <Text style={styles.messageStatus}>Sent</Text>;
      case MessageStatus.DELIVERED:
        return <Text style={styles.messageStatus}>Delivered</Text>;
      case MessageStatus.READ:
        return <Text style={styles.messageStatus}>Read</Text>;
      case MessageStatus.FAILED:
        return <Text style={styles.messageStatus}>Failed</Text>;
      default:
        return null;
    }
  };

  const renderReactions = (message: Message) => {
    if (message.reactions.length === 0) return null;
    
    // Group reactions by emoji
    const groupedReactions: Record<string, number> = {};
    message.reactions.forEach(reaction => {
      groupedReactions[reaction.emoji] = (groupedReactions[reaction.emoji] || 0) + 1;
    });
    
    return (
      <View style={styles.reactionsContainer}>
        {Object.entries(groupedReactions).map(([emoji, count]) => (
          <TouchableOpacity 
            key={emoji} 
            style={[
              styles.reactionBadge,
              message.reactions.some(r => r.userId === CURRENT_USER_ID && r.emoji === emoji) 
                ? styles.reactionBadgeSelected 
                : null
            ]}
            onPress={() => handleReaction(message, emoji)}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
            {count > 1 && <Text style={styles.reactionCount}>{count}</Text>}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === CURRENT_USER_ID;
    const user = item.senderId === 'system' 
      ? { name: 'System' } 
      : participants[item.senderId];
      
    const displayName = user?.name || 'Unknown User';
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        {!isCurrentUser && item.senderId !== 'system' && (
          <Image 
            source={{ uri: `https://i.pravatar.cc/150?u=${item.senderId}` }} 
            style={styles.avatar} 
          />
        )}
        
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          item.senderId === 'system' && styles.systemBubble
        ]}>
          {!isCurrentUser && item.senderId !== 'system' && (
            <Text style={styles.senderName}>{displayName}</Text>
          )}
          
          <Text style={[
            styles.messageText,
            item.senderId === 'system' && styles.systemText
          ]}>
            {item.isDeleted ? 'This message was deleted' : item.content}
          </Text>
          
          <Text style={styles.messageTime}>
            {formatMessageTime(item.timestamp)}
          </Text>
          
          {isCurrentUser && renderMessageStatus(item.status)}
        </View>
        
        {renderReactions(item)}
        
        {!item.isDeleted && (
          <TouchableOpacity 
            style={styles.reactionButton}
            onPress={() => handleReaction(item, '❤️')}
          >
            <Ionicons name="heart-outline" size={16} color="#8A8A8E" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
        )}
        
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Message"
            placeholderTextColor="#8A8A8E"
            multiline
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!inputMessage.trim() || sendingMessage) && styles.sendButtonDisabled
            ]} 
            onPress={handleSend}
            disabled={!inputMessage.trim() || sendingMessage}
          >
            {sendingMessage ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
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
    backgroundColor: '#F6F6F6',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: '100%',
  },
  currentUserBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#E9E9EB',
    borderBottomLeftRadius: 4,
  },
  systemBubble: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    alignSelf: 'center',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: '#8A8A8E',
  },
  messageText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 22,
  },
  systemText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#8A8A8E',
    fontStyle: 'italic',
  },
  messageTime: {
    fontSize: 11,
    color: '#8A8A8E',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageStatus: {
    fontSize: 10,
    color: '#8A8A8E',
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  headerButton: {
    paddingHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#B0C4DE',
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    marginLeft: 8,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  reactionBadgeSelected: {
    backgroundColor: '#E3F2FD',
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 12,
    marginLeft: 2,
  },
  reactionButton: {
    padding: 4,
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
}); 