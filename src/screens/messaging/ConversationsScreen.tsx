import { MessagingService } from '@/services/MessagingService';
import { UserService } from '@/services/UserService';
import { Conversation, ConversationType } from '@/types/Message';
import { User } from '@/types/User';
import { getSimpleId } from '@/utils/idUtils';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Current user ID - would come from authentication service in a real app
const CURRENT_USER_ID = '1';

export default function ConversationsScreen() {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userCache, setUserCache] = useState<Record<string, User>>({});

  const loadConversations = useCallback(async () => {
    try {
      const userConversations = await MessagingService.getConversations(CURRENT_USER_ID);
      setConversations(userConversations);
      
      // Preload user data for conversation titles
      const userIds = new Set<string>();
      userConversations.forEach(conversation => {
        if (conversation.type === ConversationType.DIRECT) {
          const otherUserId = getSimpleId(conversation, CURRENT_USER_ID);
          if (otherUserId) {
            userIds.add(otherUserId);
          }
        }
      });
      
      const userDataPromises = Array.from(userIds).map(async (userId) => {
        const userData = await UserService.getUser(userId);
        return { userId, userData };
      });
      
      const usersData = await Promise.all(userDataPromises);
      const newUserCache: Record<string, User> = {};
      
      usersData.forEach(({ userId, userData }) => {
        newUserCache[userId] = userData;
      });
      
      setUserCache(prevCache => ({ ...prevCache, ...newUserCache }));
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleNewMessage = () => {
    // Navigate to new message screen (contacts list)
    navigation.navigate('NewMessage' as never);
  };

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate('Chat' as never, { 
      conversationId: conversation.id,
      title: getConversationTitle(conversation)
    } as never);
  };

  const getConversationTitle = (conversation: Conversation): string => {
    if (conversation.type === ConversationType.GROUP) {
      return conversation.title || 'Group Chat';
    }
    
    const otherUserId = getSimpleId(conversation, CURRENT_USER_ID);
    const userData = userCache[otherUserId];
    
    return userData?.name || 'Chat';
  };

  const getLastMessagePreview = (conversation: Conversation): string => {
    if (!conversation.lastMessage) {
      return 'Start a conversation';
    }
    
    if (conversation.lastMessage.isDeleted) {
      return 'This message was deleted';
    }
    
    // Check if message is from current user
    const isSelf = conversation.lastMessage.senderId === CURRENT_USER_ID;
    const prefix = isSelf ? 'You: ' : '';
    
    return `${prefix}${conversation.lastMessage.content.substring(0, 40)}${
      conversation.lastMessage.content.length > 40 ? '...' : ''
    }`;
  };

  const getLastMessageTime = (conversation: Conversation): string => {
    if (!conversation.lastMessage) {
      return formatDistanceToNow(new Date(conversation.createdAt), { addSuffix: true });
    }
    
    return formatDistanceToNow(new Date(conversation.lastMessage.timestamp), { addSuffix: true });
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const unreadCount = item.participants.find(
      p => p.userId === CURRENT_USER_ID
    )?.unreadCount || 0;
    
    return (
      <TouchableOpacity 
        style={styles.conversationItem} 
        onPress={() => handleConversationPress(item)}
      >
        <View style={styles.avatarContainer}>
          {item.type === ConversationType.GROUP ? (
            <View style={styles.groupAvatar}>
              <Ionicons name="people" size={24} color="white" />
            </View>
          ) : (
            <Image 
              source={{ 
                uri: `https://i.pravatar.cc/150?u=${getSimpleId(item, CURRENT_USER_ID)}` 
              }} 
              style={styles.avatar} 
            />
          )}
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {getConversationTitle(item)}
            </Text>
            <Text style={styles.time}>{getLastMessageTime(item)}</Text>
          </View>
          
          <View style={styles.previewRow}>
            <Text style={[
              styles.preview,
              unreadCount > 0 && styles.unreadPreview
            ]} numberOfLines={1}>
              {getLastMessagePreview(item)}
            </Text>
            
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Messages</Text>
        <TouchableOpacity 
          style={styles.newButton} 
          onPress={handleNewMessage}
        >
          <Ionicons name="create-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={64} color="#cccccc" />
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>
            Start a new conversation by tapping the compose button
          </Text>
          <TouchableOpacity 
            style={styles.newConversationButton} 
            onPress={handleNewMessage}
          >
            <Text style={styles.newConversationText}>New Message</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  newButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4B7BEC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#8A8A8E',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preview: {
    fontSize: 14,
    color: '#8A8A8E',
    flex: 1,
    marginRight: 8,
  },
  unreadPreview: {
    fontWeight: '500',
    color: '#000000',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8A8A8E',
    textAlign: 'center',
    marginBottom: 24,
  },
  newConversationButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  newConversationText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
}); 