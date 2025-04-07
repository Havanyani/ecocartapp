/**
 * idUtils.ts
 * 
 * Utility functions for working with IDs in the app.
 */

import { Conversation, ConversationType } from '@/types/Message';

/**
 * Get a simple ID from a conversation for the current user
 * For direct conversations, returns the other user's ID
 * For group conversations, returns the conversation ID
 */
export function getSimpleId(conversation: Conversation | null, currentUserId?: string): string {
  if (!conversation) {
    return '';
  }
  
  if (conversation.type === ConversationType.DIRECT && currentUserId) {
    // Find the ID of the other participant
    const otherParticipant = conversation.participants.find(
      participant => participant.userId !== currentUserId
    );
    
    return otherParticipant?.userId || '';
  }
  
  // For groups, just return the conversation ID
  return conversation.id;
}

/**
 * Generate a conversation key for two users
 * Creates a consistent key regardless of the order of the user IDs
 */
export function generateConversationKey(user1Id: string, user2Id: string): string {
  // Sort the IDs to ensure the key is consistent regardless of the input order
  const sortedIds = [user1Id, user2Id].sort();
  return `conversation_${sortedIds[0]}_${sortedIds[1]}`;
}

/**
 * Generate a short display ID from a longer ID
 * Useful for displaying shortened versions of UUIDs in the UI
 */
export function generateShortId(id: string, length = 8): string {
  if (!id) return '';
  
  // If the ID is already shorter than the requested length, return as is
  if (id.length <= length) {
    return id;
  }
  
  // Otherwise, take the first few characters
  return id.substring(0, length);
} 