/**
 * NavigationLink.web.tsx
 * 
 * Web-specific implementation of the NavigationLink component.
 * Uses React Router for web platform navigation with URL-based routing.
 */

import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
} from 'react-native';
import {
    Link,
    useMatch,
    useResolvedPath,
} from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import type { NavigationLinkProps } from './NavigationLink';

export function NavigationLink({
  to,
  children,
  params = {},
  style,
  textStyle,
  onPress,
  isActive: propIsActive,
  activeStyle,
  activeTextStyle,
  replace = false,
  prefetch = false,
  accessibilityLabel,
  testID,
}: NavigationLinkProps): JSX.Element {
  const { theme } = useTheme();
  
  // Process path and params for URL
  let path = to;
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  
  // Add query parameters if any
  if (params && Object.keys(params).length > 0) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    if (queryString) {
      path = `${path}?${queryString}`;
    }
  }
  
  // Use React Router's matching to determine if link is active
  const resolved = useResolvedPath(path);
  const match = useMatch({ path: resolved.pathname, end: true });
  
  // Allow active state to be controlled externally or determined automatically
  const isActive = propIsActive !== undefined ? propIsActive : !!match;
  
  // Handle prefetching (if supported by your app architecture)
  React.useEffect(() => {
    if (prefetch) {
      // This is a placeholder for actual prefetching logic
      // Depending on your setup, you might use code splitting and dynamic imports
      // or a custom prefetching mechanism
      
      // Example:
      // prefetchRoute(to);
    }
  }, [prefetch, to]);
  
  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    if (onPress) {
      e.preventDefault();
      onPress();
    }
  };
  
  // If children is a string, wrap it in a Text component
  const content = typeof children === 'string' 
    ? (
        <Text 
          style={[
            styles.text, 
            { color: theme.colors.primary },
            textStyle,
            isActive && styles.activeText,
            isActive && { color: theme.colors.primaryDark },
            isActive && activeTextStyle,
          ]}
        >
          {children}
        </Text>
      )
    : children;
  
  return (
    <Link
      to={path}
      replace={replace}
      onClick={handleClick}
      style={{
        textDecoration: 'none',
        display: 'inline-flex',
        ...StyleSheet.flatten(styles.link),
        ...StyleSheet.flatten(style),
        ...(isActive ? StyleSheet.flatten(styles.activeLink) : {}),
        ...(isActive && activeStyle ? StyleSheet.flatten(activeStyle) : {}),
      }}
      aria-label={accessibilityLabel}
      data-testid={testID}
    >
      <Pressable style={{ outline: 'none' }}>
        {content}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  link: {
    padding: 8,
    cursor: 'pointer',
  },
  activeLink: {
    // Default active styles
  },
  text: {
    fontSize: 16,
  },
  activeText: {
    fontWeight: 'bold',
  },
}); 