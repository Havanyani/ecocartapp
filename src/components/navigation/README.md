# Navigation Components

A set of cross-platform navigation components that provide consistent routing and navigation across web and native platforms, while leveraging platform-specific navigation patterns.

## Components

### Router

The `Router` component serves as the central navigation system for the application, handling route configuration, navigation state, and platform-specific navigation patterns.

#### Features

- 🔄 **Cross-platform**: Works consistently on both native mobile and web platforms
- 🧩 **Unified API**: Same interface and component structure across platforms
- 🔒 **Authentication**: Built-in support for protected routes
- 🔗 **Deep linking**: Support for deep linking on both platforms
- 🔥 **Tab navigation**: Support for tab-based navigation with nested routes
- 🎭 **Animations**: Configurable transitions between screens
- 🖼️ **SEO**: SEO optimizations for web routes with metadata support

### NavigationLink

The `NavigationLink` component provides a consistent way to navigate between screens across platforms, handling the platform-specific navigation mechanisms.

#### Features

- 🔄 **Cross-platform**: Works on both native and web
- 💅 **Customizable**: Supports custom styling, including active state styles
- 🔧 **Flexible**: Works with both path-based and name-based navigation
- 🔌 **Params**: Supports passing parameters to routes
- 🚀 **Prefetching**: Optional prefetching of linked routes on web
- 🔗 **Replace**: Option to replace the current route in history

## Usage Examples

### Router Configuration

```tsx
import React from 'react';
import { Router } from '../components/navigation/Router';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';

const AppRouter = () => {
  // Check if user is logged in
  const isAuthenticated = () => {
    // Replace with your auth logic
    return localStorage.getItem('token') !== null;
  };
  
  // Handle unauthorized access
  const handleUnauthorized = () => {
    // Navigate to login or show auth modal
    console.log('User is not authenticated');
  };
  
  // Define routes configuration
  const routes = [
    {
      id: 'home',
      title: 'Home',
      component: HomeScreen,
      path: '/',
      icon: '🏠',
    },
    {
      id: 'profile',
      title: 'Profile',
      component: ProfileScreen,
      path: '/profile',
      icon: '👤',
      requiresAuth: true,
      meta: {
        description: 'User profile page',
        keywords: ['profile', 'user', 'account'],
      },
    },
    {
      id: 'settings',
      title: 'Settings',
      component: SettingsScreen,
      path: '/settings',
      icon: '⚙️',
      children: [
        {
          id: 'account',
          title: 'Account Settings',
          component: AccountSettingsScreen,
          path: '/settings/account',
        },
        {
          id: 'notifications',
          title: 'Notification Settings',
          component: NotificationSettingsScreen,
          path: '/settings/notifications',
        },
      ],
    },
    {
      id: 'login',
      title: 'Login',
      component: LoginScreen,
      path: '/login',
    },
  ];
  
  return (
    <Router
      routes={routes}
      initialRouteId="home"
      isAuthenticated={isAuthenticated}
      onUnauthorized={handleUnauthorized}
      theme="light"
      animated={true}
    />
  );
};

export default AppRouter;
```

### NavigationLink Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationLink } from '../components/navigation/NavigationLink';

const Navigation = () => {
  return (
    <View style={styles.container}>
      <NavigationLink 
        to="home"
        style={styles.link}
        activeStyle={styles.activeLink}
      >
        Home
      </NavigationLink>
      
      <NavigationLink 
        to="profile"
        style={styles.link}
        activeStyle={styles.activeLink}
        params={{ tab: 'posts' }}
      >
        Profile
      </NavigationLink>
      
      <NavigationLink 
        to="settings"
        style={styles.link}
        activeStyle={styles.activeLink}
      >
        Settings
      </NavigationLink>
      
      <NavigationLink 
        to="/login"
        style={styles.link}
        activeStyle={styles.activeLink}
        replace={true}
      >
        Login
      </NavigationLink>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
  },
  link: {
    marginRight: 16,
    padding: 8,
  },
  activeLink: {
    borderBottomWidth: 2,
    borderBottomColor: 'blue',
  },
});

export default Navigation;
```

## Platform-Specific Details

### Native (iOS & Android)

The native implementation:
- Uses React Navigation for navigation
- Supports stack and tab navigation
- Handles state persistence and restoration
- Implements authentication protection
- Optimized for mobile gesture-based navigation

### Web

The web implementation:
- Uses React Router for URL-based navigation
- Provides SEO optimization with metadata and proper titles
- Supports browser history and URL parameters
- Implements tab-based navigation with URL paths
- Provides keyboard accessibility

## Integration with Expo Router

These components can be used alongside Expo Router or as an alternative, depending on project needs:

- Use Expo Router for file-based routing when following Expo's conventions
- Use these custom Router components when you need more control or custom routing logic

## Contributing

When enhancing these navigation components:

1. Maintain the unified interface between platforms
2. Test on both web and native platforms
3. Consider accessibility in your implementation
4. Document any platform-specific behaviors 