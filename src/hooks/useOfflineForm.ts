/**
 * useOfflineForm.ts
 * 
 * A React hook that combines form handling with offline storage capabilities.
 * This hook manages form state, validation, submission, and offline synchronization.
 */

import { SafeStorage } from '@/utils/storage';
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SyncService from '@/services/SyncService';
import useNetworkStatus from './useNetworkStatus';

export type ValidationFunction<T> = (data: T) => Record<keyof T, string | undefined> | null;

interface UseOfflineFormOptions<T> {
  /** Unique identifier for this form type */
  formId: string;
  /** Initial form data */
  initialData: T;
  /** Function to validate form data */
  validate?: ValidationFunction<T>;
  /** API endpoint to submit the data to when online */
  endpoint: string;
  /** Priority of this form in the sync queue (higher = more important) */
  priority?: number;
  /** Time in milliseconds until the form data expires */
  expiry?: number;
  /** Function to call when form submission is successful */
  onSuccess?: (data: T, isOffline: boolean) => void;
  /** Function to call when form submission fails */
  onError?: (error: Error) => void;
}

interface OfflineFormOptions<T> {
  formId: string;
  entityType: 'collection' | 'material' | 'user' | 'feedback';
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onOfflineSubmit?: () => void;
  conflictResolver?: (serverData: T, localData: T) => T;
  priority?: 'high' | 'medium' | 'low';
}

interface FormState<T> {
  isSubmitting: boolean;
  isOfflineSubmit: boolean;
  pendingSubmissions: number;
  data: T | null;
  error: Error | null;
}

export interface SubmitConfig<T> {
  entityId?: string;
  action: 'create' | 'update' | 'delete';
  offlineId?: string;
  skipOfflineQueue?: boolean;
}

/**
 * A hook for handling forms with offline support
 */
export function useOfflineForm<T extends object>(options: OfflineFormOptions<T>) {
  const {
    formId,
    entityType,
    onSuccess,
    onError,
    onOfflineSubmit,
    conflictResolver,
    priority = 'medium'
  } = options;

  const { isOnline } = useNetworkStatus();
  const [state, setState] = useState<FormState<T>>({
    isSubmitting: false,
    isOfflineSubmit: false,
    pendingSubmissions: 0,
    data: null,
    error: null
  });

  // Storage keys
  const pendingSubmissionsKey = `ecocart:${formId}:pendingSubmissions`;
  const lastSubmittedDataKey = `ecocart:${formId}:lastSubmittedData`;

  // Load pending submissions on mount
  useEffect(() => {
    const loadPendingSubmissions = async () => {
      try {
        // Performance tracking
        console.time('load_pending_submissions');
        
        const pendingCount = await SafeStorage.getItem(pendingSubmissionsKey);
        const lastDataStr = await SafeStorage.getItem(lastSubmittedDataKey);
        
        setState(prev => ({
          ...prev,
          pendingSubmissions: pendingCount ? parseInt(pendingCount, 10) : 0,
          data: lastDataStr ? JSON.parse(lastDataStr) : null
        }));
        
        console.timeEnd('load_pending_submissions');
      } catch (error) {
        console.error('Failed to load pending submissions:', error);
      }
    };

    loadPendingSubmissions();
  }, [formId, pendingSubmissionsKey, lastSubmittedDataKey]);

  // Submit form data - handles both online and offline submissions
  const submitForm = useCallback(
    async (data: T, config: SubmitConfig<T> = { action: 'create' }) => {
      const { action, entityId, offlineId, skipOfflineQueue } = config;
      
      try {
        // Performance tracking
        console.time('form_submission');
        
        setState(prev => ({ ...prev, isSubmitting: true, error: null }));

        // If we're online and not configured to skip the offline queue
        if (isOnline && !skipOfflineQueue) {
          // Let's attempt to submit directly to the server
          try {
            const actionId = await SyncService.addPendingAction({
              type: action,
              entityType,
              entityId,
              data,
              priority
            });
            
            const success = await SyncService.triggerSync('form_submit');
            
            if (success) {
              // Server submission succeeded
              setState(prev => ({ 
                ...prev, 
                isSubmitting: false, 
                isOfflineSubmit: false,
                data 
              }));
              
              // Clear pending submission as we submitted directly
              await SafeStorage.setItem(pendingSubmissionsKey, '0');
              await SafeStorage.removeItem(lastSubmittedDataKey);
              
              onSuccess?.(data);
              console.timeEnd('form_submission');
              return { success: true, isOffline: false, data };
            } else {
              throw new Error('Server submission failed, falling back to offline queue');
            }
          } catch (error) {
            if (skipOfflineQueue) {
              // If we're explicitly trying to skip the queue, fail if we can't submit
              throw error;
            }
            // If online submission fails, we'll continue to the offline path
            console.warn('Online submission failed, storing for later sync:', error);
          }
        }
        
        // If we're offline or the online submission failed, we store it for later sync
        if (!skipOfflineQueue) {
          // Generate a unique ID for the offline submission
          const generatedOfflineId = offlineId || uuidv4();
          
          // Store the data for later sync
          await AsyncStorage.setItem(lastSubmittedDataKey, JSON.stringify({
            ...data,
            _offlineId: generatedOfflineId,
            _entityId: entityId,
            _action: action,
            _timestamp: Date.now()
          }));
          
          // Increment pending submissions counter
          const pendingCount = await SafeStorage.getItem(pendingSubmissionsKey);
          const newCount = pendingCount ? parseInt(pendingCount, 10) + 1 : 1;
          await SafeStorage.setItem(pendingSubmissionsKey, newCount.toString());
          
          // Add to sync queue for background processing
          await SyncService.addPendingAction({
            type: action,
            entityType,
            entityId,
            data: {
              ...data,
              _offlineId: generatedOfflineId
            },
            priority
          });
          
          // Update state to reflect offline submission
          setState(prev => ({ 
            ...prev, 
            isSubmitting: false, 
            isOfflineSubmit: true,
            pendingSubmissions: newCount,
            data
          }));
          
          onOfflineSubmit?.();
          console.timeEnd('form_submission');
          return { success: true, isOffline: true, offlineId: generatedOfflineId, data };
        } else {
          // We were configured to skip the offline queue, but we're offline or the submission failed
          throw new Error('Cannot submit form: offline submission is disabled for this action');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        setState(prev => ({ 
          ...prev, 
          isSubmitting: false, 
          error: error instanceof Error ? error : new Error(String(error)) 
        }));
        
        onError?.(error instanceof Error ? error : new Error(String(error)));
        console.timeEnd('form_submission');
        return { success: false, isOffline: !isOnline, error };
      }
    },
    [
      isOnline, 
      entityType, 
      priority, 
      pendingSubmissionsKey, 
      lastSubmittedDataKey, 
      onSuccess, 
      onError, 
      onOfflineSubmit
    ]
  );

  // Clear form state
  const clearForm = useCallback(async () => {
    try {
      await SafeStorage.removeItem(pendingSubmissionsKey);
      await SafeStorage.removeItem(lastSubmittedDataKey);
      
      setState({
        isSubmitting: false,
        isOfflineSubmit: false,
        pendingSubmissions: 0,
        data: null,
        error: null
      });
    } catch (error) {
      console.error('Failed to clear form:', error);
    }
  }, [pendingSubmissionsKey, lastSubmittedDataKey]);

  // Resolve conflicts between local and server data
  const resolveConflict = useCallback(
    (serverData: T, localData: T): T => {
      if (conflictResolver) {
        return conflictResolver(serverData, localData);
      }
      
      // Default strategy: server data takes precedence, but keep local changes
      // for fields that exist locally but not on server
      return {
        ...localData,
        ...serverData
      };
    },
    [conflictResolver]
  );

  return {
    ...state,
    submitForm,
    clearForm,
    resolveConflict
  };
}

export default useOfflineForm; 