import { useCallback, useEffect, useState } from 'react';
import { TutorialID, TutorialService } from '@/services/TutorialService';

interface UseTutorialOptions {
  autoShow?: boolean;
  showDelay?: number;
  onComplete?: () => void;
}

export function useTutorial(
  tutorialId: TutorialID,
  options: UseTutorialOptions = {}
) {
  const { autoShow = true, showDelay = 500, onComplete } = options;
  
  const [isVisible, setIsVisible] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if tutorial has been completed
  useEffect(() => {
    let isMounted = true;
    
    const checkTutorialStatus = async () => {
      setIsLoading(true);
      
      try {
        const completed = await TutorialService.isTutorialCompleted(tutorialId);
        
        if (isMounted) {
          setHasCompleted(completed);
          setIsLoading(false);
          
          // Auto-show the tutorial if it hasn't been completed
          if (autoShow && !completed) {
            setTimeout(() => {
              if (isMounted) {
                setIsVisible(true);
              }
            }, showDelay);
          }
        }
      } catch (error) {
        console.error('Error checking tutorial status:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    checkTutorialStatus();
    
    return () => {
      isMounted = false;
    };
  }, [tutorialId, autoShow, showDelay]);
  
  // Show the tutorial
  const showTutorial = useCallback(() => {
    setIsVisible(true);
  }, []);
  
  // Hide the tutorial
  const hideTutorial = useCallback(() => {
    setIsVisible(false);
  }, []);
  
  // Mark tutorial as completed
  const completeTutorial = useCallback(async () => {
    try {
      await TutorialService.markTutorialCompleted(tutorialId);
      setHasCompleted(true);
      setIsVisible(false);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error completing tutorial:', error);
    }
  }, [tutorialId, onComplete]);
  
  // Reset tutorial to show it again
  const resetTutorial = useCallback(async () => {
    try {
      await TutorialService.resetTutorial(tutorialId);
      setHasCompleted(false);
    } catch (error) {
      console.error('Error resetting tutorial:', error);
    }
  }, [tutorialId]);
  
  return {
    isVisible,
    hasCompleted,
    isLoading,
    showTutorial,
    hideTutorial,
    completeTutorial,
    resetTutorial
  };
}

export default useTutorial; 