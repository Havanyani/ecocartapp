/**
 * MessagingService.ts
 * 
 * Service for handling user-to-user messaging functionality.
 */

import {
    Conversation,
    ConversationFilters,
    ConversationType,
    Message,
    MessageDraft,
    MessageStatus,
    MessageType,
    MessagingNotificationSettings
} from '@/types/Message';
import { User } from '@/types/User';
import { getSimpleId } from '@/utils/idUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from './UserService';

// AsyncStorage keys
const CONVERSATIONS_KEY = 'messaging_conversations';
const MESSAGES_KEY = 'messaging_messages';
const NOTIFICATION_SETTINGS_KEY = 'messaging_notification_settings';

// Add the getUser method to UserService that's being used in MessagingService
// This extends the current UserService with a new method
UserService.getUser = async (userId: string): Promise<User> => {
  // This is a simplified implementation that returns mock data
  // In a real app, this would call an API endpoint
  return {
    id: userId,
    name: `User ${userId}`,
    metrics: {
      totalPlasticCollected: Math.random() * 100,
      credits: Math.floor(Math.random() * 500),
      carbonFootprintReduced: Math.random() * 200
    }
  };
};

/**
 * Service for handling user-to-user messaging
 */
export class MessagingService {
  /**
   * Get all conversations for a user
   */
  static async getConversations(
    userId: string,
    filters?: ConversationFilters
  ): Promise<Conversation[]> {
    try {
      const conversationsJson = await AsyncStorage.getItem(CONVERSATIONS_KEY);
      const conversations: Conversation[] = conversationsJson ? JSON.parse(conversationsJson) : [];
      
      // Filter conversations to include only those the user is a participant in
      let userConversations = conversations.filter(conversation => 
        conversation.participants.some(participant => participant.userId === userId)
      );
      
      // Apply additional filters if provided
      if (filters) {
        if (filters.search && filters.search.trim() !== '') {
          const searchTerm = filters.search.toLowerCase().trim();
          userConversations = userConversations.filter(conversation => {
            if (conversation.name && conversation.name.toLowerCase().includes(searchTerm)) {
              return true;
            }
            
            if (conversation.lastMessagePreview && 
                conversation.lastMessagePreview.toLowerCase().includes(searchTerm)) {
              return true;
            }
            
            // For direct conversations, check the other participant's name
            if (conversation.type === ConversationType.DIRECT) {
              const otherParticipantId = conversation.participants
                .find(p => p.userId !== userId)?.userId;
                
              if (otherParticipantId) {
                const otherUser = await UserService.getUser(otherParticipantId);
                return otherUser?.name.toLowerCase().includes(searchTerm) || false;
              }
            }
            
            return false;
          });
        }
        
        if (filters.hasUnreadMessages === true) {
          userConversations = userConversations.filter(
            conversation => (conversation.unreadCount || 0) > 0
          );
        }
        
        if (filters.participantIds && filters.participantIds.length > 0) {
          userConversations = userConversations.filter(conversation => 
            filters.participantIds!.every(id =>
              conversation.participants.some(p => p.userId === id)
            )
          );
        }
      }
      
      // Sort conversations by last message timestamp (most recent first)
      userConversations.sort((a, b) => {
        const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
        const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;
        return timeB - timeA;
      });
      
      return userConversations;
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }
  
  /**
   * Get a specific conversation by ID
   */
  static async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const conversationsJson = await AsyncStorage.getItem(CONVERSATIONS_KEY);
      const conversations: Conversation[] = conversationsJson ? JSON.parse(conversationsJson) : [];
      
      return conversations.find(conversation => conversation.id === conversationId) || null;
    } catch (error) {
      console.error(`Error getting conversation ${conversationId}:`, error);
      return null;
    }
  }
  
  /**
   * Create a new direct conversation between two users
   */
  static async createDirectConversation(
    currentUserId: string,
    otherUserId: string
  ): Promise<Conversation> {
    try {
      // Check if a conversation already exists between these users
      const existingConversation = await this.findDirectConversation(currentUserId, otherUserId);
      if (existingConversation) {
        return existingConversation;
      }
      
      // Create a new conversation
      const now = new Date().toISOString();
      
      const newConversation: Conversation = {
        id: uuidv4(),
        type: ConversationType.DIRECT,
        participants: [
          { userId: currentUserId, joinedAt: now },
          { userId: otherUserId, joinedAt: now }
        ],
        createdAt: now,
        updatedAt: now,
        unreadCount: 0,
      };
      
      // Save the new conversation
      const conversationsJson = await AsyncStorage.getItem(CONVERSATIONS_KEY);
      const conversations: Conversation[] = conversationsJson ? JSON.parse(conversationsJson) : [];
      
      await AsyncStorage.setItem(
        CONVERSATIONS_KEY,
        JSON.stringify([...conversations, newConversation])
      );
      
      return newConversation;
    } catch (error) {
      console.error('Error creating direct conversation:', error);
      throw error;
    }
  }
  
  /**
   * Create a new group conversation
   */
  static async createGroupConversation(
    name: string,
    creatorUserId: string,
    participantIds: string[]
  ): Promise<Conversation> {
    try {
      // Make sure the creator is included in participants
      if (!participantIds.includes(creatorUserId)) {
        participantIds.push(creatorUserId);
      }
      
      // Create a new conversation
      const now = new Date().toISOString();
      
      const newConversation: Conversation = {
        id: uuidv4(),
        type: ConversationType.GROUP,
        name,
        participants: participantIds.map(userId => ({
          userId,
          joinedAt: now,
          isAdmin: userId === creatorUserId
        })),
        createdAt: now,
        updatedAt: now,
        unreadCount: 0,
      };
      
      // Save the new conversation
      const conversationsJson = await AsyncStorage.getItem(CONVERSATIONS_KEY);
      const conversations: Conversation[] = conversationsJson ? JSON.parse(conversationsJson) : [];
      
      await AsyncStorage.setItem(
        CONVERSATIONS_KEY,
        JSON.stringify([...conversations, newConversation])
      );
      
      return newConversation;
    } catch (error) {
      console.error('Error creating group conversation:', error);
      throw error;
    }
  }
  
  /**
   * Send a message to a conversation
   */
  static async sendMessage(
    draft: MessageDraft,
    senderId: string,
    type: MessageType = MessageType.TEXT
  ): Promise<Message> {
    try {
      // Get the conversation
      const conversation = await this.getConversation(draft.conversationId);
      if (!conversation) {
        throw new Error(`Conversation ${draft.conversationId} not found`);
      }
      
      // Create a new message
      const now = new Date().toISOString();
      
      const newMessage: Message = {
        id: uuidv4(),
        conversationId: draft.conversationId,
        senderId,
        content: draft.content,
        status: MessageStatus.SENT,
        type,
        timestamp: now,
        attachments: draft.attachments,
        replyToMessageId: draft.replyToMessageId,
      };
      
      // Save the new message
      const messagesJson = await AsyncStorage.getItem(MESSAGES_KEY);
      const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : [];
      
      await AsyncStorage.setItem(
        MESSAGES_KEY,
        JSON.stringify([...messages, newMessage])
      );
      
      // Update the conversation with the last message
      await this.updateConversationLastMessage(
        draft.conversationId,
        newMessage.id,
        this.getMessagePreview(newMessage),
        now
      );
      
      // Update unread count for all participants except the sender
      await this.incrementUnreadCount(
        draft.conversationId,
        senderId
      );
      
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  /**
   * Get messages for a conversation
   */
  static async getConversationMessages(
    conversationId: string,
    limit: number = 20,
    before?: string
  ): Promise<Message[]> {
    try {
      const messagesJson = await AsyncStorage.getItem(MESSAGES_KEY);
      const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : [];
      
      // Filter messages for this conversation
      let conversationMessages = messages.filter(
        message => message.conversationId === conversationId
      );
      
      // If "before" is provided, only get messages before that timestamp
      if (before) {
        const beforeTime = new Date(before).getTime();
        conversationMessages = conversationMessages.filter(
          message => new Date(message.timestamp).getTime() < beforeTime
        );
      }
      
      // Sort by timestamp (newest first) and limit the number of messages
      conversationMessages.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      return conversationMessages.slice(0, limit);
    } catch (error) {
      console.error(`Error getting messages for conversation ${conversationId}:`, error);
      return [];
    }
  }
  
  /**
   * Mark messages as read for a user in a conversation
   */
  static async markConversationAsRead(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Get the conversation
      const conversation = await this.getConversation(conversationId);
      if (!conversation) {
        return false;
      }
      
      // Update the participant's last read timestamp
      const now = new Date().toISOString();
      
      const conversationsJson = await AsyncStorage.getItem(CONVERSATIONS_KEY);
      const conversations: Conversation[] = conversationsJson ? JSON.parse(conversationsJson) : [];
      
      const updatedConversations = conversations.map(c => {
        if (c.id === conversationId) {
          // Update the participant's last read timestamp
          const updatedParticipants = c.participants.map(p => {
            if (p.userId === userId) {
              return { ...p, lastReadTimestamp: now };
            }
            return p;
          });
          
          // Reset unread count for this user
          return {
            ...c,
            participants: updatedParticipants,
            unreadCount: userId === getSimpleId(c) ? 0 : c.unreadCount,
          };
        }
        return c;
      });
      
      await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updatedConversations));
      
      // Update message statuses
      const messagesJson = await AsyncStorage.getItem(MESSAGES_KEY);
      const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : [];
      
      const updatedMessages = messages.map(message => {
        if (
          message.conversationId === conversationId &&
          message.senderId !== userId &&
          message.status !== MessageStatus.READ
        ) {
          return { ...message, status: MessageStatus.READ };
        }
        return message;
      });
      
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMessages));
      
      return true;
    } catch (error) {
      console.error(`Error marking conversation ${conversationId} as read:`, error);
      return false;
    }
  }
  
  /**
   * Add a reaction to a message
   */
  static async addMessageReaction(
    messageId: string,
    userId: string,
    reaction: string
  ): Promise<boolean> {
    try {
      const messagesJson = await AsyncStorage.getItem(MESSAGES_KEY);
      const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : [];
      
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) {
        return false;
      }
      
      const message = messages[messageIndex];
      const reactions = message.reactions || [];
      
      // Remove existing reaction by this user
      const filteredReactions = reactions.filter(r => r.userId !== userId);
      
      // Add the new reaction
      const newReaction = {
        userId,
        reaction,
        timestamp: new Date().toISOString(),
      };
      
      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = {
        ...message,
        reactions: [...filteredReactions, newReaction],
      };
      
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMessages));
      
      return true;
    } catch (error) {
      console.error(`Error adding reaction to message ${messageId}:`, error);
      return false;
    }
  }
  
  /**
   * Remove a reaction from a message
   */
  static async removeMessageReaction(
    messageId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const messagesJson = await AsyncStorage.getItem(MESSAGES_KEY);
      const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : [];
      
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) {
        return false;
      }
      
      const message = messages[messageIndex];
      const reactions = message.reactions || [];
      
      // Remove reaction by this user
      const filteredReactions = reactions.filter(r => r.userId !== userId);
      
      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = {
        ...message,
        reactions: filteredReactions,
      };
      
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMessages));
      
      return true;
    } catch (error) {
      console.error(`Error removing reaction from message ${messageId}:`, error);
      return false;
    }
  }
  
  /**
   * Delete a message
   */
  static async deleteMessage(
    messageId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const messagesJson = await AsyncStorage.getItem(MESSAGES_KEY);
      const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : [];
      
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) {
        return false;
      }
      
      const message = messages[messageIndex];
      
      // Only the sender can delete their message
      if (message.senderId !== userId) {
        return false;
      }
      
      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = {
        ...message,
        isDeleted: true,
        content: 'This message has been deleted',
        deletedAt: new Date().toISOString(),
        attachments: [],
      };
      
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMessages));
      
      // If this was the last message, update the conversation
      const conversation = await this.getConversation(message.conversationId);
      if (conversation && conversation.lastMessageId === messageId) {
        // Find the new last message
        const conversationMessages = messages.filter(
          m => m.conversationId === message.conversationId && !m.isDeleted
        );
        
        conversationMessages.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        const newLastMessage = conversationMessages[0];
        if (newLastMessage) {
          await this.updateConversationLastMessage(
            message.conversationId,
            newLastMessage.id,
            this.getMessagePreview(newLastMessage),
            newLastMessage.timestamp
          );
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting message ${messageId}:`, error);
      return false;
    }
  }
  
  /**
   * Edit a message
   */
  static async editMessage(
    messageId: string,
    userId: string,
    newContent: string
  ): Promise<boolean> {
    try {
      const messagesJson = await AsyncStorage.getItem(MESSAGES_KEY);
      const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : [];
      
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) {
        return false;
      }
      
      const message = messages[messageIndex];
      
      // Only the sender can edit their message
      if (message.senderId !== userId) {
        return false;
      }
      
      // Cannot edit deleted messages
      if (message.isDeleted) {
        return false;
      }
      
      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = {
        ...message,
        content: newContent,
        editedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMessages));
      
      // If this was the last message, update the conversation preview
      const conversation = await this.getConversation(message.conversationId);
      if (conversation && conversation.lastMessageId === messageId) {
        await this.updateConversationLastMessage(
          message.conversationId,
          messageId,
          this.getMessagePreview(updatedMessages[messageIndex]),
          conversation.lastMessageTimestamp || message.timestamp
        );
      }
      
      return true;
    } catch (error) {
      console.error(`Error editing message ${messageId}:`, error);
      return false;
    }
  }
  
  /**
   * Leave a conversation
   */
  static async leaveConversation(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const conversation = await this.getConversation(conversationId);
      if (!conversation) {
        return false;
      }
      
      // For direct conversations, we don't allow leaving
      if (conversation.type === ConversationType.DIRECT) {
        return false;
      }
      
      const conversationsJson = await AsyncStorage.getItem(CONVERSATIONS_KEY);
      const conversations: Conversation[] = conversationsJson ? JSON.parse(conversationsJson) : [];
      
      const conversationIndex = conversations.findIndex(c => c.id === conversationId);
      if (conversationIndex === -1) {
        return false;
      }
      
      // Remove the user from participants
      const updatedParticipants = conversation.participants.filter(p => p.userId !== userId);
      
      // If there are no participants left, delete the conversation
      if (updatedParticipants.length === 0) {
        const filteredConversations = conversations.filter(c => c.id !== conversationId);
        await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(filteredConversations));
        return true;
      }
      
      // Update the conversation
      const updatedConversations = [...conversations];
      updatedConversations[conversationIndex] = {
        ...conversation,
        participants: updatedParticipants,
        updatedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updatedConversations));
      
      // Send a system message about the user leaving
      await this.sendMessage(
        {
          conversationId,
          content: `${userId} has left the conversation`,
        },
        'system',
        MessageType.SYSTEM
      );
      
      return true;
    } catch (error) {
      console.error(`Error leaving conversation ${conversationId}:`, error);
      return false;
    }
  }
  
  /**
   * Add a user to a group conversation
   */
  static async addUserToConversation(
    conversationId: string,
    userId: string,
    addedByUserId: string
  ): Promise<boolean> {
    try {
      const conversation = await this.getConversation(conversationId);
      if (!conversation) {
        return false;
      }
      
      // Only group conversations support adding users
      if (conversation.type !== ConversationType.GROUP) {
        return false;
      }
      
      // Check if the user adding has admin rights
      const adder = conversation.participants.find(p => p.userId === addedByUserId);
      if (!adder || !adder.isAdmin) {
        return false;
      }
      
      // Check if the user is already in the conversation
      if (conversation.participants.some(p => p.userId === userId)) {
        return true; // User is already in the conversation
      }
      
      const conversationsJson = await AsyncStorage.getItem(CONVERSATIONS_KEY);
      const conversations: Conversation[] = conversationsJson ? JSON.parse(conversationsJson) : [];
      
      const conversationIndex = conversations.findIndex(c => c.id === conversationId);
      if (conversationIndex === -1) {
        return false;
      }
      
      // Add the user to participants
      const now = new Date().toISOString();
      const updatedParticipants = [
        ...conversation.participants,
        { userId, joinedAt: now, isAdmin: false }
      ];
      
      // Update the conversation
      const updatedConversations = [...conversations];
      updatedConversations[conversationIndex] = {
        ...conversation,
        participants: updatedParticipants,
        updatedAt: now,
      };
      
      await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updatedConversations));
      
      // Send a system message about the user joining
      await this.sendMessage(
        {
          conversationId,
          content: `${userId} has been added to the conversation by ${addedByUserId}`,
        },
        'system',
        MessageType.SYSTEM
      );
      
      return true;
    } catch (error) {
      console.error(`Error adding user ${userId} to conversation ${conversationId}:`, error);
      return false;
    }
  }
  
  /**
   * Get messaging notification settings for a user
   */
  static async getNotificationSettings(userId: string): Promise<MessagingNotificationSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(`${NOTIFICATION_SETTINGS_KEY}_${userId}`);
      
      // Default settings
      const defaultSettings: MessagingNotificationSettings = {
        enabled: true,
        showPreview: true,
        sound: true,
        vibration: true,
        muteSpecificConversations: [],
      };
      
      return settingsJson ? JSON.parse(settingsJson) : defaultSettings;
    } catch (error) {
      console.error(`Error getting notification settings for user ${userId}:`, error);
      
      // Return default settings on error
      return {
        enabled: true,
        showPreview: true,
        sound: true,
        vibration: true,
        muteSpecificConversations: [],
      };
    }
  }
  
  /**
   * Update messaging notification settings for a user
   */
  static async updateNotificationSettings(
    userId: string,
    settings: Partial<MessagingNotificationSettings>
  ): Promise<MessagingNotificationSettings> {
    try {
      const currentSettings = await this.getNotificationSettings(userId);
      const updatedSettings = { ...currentSettings, ...settings };
      
      await AsyncStorage.setItem(
        `${NOTIFICATION_SETTINGS_KEY}_${userId}`,
        JSON.stringify(updatedSettings)
      );
      
      return updatedSettings;
    } catch (error) {
      console.error(`Error updating notification settings for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Find a direct conversation between two users
   */
  private static async findDirectConversation(
    user1Id: string,
    user2Id: string
  ): Promise<Conversation | null> {
    try {
      const conversationsJson = await AsyncStorage.getItem(CONVERSATIONS_KEY);
      const conversations: Conversation[] = conversationsJson ? JSON.parse(conversationsJson) : [];
      
      // Find direct conversation between these two users
      return conversations.find(conversation => 
        conversation.type === ConversationType.DIRECT &&
        conversation.participants.length === 2 &&
        conversation.participants.some(p => p.userId === user1Id) &&
        conversation.participants.some(p => p.userId === user2Id)
      ) || null;
    } catch (error) {
      console.error('Error finding direct conversation:', error);
      return null;
    }
  }
  
  /**
   * Update the last message information for a conversation
   */
  private static async updateConversationLastMessage(
    conversationId: string,
    messageId: string,
    preview: string,
    timestamp: string
  ): Promise<boolean> {
    try {
      const conversationsJson = await AsyncStorage.getItem(CONVERSATIONS_KEY);
      const conversations: Conversation[] = conversationsJson ? JSON.parse(conversationsJson) : [];
      
      const updatedConversations = conversations.map(conversation => {
        if (conversation.id === conversationId) {
          return {
            ...conversation,
            lastMessageId: messageId,
            lastMessagePreview: preview,
            lastMessageTimestamp: timestamp,
            updatedAt: new Date().toISOString(),
          };
        }
        return conversation;
      });
      
      await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updatedConversations));
      
      return true;
    } catch (error) {
      console.error(`Error updating last message for conversation ${conversationId}:`, error);
      return false;
    }
  }
  
  /**
   * Increment the unread count for all participants except the sender
   */
  private static async incrementUnreadCount(
    conversationId: string,
    senderId: string
  ): Promise<boolean> {
    try {
      const conversationsJson = await AsyncStorage.getItem(CONVERSATIONS_KEY);
      const conversations: Conversation[] = conversationsJson ? JSON.parse(conversationsJson) : [];
      
      const conversationIndex = conversations.findIndex(c => c.id === conversationId);
      if (conversationIndex === -1) {
        return false;
      }
      
      const conversation = conversations[conversationIndex];
      
      // Increment unread count for the conversation
      const updatedConversations = [...conversations];
      updatedConversations[conversationIndex] = {
        ...conversation,
        unreadCount: (conversation.unreadCount || 0) + 1,
      };
      
      await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updatedConversations));
      
      return true;
    } catch (error) {
      console.error(`Error incrementing unread count for conversation ${conversationId}:`, error);
      return false;
    }
  }
  
  /**
   * Get a preview of a message for display in conversation list
   */
  private static getMessagePreview(message: Message): string {
    if (message.isDeleted) {
      return 'This message has been deleted';
    }
    
    switch (message.type) {
      case MessageType.TEXT:
        return message.content.length > 50
          ? `${message.content.substring(0, 47)}...`
          : message.content;
      case MessageType.IMAGE:
        return '📷 Image';
      case MessageType.CHALLENGE_INVITE:
        return '🏆 Challenge Invitation';
      case MessageType.IMPACT_SHARE:
        return '🌍 Impact Stats';
      case MessageType.COLLECTION_SHARE:
        return '♻️ Collection Shared';
      case MessageType.SYSTEM:
        return message.content;
      default:
        return message.content;
    }
  }
} 