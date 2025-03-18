import { ReactNode } from 'react';

/**
 * Forum thread interface
 */
export interface ForumThread {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  lastUpdatedAt: Date;
  messageCount: number;
  isSticky: boolean;
  isLocked: boolean;
  tags: string[];
  lastMessagePreview: string;
}

/**
 * Forum message interface
 */
export interface ForumMessage {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
  editedAt?: Date;
  attachments?: ForumAttachment[];
  reactions?: {
    [key: string]: string[]; // reaction type to array of user IDs
  };
  isOriginalPost: boolean;
}

/**
 * Types of forum attachments
 */
export enum ForumAttachmentType {
  Image = 'image',
  Document = 'document',
  Link = 'link',
}

/**
 * Forum attachment interface
 */
export interface ForumAttachment {
  id: string;
  type: ForumAttachmentType;
  url: string;
  thumbnailUrl?: string;
  filename?: string;
  size?: number;
  mimeType?: string;
  width?: number;
  height?: number;
}

/**
 * Forum thread creation payload
 */
export interface CreateThreadPayload {
  title: string;
  content: string;
  tags?: string[];
  attachments?: Omit<ForumAttachment, 'id'>[];
}

/**
 * Forum message creation payload
 */
export interface CreateMessagePayload {
  threadId: string;
  content: string;
  attachments?: Omit<ForumAttachment, 'id'>[];
}

/**
 * Status of forum operations
 */
export enum ForumOperationStatus {
  Idle = 'idle',
  Loading = 'loading',
  Success = 'success',
  Error = 'error',
}

/**
 * Result of forum operations
 */
export interface ForumOperationResult<T> {
  status: ForumOperationStatus;
  data?: T;
  error?: string;
}

/**
 * Forum filter options
 */
export interface ForumFilterOptions {
  searchQuery?: string;
  tags?: string[];
  authorId?: string;
  sortBy?: 'newest' | 'oldest' | 'mostActive' | 'mostRecent';
  showSticky?: boolean;
  showLocked?: boolean;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Forum pagination options
 */
export interface ForumPaginationOptions {
  page: number;
  limit: number;
}

/**
 * Forum component props
 */
export interface CommunityForumProps {
  onThreadSelect?: (threadId: string) => void;
  categorized?: boolean;
  showSearch?: boolean;
  showNewThreadButton?: boolean;
  onNewThreadPress?: () => void;
  filterOptions?: ForumFilterOptions;
  paginationOptions?: ForumPaginationOptions;
  emptyStateComponent?: ReactNode;
  errorStateComponent?: ReactNode;
}

/**
 * Thread detail props
 */
export interface ThreadDetailProps {
  threadId: string;
  onBack?: () => void;
  onReply?: (message: ForumMessage) => void;
  showReplyButton?: boolean;
}

/**
 * New thread form props
 */
export interface NewThreadFormProps {
  onSubmit?: (thread: CreateThreadPayload) => void;
  onCancel?: () => void;
  availableTags?: string[];
  isSubmitting?: boolean;
  error?: string;
}

/**
 * Message list props
 */
export interface MessageListProps {
  threadId: string;
  onReply?: (message: ForumMessage) => void;
  showReplyButton?: boolean;
  paginationOptions?: ForumPaginationOptions;
} 