import { useAuth } from '@/hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

// Define user roles
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  ANALYST = 'ANALYST',
}

type RouteRoles = {
  [key: string]: UserRole[];
};

// Define protected routes and their required roles
export const protectedRoutes: RouteRoles = {
  // Admin routes
  '/(analytics)/bundle-optimization': [UserRole.ADMIN, UserRole.ANALYST],
  '/(analytics)/tree-shaking': [UserRole.ADMIN, UserRole.ANALYST],
  '/(analytics)/ai-performance': [UserRole.ADMIN, UserRole.ANALYST],
  '/(analytics)/ai-benchmark': [UserRole.ADMIN, UserRole.ANALYST],
  '/(analytics)/ai-config': [UserRole.ADMIN],
  '/(analytics)/environmental-impact': [UserRole.ADMIN, UserRole.ANALYST],

  // Moderator routes
  '/(tabs)/community': [UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER],

  // User routes (require authentication)
  '/(tabs)/profile': [UserRole.ADMIN, UserRole.MODERATOR, UserRole.ANALYST, UserRole.USER],
  '/(tabs)/materials': [UserRole.ADMIN, UserRole.MODERATOR, UserRole.ANALYST, UserRole.USER],
  '/(tabs)/collections': [UserRole.ADMIN, UserRole.MODERATOR, UserRole.ANALYST, UserRole.USER],
  '/(modals)/ar-container-scan': [UserRole.ADMIN, UserRole.MODERATOR, UserRole.ANALYST, UserRole.USER],
  '/(smart-home)': [UserRole.ADMIN, UserRole.MODERATOR, UserRole.ANALYST, UserRole.USER],
};

// Define public routes that don't require authentication
export const publicRoutes = [
  '/(auth)/login',
  '/(auth)/signup',
  '/(auth)/forgot-password',
  '/(auth)/reset-password',
  '/(auth)/two-factor-setup',
] as const;

// Helper function to check if a route is protected
export function isProtectedRoute(route: string): boolean {
  return Object.keys(protectedRoutes).some(protectedRoute => 
    route.startsWith(protectedRoute)
  );
}

// Helper function to check if a route is public
export function isPublicRoute(route: string): boolean {
  return publicRoutes.some(publicRoute => 
    route.startsWith(publicRoute)
  );
}

// Helper function to check if user has required role for a route
export function hasRequiredRole(userRole: UserRole, route: string): boolean {
  const requiredRoles = protectedRoutes[route];
  if (!requiredRoles) return true; // If route is not in protectedRoutes, allow access
  return requiredRoles.includes(userRole);
}

// Hook to handle route protection
export function useRouteGuard() {
  const { isAuthenticated, user } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    const state = navigation.getState();
    if (!state) return;

    const currentRoute = state.routes[state.index]?.name;
    if (!currentRoute) return;

    const inAuthGroup = currentRoute.startsWith('(auth)');

    // Handle authentication
    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and trying to access protected route
      router.replace('/(auth)/login');
      return;
    }

    if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated and trying to access auth screens
      router.replace('/(tabs)');
      return;
    }

    // Handle role-based access
    if (isAuthenticated && user && isProtectedRoute(currentRoute)) {
      const hasAccess = hasRequiredRole(user.role, currentRoute);
      if (!hasAccess) {
        // Redirect to home if user doesn't have required role
        router.replace('/(tabs)');
        return;
      }
    }
  }, [isAuthenticated, navigation, user]);
} 