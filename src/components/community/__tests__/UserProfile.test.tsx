import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { useCommunity } from '../../../hooks/useCommunity';
import { UserProfile } from '../UserProfile';

// Mock the useCommunity hook
jest.mock('../../../hooks/useCommunity');

const mockUseCommunity = useCommunity as jest.MockedFunction<typeof useCommunity>;

describe('UserProfile', () => {
  const mockProfile = {
    id: 'user1',
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Environmental enthusiast',
    level: 5,
    achievements: [
      {
        id: 'achievement1',
        title: 'First Collection',
        description: 'Complete your first collection',
        icon: 'star',
        progress: 100,
        completed: true,
        completedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'achievement2',
        title: 'Collection Master',
        description: 'Complete 10 collections',
        icon: 'trophy',
        progress: 60,
        completed: false,
      },
    ],
    stats: {
      totalCollections: 6,
      totalWeight: 25.5,
      streak: 3,
      rank: 12,
      points: 1250,
    },
    joinDate: '2023-12-01T00:00:00Z',
  };

  const mockAchievements = mockProfile.achievements;

  beforeEach(() => {
    mockUseCommunity.mockReturnValue({
      profile: mockProfile,
      achievements: mockAchievements,
      isLoading: false,
      error: null,
      loadProfile: jest.fn(),
      loadAchievements: jest.fn(),
      updateProfile: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders profile information correctly', () => {
    const { getByText } = render(<UserProfile />);

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Level 5')).toBeTruthy();
    expect(getByText('Environmental enthusiast')).toBeTruthy();
    expect(getByText('6')).toBeTruthy();
    expect(getByText('25.5kg')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
    expect(getByText('#12')).toBeTruthy();
  });

  it('displays loading state', () => {
    mockUseCommunity.mockReturnValue({
      ...mockUseCommunity(),
      isLoading: true,
    });

    const { getByText } = render(<UserProfile />);
    expect(getByText('Loading profile...')).toBeTruthy();
  });

  it('displays error state', () => {
    mockUseCommunity.mockReturnValue({
      ...mockUseCommunity(),
      error: new Error('Failed to load profile'),
    });

    const { getByText } = render(<UserProfile />);
    expect(getByText('Error loading profile. Please try again.')).toBeTruthy();
  });

  it('displays empty state when no profile', () => {
    mockUseCommunity.mockReturnValue({
      ...mockUseCommunity(),
      profile: null,
    });

    const { getByText } = render(<UserProfile />);
    expect(getByText('No profile found.')).toBeTruthy();
  });

  it('renders achievements correctly', () => {
    const { getByText } = render(<UserProfile />);

    expect(getByText('First Collection')).toBeTruthy();
    expect(getByText('Complete your first collection')).toBeTruthy();
    expect(getByText('Collection Master')).toBeTruthy();
    expect(getByText('Complete 10 collections')).toBeTruthy();
    expect(getByText('Completed 1/1/2024')).toBeTruthy();
  });

  it('displays achievement progress correctly', () => {
    const { getByTestId } = render(<UserProfile />);

    const progressBar = getByTestId('achievement-progress-achievement2');
    expect(progressBar.props.style[1].width).toBe('60%');
  });

  it('handles profile update', async () => {
    const mockUpdateProfile = jest.fn();
    mockUseCommunity.mockReturnValue({
      ...mockUseCommunity(),
      updateProfile: mockUpdateProfile,
    });

    const { getByTestId } = render(<UserProfile />);
    const editButton = getByTestId('edit-profile-button');
    
    fireEvent.press(editButton);
    
    expect(mockUpdateProfile).toHaveBeenCalled();
  });

  it('displays correct achievement icons', () => {
    const { getByTestId } = render(<UserProfile />);

    expect(getByTestId('achievement-icon-achievement1')).toBeTruthy();
    expect(getByTestId('achievement-icon-achievement2')).toBeTruthy();
  });

  it('displays correct achievement completion status', () => {
    const { getByTestId } = render(<UserProfile />);

    const completedAchievement = getByTestId('achievement-achievement1');
    const incompleteAchievement = getByTestId('achievement-achievement2');

    expect(completedAchievement.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: expect.any(String),
      })
    );
    expect(incompleteAchievement.props.style).not.toContainEqual(
      expect.objectContaining({
        backgroundColor: expect.any(String),
      })
    );
  });
}); 