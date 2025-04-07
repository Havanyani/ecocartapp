/**
 * Router.tsx
 * 
 * Shared interface for the Router component.
 * This file defines the props and types used by both native and web implementations.
 */

import React from 'react';

export interface Route {
  /**
   * Unique identifier for the route
   */
  id: string;
  
  /**
   * Title to display for the route
   */
  title: string;
  
  /**
   * Component to render for the route
   */
  component: React.ComponentType<any>;
  
  /**
   * URL path for web routing (used only on web)
   */
  path?: string;
  
  /**
   * Initial params to pass to the route
   */
  initialParams?: Record<string, any>;
  
  /**
   * Icon to display in tabs or navigation menu
   */
  icon?: React.ReactNode | string;
  
  /**
   * Whether this route requires authentication
   */
  requiresAuth?: boolean;
  
  /**
   * Custom metadata for the route (useful for SEO on web)
   */
  meta?: {
    description?: string;
    keywords?: string[];
    [key: string]: any;
  };
  
  /**
   * Children routes for nested navigation
   */
  children?: Route[];
}

export interface RouterProps {
  /**
   * Routes configuration for the app
   */
  routes: Route[];
  
  /**
   * Initial route ID to navigate to
   */
  initialRouteId?: string;
  
  /**
   * Whether to fetch and restore the previous session
   * @default true
   */
  restoreSession?: boolean;
  
  /**
   * Handler for unauthorized access attempts
   */
  onUnauthorized?: () => void;
  
  /**
   * Function to determine if a user is authenticated
   */
  isAuthenticated?: () => boolean;
  
  /**
   * Navigation theme (light/dark/custom)
   */
  theme?: 'light' | 'dark' | Record<string, any>;
  
  /**
   * Whether to enable link prefetching on web
   * @default true
   */
  enablePrefetching?: boolean;
  
  /**
   * Whether to include transition animations between screens
   * @default true
   */
  animated?: boolean;
  
  /**
   * Custom navigation state change handler
   */
  onNavigationStateChange?: (prevState: any, newState: any) => void;
  
  /**
   * Callback when navigation is ready
   */
  onReady?: () => void;
  
  /**
   * Custom link component to use for web
   */
  linkComponent?: React.ComponentType<any>;
  
  /**
   * Whether to show a loading indicator while navigation is initializing
   * @default true
   */
  showLoadingIndicator?: boolean;
}

// Placeholder implementation that will be overridden by platform-specific versions
export function Router(props: RouterProps): JSX.Element {
  console.warn('Router implementation not found. Did you forget to import the platform-specific version?');
  return null as any;
} 