/**
 * AppInitializationWrapper.tsx
 * 
 * A wrapper component that handles app initialization and loading states.
 * Displays a loading screen until the app is fully initialized.
 */

import { useTheme } from '@/hooks/useTheme';
import React, { useEffect, useState } from 'react';
import AppLoadingScreen from './AppLoadingScreen';

interface AppInitializationWrapperProps {
  children: React.ReactNode;
}

// Initialization steps with corresponding messages and weight
const INITIALIZATION_STEPS = [
  { id: 'splash', message: 'Starting EcoCart...', weight: 0.1 },
  { id: 'assets', message: 'Loading assets...', weight: 0.3 },
  { id: 'data', message: 'Initializing data...', weight: 0.2 },
  { id: 'optimizations', message: 'Optimizing performance...', weight: 0.2 },
  { id: 'finalize', message: 'Almost ready...', weight: 0.2 },
];

// Timeout for initialization steps to prevent hanging
const STEP_TIMEOUT = 3000; // 3 seconds per step

export function AppInitializationWrapper({ children }: AppInitializationWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(INITIALIZATION_STEPS[0].message);
  const { theme } = useTheme();

  // Track completed weight for progress calculation
  const [completedWeight, setCompletedWeight] = useState(0);

  // Update progress based on current step
  const updateProgress = (stepId: string, stepProgress: number = 1) => {
    const stepIndex = INITIALIZATION_STEPS.findIndex(step => step.id === stepId);
    
    if (stepIndex === -1) return;
    
    const step = INITIALIZATION_STEPS[stepIndex];
    const stepWeight = step.weight;
    
    // Calculate new completed weight
    const previousStepsWeight = INITIALIZATION_STEPS
      .slice(0, stepIndex)
      .reduce((sum, s) => sum + s.weight, 0);
    
    const newCompletedWeight = previousStepsWeight + (stepWeight * stepProgress);
    setCompletedWeight(newCompletedWeight);
    
    // Calculate overall progress percentage
    const newProgress = Math.min(Math.round(newCompletedWeight * 100), 100);
    setProgress(newProgress);
    
    // Update current step and message if needed
    if (stepIndex > currentStep) {
      setCurrentStep(stepIndex);
      setMessage(step.message);
    }
  };

  // Complete initialization
  const completeInitialization = () => {
    setProgress(100);
    setMessage('Ready!');
    setIsFinished(true);
  };

  // Handle completion animation finish
  const handleAnimationComplete = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    // Start app initialization process
    async function initializeApp() {
      try {
        // SIMPLIFIED INITIALIZATION - Skip performance monitoring
        
        // Step 1: Initial setup
        updateProgress('splash', 1);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Step 2: Begin loading assets
        updateProgress('assets', 0.5);
        await new Promise(resolve => setTimeout(resolve, 300));
        updateProgress('assets', 1);
        
        // Step 3: Initialize app data
        updateProgress('data', 0.5);
        await new Promise(resolve => setTimeout(resolve, 300));
        updateProgress('data', 1);
        
        // Step 4: Skip performance optimizations
        updateProgress('optimizations', 1);
        
        // Step 5: Finalization
        updateProgress('finalize', 0.5);
        await new Promise(resolve => setTimeout(resolve, 300));
        updateProgress('finalize', 1);
        
        // Complete initialization and trigger animation
        completeInitialization();
        
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Even on error, we want to show the main app
        completeInitialization();
      }
    }

    initializeApp();
  }, []);

  // Show the loading screen while initializing
  if (isLoading) {
    return (
      <AppLoadingScreen
        progress={progress}
        message={message}
        isFinished={isFinished}
        onFinishAnimationComplete={handleAnimationComplete}
      />
    );
  }

  // Once initialized, render the main app
  return <>{children}</>;
}

export default AppInitializationWrapper; 