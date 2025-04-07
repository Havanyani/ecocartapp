/**
 * Message.ts
 * 
 * Type definitions for the messaging system.
 */

export enum MessageStatus {
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  CHALLENGE_INVITE = 'CHALLENGE_INVITE',
  IMPACT_SHARE = 'IMPACT_SHARE',
  COLLECTION_SHARE = 'COLLECTION_SHARE',
  SYSTEM = 'SYSTEM',
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'document' | 'challenge' | 'collection' | 'impact';
  url?: string;
  thumbnailUrl?: string;
  name?: string;
  size?: number;
  width?: number;
  height?: number;
  challengeId?: string;
  collectionId?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: MessageStatus;
  type: MessageType;
  timestamp: string;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  replyToMessageId?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  editedAt?: string;
}

export interface MessageReaction {
  userId: string;
  reaction: string;
  timestamp: string;
}

export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
}

export interface ConversationParticipant {
  userId: string;
  joinedAt: string;
  lastReadTimestamp?: string;
  isAdmin?: boolean;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;  // For group conversations
  participants: ConversationParticipant[];
  createdAt: string;
  updatedAt: string;
  lastMessageId?: string;
  lastMessagePreview?: string;
  lastMessageTimestamp?: string;
  unreadCount?: number;
  avatar?: string;
}

export interface MessageDraft {
  conversationId: string;
  content: string;
  attachments?: MessageAttachment[];
  replyToMessageId?: string;
}

export interface ConversationFilters {
  search?: string;
  hasUnreadMessages?: boolean;
  participantIds?: string[];
}

export interface MessagingNotificationSettings {
  enabled: boolean;
  showPreview: boolean;
  sound: boolean;
  vibration: boolean;
  muteSpecificConversations: string[];  // Array of conversation IDs that are muted
} 