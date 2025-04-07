import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { HomeScreenWrapper } from '@/app/(tabs)/index';
import { MaterialsScreen } from '@/app/(tabs)/materials';
import { CollectionsScreen } from '@/app/(tabs)/collections';
import { CommunityScreen } from '@/app/(tabs)/community';
import { ProfileScreen } from '@/app/(tabs)/profile';
import { useRoutePreloading } from '@/utils/routePreloading';
import { useRouteTransition } from '@/utils/routePreloading';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useSegments: jest.fn(() => []),
  useLocalSearchParams: jest.fn(() => ({})),
}));

// Mock navigation components
jest.mock('@/components/navigation/TabBar', () => ({
  TabBar: () => 'TabBar',
}));

// Mock screens
jest.mock('@/screens/home/HomeScreen', () => ({
  HomeScreen: () => 'HomeScreen',
}));

jest.mock('@/screens/materials/MaterialListScreen', () => ({
  MaterialListScreen: () => 'MaterialListScreen',
}));

jest.mock('@/screens/collections/CollectionListScreen', () => ({
  CollectionListScreen: () => 'CollectionListScreen',
}));

jest.mock('@/screens/community/CommunityScreen', () => ({
  CommunityScreen: () => 'CommunityScreen',
}));

jest.mock('@/screens/profile/ProfileScreen', () => ({
  ProfileScreen: () => 'ProfileScreen',
}));

describe('Route Testing', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Tab Navigation', () => {
    it('should render home screen by default', () => {
      const { getByText } = render(<HomeScreenWrapper />);
      expect(getByText('HomeScreen')).toBeTruthy();
    });

    it('should navigate to materials screen', async () => {
      const { getByText } = render(<MaterialsScreen />);
      expect(getByText('MaterialListScreen')).toBeTruthy();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should navigate to collections screen', async () => {
      const { getByText } = render(<CollectionsScreen />);
      expect(getByText('CollectionListScreen')).toBeTruthy();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should navigate to community screen', async () => {
      const { getByText } = render(<CommunityScreen />);
      expect(getByText('CommunityScreen')).toBeTruthy();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should navigate to profile screen', async () => {
      const { getByText } = render(<ProfileScreen />);
      expect(getByText('ProfileScreen')).toBeTruthy();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe('Route Preloading', () => {
    it('should preload critical routes in priority order', async () => {
      const { preloadCriticalRoutes } = useRoutePreloading();
      await preloadCriticalRoutes();

      await waitFor(() => {
        // Should preload routes in priority order (1: highest, 3: lowest)
        expect(mockRouter.push).toHaveBeenCalledTimes(7); // Number of critical routes
      });
    });

    it('should preload route group with priority', async () => {
      const { preloadRouteGroup } = useRoutePreloading();
      await preloadRouteGroup('auth');

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledTimes(4); // Number of auth routes
      });
    });

    it('should preload specific route with retry logic', async () => {
      const { preloadRoute } = useRoutePreloading();
      await preloadRoute('/materials');

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/materials');
      });
    });

    it('should handle preload failures with retries', async () => {
      const { preloadRoute } = useRoutePreloading();
      mockRouter.push.mockRejectedValueOnce(new Error('Network error'));
      
      await preloadRoute('/materials');

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledTimes(2); // Initial attempt + retry
      });
    });

    it('should clear preloaded routes cache', async () => {
      const { preloadRoute, clearPreloadedRoutes } = useRoutePreloading();
      await preloadRoute('/materials');
      clearPreloadedRoutes();
      await preloadRoute('/materials');

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledTimes(2); // Should preload twice after clearing cache
      });
    });
  });

  describe('Route Transitions', () => {
    it('should navigate with transition and preloading', async () => {
      const { navigateWithTransition } = useRouteTransition();
      await navigateWithTransition('/materials', { category: 'plastic' });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledTimes(2); // Preload + navigation
      });
    });

    it('should replace with transition and preloading', async () => {
      const { replaceWithTransition } = useRouteTransition();
      await replaceWithTransition('/profile', { tab: 'settings' });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledTimes(1); // Preload
        expect(mockRouter.replace).toHaveBeenCalledWith('/profile?tab=settings');
      });
    });

    it('should go back with transition', async () => {
      const { goBackWithTransition } = useRouteTransition();
      goBackWithTransition();

      await waitFor(() => {
        expect(mockRouter.back).toHaveBeenCalled();
      });
    });
  });
}); 