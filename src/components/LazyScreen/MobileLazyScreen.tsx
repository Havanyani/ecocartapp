/**
 * LazyScreen/MobileLazyScreen.tsx
 * 
 * Mobile-specific implementation of the LazyScreen component.
 * Optimizes for mobile with features like:
 * - Native component loading
 * - Performance monitoring
 * - Memory management
 */

import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LazyScreenMetrics, LazyScreenProps, LoadingState } from './shared';

// Component cache for performance
const componentCache = new Map<string, React.ComponentType<any>>();

const MobileLazyScreen: React.FC<LazyScreenProps> = ({
  screenId,
  component,
  componentProps = {},
  style,
  loadingComponent,
  preload = false,
  onLoadStart,
  onLoadComplete,
  onLoadError,
  priority = 'normal',
  withSuspense = true,
  loadingDelay = 200,
  visibilityThreshold = 0.1,
  keepMounted = true,
  cacheTime = 60000,
  ...otherProps
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>(
    preload ? LoadingState.LOADING : LoadingState.IDLE
  );
  const [showLoading, setShowLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(preload);
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const componentRef = useRef<React.ComponentType<any> | null>(null);
  const metrics = useRef<LazyScreenMetrics>({
    screenId,
    loadStartTime: 0,
  });
  
  // Load component dynamically
  const loadComponent = async () => {
    if (componentRef.current) {
      return componentRef.current;
    }
    
    if (componentCache.has(screenId)) {
      componentRef.current = componentCache.get(screenId) || null;
      return componentRef.current;
    }
    
    try {
      // Start loading performance measurement
      metrics.current.loadStartTime = Date.now();
      if (onLoadStart) onLoadStart();
      
      setLoadingState(LoadingState.LOADING);
      
      // For mobile, we don't use React.lazy as it's not as optimized for React Native
      // Instead, we manually handle the dynamic import
      
      let importedComponent: React.ComponentType<any>;
      
      if (typeof component === 'function') {
        // Component is already a function, no need to import
        importedComponent = component;
      } else {
        // Simulate async loading with a small delay for consistent behavior
        await new Promise(resolve => setTimeout(resolve, 50));
        importedComponent = component;
      }
      
      componentRef.current = importedComponent;
      componentCache.set(screenId, importedComponent);
      
      // Complete loading performance measurement
      metrics.current.loadEndTime = Date.now();
      setLoadingState(LoadingState.LOADED);
      
      if (onLoadComplete) onLoadComplete();
      
      return importedComponent;
    } catch (error) {
      metrics.current.loadError = error instanceof Error ? error : new Error(String(error));
      setLoadingState(LoadingState.ERROR);
      
      if (onLoadError) onLoadError(metrics.current.loadError);
      
      return null;
    }
  };
  
  // Handle visibility changes
  useEffect(() => {
    if (preload) {
      setIsVisible(true);
      loadComponent();
      return;
    }
    
    // We'll skip IntersectionObserver since it's not well supported on React Native
    // Instead, we'll simulate visibility with an immediate load once the component mounts
    setIsVisible(true);
    
    if (!componentRef.current) {
      metrics.current.renderStartTime = Date.now();
      loadComponent();
    }
  }, [preload]);
  
  // Delayed loading indicator
  useEffect(() => {
    if (loadingState === LoadingState.LOADING) {
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, loadingDelay);
      
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [loadingState, loadingDelay]);
  
  // Track component mounting
  useEffect(() => {
    if (isVisible && !isComponentMounted) {
      setIsComponentMounted(true);
    }
  }, [isVisible, isComponentMounted]);
  
  // Track performance metrics when component is fully rendered
  useEffect(() => {
    if (loadingState === LoadingState.LOADED && isComponentMounted) {
      metrics.current.renderEndTime = Date.now();
      metrics.current.timeToVisible = 
        metrics.current.renderEndTime - metrics.current.loadStartTime;
      
      // Report metrics to performance monitoring system
      console.log(`[LazyScreen] Screen ${screenId} loaded in ${metrics.current.timeToVisible}ms`);
    }
  }, [loadingState, isComponentMounted, screenId]);
  
  // Handle unmounting logic
  useEffect(() => {
    let unmountTimer: ReturnType<typeof setTimeout>;
    
    return () => {
      if (!keepMounted && componentCache.has(screenId) && cacheTime > 0) {
        // Delay cache cleanup to allow for quick revisits
        unmountTimer = setTimeout(() => {
          componentCache.delete(screenId);
        }, cacheTime);
      }
    };
  }, [keepMounted, screenId, cacheTime]);
  
  // Determine if we should render the component
  const shouldRenderComponent = isVisible || (keepMounted && isComponentMounted);
  
  // Render the lazy-loaded component
  const renderContent = () => {
    if (!shouldRenderComponent) {
      return null;
    }
    
    if (loadingState === LoadingState.ERROR) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load component</Text>
        </View>
      );
    }
    
    if ((loadingState === LoadingState.LOADING || !componentRef.current) && showLoading) {
      return loadingComponent || (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
    
    const Component = componentRef.current;
    return Component ? <Component {...componentProps} /> : null;
  };
  
  return (
    <View
      style={[styles.container, style]}
      {...otherProps}
    >
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffeeee',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
  },
});

export default MobileLazyScreen; 