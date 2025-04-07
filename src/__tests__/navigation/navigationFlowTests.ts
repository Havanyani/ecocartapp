import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useSegments: jest.fn(() => []),
  useLocalSearchParams: jest.fn(() => ({})),
}));

// Mock auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: '1', name: 'Test User' },
  }),
}));

describe('Navigation Flows', () => {
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

  describe('Material Flow', () => {
    it('should navigate from home to materials list', async () => {
      const { getByText } = render(<HomeScreenWrapper />);
      fireEvent.press(getByText('Materials'));

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/materials');
      });
    });

    it('should navigate from materials list to material details', async () => {
      const { getByText } = render(<MaterialsScreen />);
      fireEvent.press(getByText('Material Item'));

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/materials/123');
      });
    });

    it('should navigate back from material details', async () => {
      const { getByText } = render(<MaterialDetailScreen />);
      fireEvent.press(getByText('Back'));

      await waitFor(() => {
        expect(mockRouter.back).toHaveBeenCalled();
      });
    });
  });

  describe('Collection Flow', () => {
    it('should navigate from home to collections list', async () => {
      const { getByText } = render(<HomeScreenWrapper />);
      fireEvent.press(getByText('Collections'));

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/collections');
      });
    });

    it('should navigate from collections list to collection details', async () => {
      const { getByText } = render(<CollectionsScreen />);
      fireEvent.press(getByText('Collection Item'));

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/collections/123');
      });
    });

    it('should navigate back from collection details', async () => {
      const { getByText } = render(<CollectionDetailScreen />);
      fireEvent.press(getByText('Back'));

      await waitFor(() => {
        expect(mockRouter.back).toHaveBeenCalled();
      });
    });
  });

  describe('Community Flow', () => {
    it('should navigate from home to community', async () => {
      const { getByText } = render(<HomeScreenWrapper />);
      fireEvent.press(getByText('Community'));

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/community');
      });
    });

    it('should navigate from community to challenges', async () => {
      const { getByText } = render(<CommunityScreen />);
      fireEvent.press(getByText('Challenges'));

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/community/challenges');
      });
    });

    it('should navigate from challenges to challenge details', async () => {
      const { getByText } = render(<ChallengesScreen />);
      fireEvent.press(getByText('Challenge Item'));

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/community/challenges/123');
      });
    });
  });

  describe('Profile Flow', () => {
    it('should navigate from home to profile', async () => {
      const { getByText } = render(<HomeScreenWrapper />);
      fireEvent.press(getByText('Profile'));

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/profile');
      });
    });

    it('should navigate from profile to settings', async () => {
      const { getByText } = render(<ProfileScreen />);
      fireEvent.press(getByText('Settings'));

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/profile/settings');
      });
    });

    it('should navigate back from settings', async () => {
      const { getByText } = render(<SettingsScreen />);
      fireEvent.press(getByText('Back'));

      await waitFor(() => {
        expect(mockRouter.back).toHaveBeenCalled();
      });
    });
  });

  describe('Authentication Flow', () => {
    it('should navigate to login when not authenticated', async () => {
      const { useAuth } = require('@/contexts/AuthContext');
      useAuth.mockReturnValue({ isAuthenticated: false });

      const { getByText } = render(<HomeScreenWrapper />);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/auth/login');
      });
    });

    it('should navigate to signup from login', async () => {
      const { getByText } = render(<LoginScreen />);
      fireEvent.press(getByText('Sign Up'));

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/signup');
      });
    });

    it('should navigate to forgot password from login', async () => {
      const { getByText } = render(<LoginScreen />);
      fireEvent.press(getByText('Forgot Password'));

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/forgot-password');
      });
    });
  });
}); 