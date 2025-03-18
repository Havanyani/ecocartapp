/**
 * Feedback type definitions
 * @module types/feedback
 */

/**
 * Feedback type enum
 */
export type FeedbackType = 
  | 'APP_EXPERIENCE'
  | 'COLLECTION_SERVICE'
  | 'DRIVER_RATING'
  | 'FEATURE_REQUEST'
  | 'BUG_REPORT'
  | 'OTHER';

/**
 * Feedback rating type
 */
export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

/**
 * Feedback interface
 */
export interface Feedback {
  id: string;
  userId: string;
  type: FeedbackType;
  rating?: FeedbackRating;
  comment: string;
  createdAt: string;
  status: FeedbackStatus;
  attachments?: FeedbackAttachment[];
}

/**
 * Feedback status type
 */
export type FeedbackStatus = 
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'CLOSED';

/**
 * Feedback attachment interface
 */
export interface FeedbackAttachment {
  id: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
} 