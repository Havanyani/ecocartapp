/**
 * Router.web.tsx
 * 
 * Web-specific implementation of the Router component.
 * Uses React Router for web platform navigation with SEO optimizations.
 */

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
    BrowserRouter,
    Navigate,
    Route as ReactRoute,
    Link as ReactRouterLink,
    Routes,
    useLocation,
    useNavigate,
} from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import type { Route, RouterProps } from './Router';

// SEO Metadata wrapper for routes
const RouteWithMeta = ({ 
  route, 
  children 
}: { 
  route: Route;
  children: React.ReactNode;
}) => {
  // Default app title - should be customized
  const appTitle = 'EcoCart';
  
  const title = route.title ? `${route.title} | ${appTitle}` : appTitle;
  const description = route.meta?.description || '';
  const keywords = route.meta?.keywords?.join(', ') || '';
  
  return (
    <>
      <Helmet>
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
        {keywords && <meta name="keywords" content={keywords} />}
        {/* Add other meta tags as needed from route.meta */}
        {Object.entries(route.meta || {}).map(([key, value]) => {
          if (key !== 'description' && key !== 'keywords' && typeof value === 'string') {
            return <meta key={key} name={key} content={value} />;
          }
          return null;
        })}
      </Helmet>
      {children}
    </>
  );
};

// Custom link component that supports React Router
const Link = ({ 
  to, 
  children, 
  ...props 
}: { 
  to: string;
  children: React.ReactNode;
  [key: string]: any;
}) => {
  return (
    <ReactRouterLink to={to} {...props}>
      {children}
    </ReactRouterLink>
  );
};

// Tab navigation component for web
const TabNavigation = ({ 
  routes,
  animated,
}: { 
  routes: Route[];
  animated: boolean;
}) => {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract current route path from location
  const currentPath = location.pathname;
  
  return (
    <View style={styles.tabNavigationContainer}>
      {/* Tab Bar */}
      <View 
        style={[
          styles.tabBar,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
        ]}
      >
        {routes.map(route => {
          const path = route.path || `/${route.id}`;
          const isActive = currentPath.startsWith(path);
          
          return (
            <View 
              key={route.id}
              style={[
                styles.tabItem,
                isActive && { borderBottomColor: theme.colors.primary }
              ]}
              onClick={() => navigate(path)}
            >
              {/* Tab Icon */}
              {route.icon && (
                <View style={styles.tabIcon}>
                  {typeof route.icon === 'string' ? (
                    // Replace with your icon component
                    <span>{route.icon}</span>
                  ) : (
                    route.icon
                  )}
                </View>
              )}
              
              {/* Tab Label */}
              <span 
                style={{
                  color: isActive ? theme.colors.primary : theme.colors.text,
                  fontWeight: isActive ? '600' : '400',
                }}
              >
                {route.title}
              </span>
            </View>
          );
        })}
      </View>
      
      {/* Tab Content */}
      <View 
        style={[
          styles.tabContent,
          { backgroundColor: theme.colors.background }
        ]}
      >
        <Routes>
          {routes.map(route => {
            const path = route.path || `/${route.id}`;
            const RouteComponent = route.component;
            
            if (!route.children || route.children.length === 0) {
              return (
                <ReactRoute
                  key={route.id}
                  path={path}
                  element={
                    <RouteWithMeta route={route}>
                      <RouteComponent {...route.initialParams} />
                    </RouteWithMeta>
                  }
                />
              );
            }
            
            // Handle nested routes for tabs
            return (
              <ReactRoute key={route.id} path={`${path}/*`} element={
                <View style={{ flex: 1 }}>
                  <Routes>
                    {route.children.map(childRoute => {
                      const childPath = childRoute.path || `${path}/${childRoute.id}`;
                      const ChildComponent = childRoute.component;
                      
                      return (
                        <ReactRoute
                          key={childRoute.id}
                          path={childPath.replace(/^\/+/, '')}
                          element={
                            <RouteWithMeta route={childRoute}>
                              <ChildComponent {...childRoute.initialParams} />
                            </RouteWithMeta>
                          }
                        />
                      );
                    })}
                    
                    {/* Redirect to first child if no specific path is matched */}
                    {route.children.length > 0 && (
                      <ReactRoute
                        path=""
                        element={
                          <Navigate 
                            to={route.children[0].path || `${path.replace(/^\/+/, '')}/${route.children[0].id}`} 
                            replace 
                          />
                        }
                      />
                    )}
                  </Routes>
                </View>
              } />
            );
          })}
          
          {/* Default route - navigate to first route if no path is matched */}
          {routes.length > 0 && (
            <ReactRoute
              path="*"
              element={
                <Navigate to={routes[0].path || `/${routes[0].id}`} replace />
              }
            />
          )}
        </Routes>
      </View>
    </View>
  );
};

export function Router({
  routes,
  initialRouteId,
  restoreSession = true,
  onUnauthorized,
  isAuthenticated,
  theme: navigationTheme,
  enablePrefetching = true,
  animated = true,
  onNavigationStateChange,
  onReady,
  linkComponent,
  showLoadingIndicator = true,
}: RouterProps): JSX.Element {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  
  // Create path mapping for all routes
  const routePathMap = routes.reduce((acc, route) => {
    const path = route.path || `/${route.id}`;
    acc[route.id] = path;
    
    if (route.children) {
      route.children.forEach(childRoute => {
        const childPath = childRoute.path || `${path}/${childRoute.id}`;
        acc[childRoute.id] = childPath;
      });
    }
    
    return acc;
  }, {} as Record<string, string>);
  
  // Determine if there are any tab-based routes
  const hasTabRoutes = routes.some(route => route.children && route.children.length > 0);
  
  // Restore session if needed
  useEffect(() => {
    if (restoreSession) {
      // For web, we typically don't need to restore session as URL contains state
      // But we could load any additional state from localStorage here
      
      const restoreSession = async () => {
        try {
          // Simulate a delay to show loading
          await new Promise(resolve => setTimeout(resolve, 300));
        } finally {
          setLoading(false);
          if (onReady) onReady();
        }
      };
      
      restoreSession();
    } else {
      setLoading(false);
      if (onReady) onReady();
    }
  }, [restoreSession, onReady]);
  
  // Custom Link component
  const CustomLink = linkComponent || Link;
  
  // Render loading indicator if still loading
  if (loading && showLoadingIndicator) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size="large" 
          color={theme.colors.primary} 
        />
      </View>
    );
  }
  
  // Auth guard for protected routes
  const renderRoute = (route: Route) => {
    const RouteComponent = route.component;
    const path = route.path || `/${route.id}`;
    
    if (route.requiresAuth && isAuthenticated && !isAuthenticated()) {
      return (
        <ReactRoute
          key={route.id}
          path={path}
          element={
            <Navigate
              to="/" // Navigate to login or home
              replace
              state={{ from: path }}
            />
          }
        />
      );
    }
    
    return (
      <ReactRoute
        key={route.id}
        path={path}
        element={
          <RouteWithMeta route={route}>
            <RouteComponent {...route.initialParams} />
          </RouteWithMeta>
        }
      />
    );
  };
  
  // Set initial route
  const initialPath = initialRouteId ? routePathMap[initialRouteId] : undefined;
  
  return (
    <BrowserRouter>
      <View style={{ flex: 1, height: '100vh' }}>
        {hasTabRoutes ? (
          <TabNavigation routes={routes} animated={animated} />
        ) : (
          <Routes>
            {routes.map(route => renderRoute(route))}
            
            {/* Default route - home or first route */}
            {routes.length > 0 && initialPath && (
              <ReactRoute
                path="*"
                element={
                  <Navigate to={initialPath} replace />
                }
              />
            )}
          </Routes>
        )}
      </View>
    </BrowserRouter>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  tabNavigationContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    padding: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    cursor: 'pointer',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabContent: {
    flex: 1,
    overflow: 'auto',
  },
}); 