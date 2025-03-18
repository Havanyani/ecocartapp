export interface FeedbackFormData {
  rating: number;
  comment: string;
  category: 'general' | 'bug' | 'feature' | 'improvement';
  attachments: string[];
}

export interface FeedbackResponse {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  category: FeedbackFormData['category'];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackError {
  message: string;
  code: string;
  field?: keyof FeedbackFormData;
}

export interface FeedbackState {
  isLoading: boolean;
  error: FeedbackError | null;
  data: FeedbackResponse | null;
}

export interface FeedbackContextType {
  state: FeedbackState;
  submitFeedback: (data: FeedbackFormData) => Promise<void>;
  getFeedback: (id: string) => Promise<FeedbackResponse>;
  updateFeedback: (id: string, data: Partial<FeedbackFormData>) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;
  clearError: () => void;
} 