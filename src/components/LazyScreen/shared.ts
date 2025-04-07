/**
 * LazyScreen/shared.ts
 * 
 * Shared types and utilities for the LazyScreen component.
 * Used by both mobile and web implementations.
 */

import React from 'react';
import { ViewProps } from 'react-native';

export interface LazyScreenProps extends ViewProps {
  /**
   * A unique identifier for the screen, used for performance tracking
   */
  screenId: string;
  
  /**
   * The component to render when the screen is in view or ready
   */
  component: React.ComponentType<any>;
  
  /**
   * Props to pass to the component
   */
  componentProps?: Record<string, any>;
  
  /**
   * Custom loading component to show while the main component is loading
   */
  loadingComponent?: React.ReactNode;
  
  /**
   * Whether to preload the component before it's visible
   * @default false
   */
  preload?: boolean;
  
  /**
   * Callback fired when the component starts loading
   */
  onLoadStart?: () => void;
  
  /**
   * Callback fired when the component has loaded
   */
  onLoadComplete?: () => void;
  
  /**
   * Callback fired when loading fails
   */
  onLoadError?: (error: Error) => void;
  
  /**
   * Priority level for loading (affects preloading behavior)
   * @default 'normal'
   */
  priority?: 'high' | 'normal' | 'low';
  
  /**
   * Whether to render a fallback when the component suspends (for React.lazy)
   * @default true
   */
  withSuspense?: boolean;
  
  /**
   * Time in ms to wait before showing the loading indicator
   * @default 200
   */
  loadingDelay?: number;
  
  /**
   * Threshold for visibility detection (0-1), lower means earlier loading
   * @default 0.1
   */
  visibilityThreshold?: number;
  
  /**
   * Whether to keep the component mounted after it's no longer visible
   * @default true
   */
  keepMounted?: boolean;
  
  /**
   * Time in ms to cache the component after unmounting (if keepMounted=false)
   * @default 60000 (1 minute)
   */
  cacheTime?: number;
}

/**
 * Performance metrics for the LazyScreen component
 */
export interface LazyScreenMetrics {
  screenId: string;
  loadStartTime: number;
  loadEndTime?: number;
  renderStartTime?: number;
  renderEndTime?: number;
  timeToVisible?: number;
  loadError?: Error;
}

/**
 * Default state for loading indicators
 */
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error'
} 