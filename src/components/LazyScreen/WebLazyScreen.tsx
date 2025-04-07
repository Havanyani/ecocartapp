/**
 * LazyScreen/WebLazyScreen.tsx
 * 
 * Web-specific implementation of the LazyScreen component.
 * Uses React.lazy and Suspense for code splitting,
 * along with IntersectionObserver for visibility detection.
 */

import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LazyScreenMetrics, LazyScreenProps, LoadingState } from './shared';

// Component cache for performance
const componentCache = new Map<string, React.ComponentType<any>>();

const WebLazyScreen: React.FC<LazyScreenProps> = ({
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
  const containerRef = useRef<View>(null);
  const metrics = useRef<LazyScreenMetrics>({
    screenId,
    loadStartTime: 0,
  });
  
  // Create or retrieve lazy-loaded component
  const getLazyComponent = () => {
    if (componentCache.has(screenId)) {
      return componentCache.get(screenId) || null;
    }
    
    // Wrap the component with React.lazy
    const lazyComponent = lazy(() => {
      // Mark load start time for performance tracking
      metrics.current.loadStartTime = performance.now();
      
      if (onLoadStart) {
        onLoadStart();
      }
      
      // For regular components, wrap in a Promise to simulate async loading
      const promise = typeof component === 'function' 
        ? Promise.resolve({ default: component })
        : component;
      
      return promise.then((module) => {
        // Mark load completion time
        metrics.current.loadEndTime = performance.now();
        setLoadingState(LoadingState.LOADED);
        
        if (onLoadComplete) {
          onLoadComplete();
        }
        
        return module;
      }).catch((error) => {
        metrics.current.loadError = error;
        setLoadingState(LoadingState.ERROR);
        
        if (onLoadError) {
          onLoadError(error);
        }
        
        throw error;
      });
    });
    
    componentCache.set(screenId, lazyComponent);
    return lazyComponent;
  };
  
  // Lazily initialize the component
  if (!componentRef.current) {
    componentRef.current = getLazyComponent();
  }
  
  // Setup visibility detection with IntersectionObserver
  useEffect(() => {
    if (preload) {
      setIsVisible(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isIntersecting = entry.isIntersecting;
          setIsVisible(isIntersecting);
          
          if (isIntersecting && !isComponentMounted) {
            setLoadingState(LoadingState.LOADING);
            metrics.current.renderStartTime = performance.now();
          }
        });
      },
      {
        threshold: visibilityThreshold,
        rootMargin: '200px',
      }
    );
    
    // On web, we need to get the underlying DOM node
    if (containerRef.current) {
      // For web, we can use findDOMNode
      const node = containerRef.current;
      // @ts-ignore - In React Native Web, _nativeTag is the DOM node
      const domNode = node._nativeTag || node;
      if (domNode) {
        observer.observe(domNode);
      }
    }
    
    return () => {
      observer.disconnect();
    };
  }, [preload, visibilityThreshold, isComponentMounted]);
  
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
      metrics.current.renderEndTime = performance.now();
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
  
  // Determine what to render based on current state
  const renderContent = () => {
    if (!shouldRenderComponent) {
      return null;
    }
    
    const LazyComponent = componentRef.current;
    
    if (loadingState === LoadingState.ERROR) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load component</Text>
        </View>
      );
    }
    
    if (withSuspense) {
      return (
        <Suspense
          fallback={
            showLoading ? (
              loadingComponent || (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#0000ff" />
                </View>
              )
            ) : null
          }
        >
          {LazyComponent && <LazyComponent {...componentProps} />}
        </Suspense>
      );
    }
    
    // When not using Suspense, manually handle loading states
    if (loadingState === LoadingState.LOADING && showLoading) {
      return loadingComponent || (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
    
    return LazyComponent && <LazyComponent {...componentProps} />;
  };
  
  return (
    <View
      ref={containerRef}
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

export default WebLazyScreen; 