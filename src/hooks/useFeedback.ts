import { SafeStorage } from '@/utils/storage';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { api } from '@/services/api';
import { FeedbackError, FeedbackFormData, FeedbackResponse } from '@/types/feedback';
import { generateUniqueId } from '@/utils/UniqueIdGenerator';

export interface FeedbackFormData {
  rating: number;
  category: string;
  comment: string;
}

export interface FeedbackError {
  message: string;
  code?: string;
}

export interface FeedbackItem extends FeedbackFormData {
  id: string;
  createdAt: string;
}

/**
 * Hook for managing user feedback
 */
export function useFeedback() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FeedbackError | null>(null);

  /**
   * Submit feedback to storage and eventually to a backend
   */
  const submitFeedback = useCallback(async (feedbackData: FeedbackFormData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate feedback data
      if (!feedbackData.rating || !feedbackData.category || !feedbackData.comment) {
        throw new Error('Please complete all feedback fields');
      }
      
      // Create feedback object with ID and timestamp
      const feedback: FeedbackItem = {
        id: generateUniqueId(),
        ...feedbackData,
        createdAt: new Date().toISOString(),
      };
      
      // In a real app, this would be an API call
      // For now, we'll store it locally
      
      // Get existing feedback from storage
      const storedFeedback = await SafeStorage.getItem('userFeedback');
      const feedbackArray: FeedbackItem[] = storedFeedback ? JSON.parse(storedFeedback) : [];
      
      // Add new feedback to array
      feedbackArray.push(feedback);
      
      // Save updated array
      await SafeStorage.setItem('userFeedback', JSON.stringify(feedbackArray));
      
      // Show success message
      Alert.alert('Thank You', 'Your feedback has been submitted successfully!');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit feedback';
      setError({ 
        message: errorMessage,
        code: 'FEEDBACK_SUBMIT_ERROR'
      });
      console.error('Error submitting feedback:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFeedback = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get<FeedbackResponse>(`/feedback/${id}`);
      return response.data;
    } catch (err) {
      const error = err as Error;
      setError({
        message: error.message,
        code: 'FEEDBACK_FETCH_ERROR',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFeedback = useCallback(async (id: string, data: Partial<FeedbackFormData>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.patch<FeedbackResponse>(`/feedback/${id}`, data);
      return response.data;
    } catch (err) {
      const error = err as Error;
      setError({
        message: error.message,
        code: 'FEEDBACK_UPDATE_ERROR',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteFeedback = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await api.delete(`/feedback/${id}`);
    } catch (err) {
      const error = err as Error;
      setError({
        message: error.message,
        code: 'FEEDBACK_DELETE_ERROR',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    submitFeedback,
    getFeedback,
    updateFeedback,
    deleteFeedback,
    clearError,
  };
} 