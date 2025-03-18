import { render } from '@testing-library/react-native';
import React from 'react';
import { useCommunity } from '../../../hooks/useCommunity';
import { UserProfile } from '../../../services/CommunityService';
import { Leaderboard } from '../Leaderboard';

// Mock the useCommunity hook
jest.mock('../../../hooks/useCommunity');

const mockUseCommunity = useCommunity as jest.MockedFunction<typeof useCommunity>;

describe('Leaderboard', () => {
  const mockLeaderboard: UserProfile[] = [
    {
      id: 'user1',
      name: 'John Doe',
      avatar: 'https://example.com/avatar1.jpg',
      level: 5,
      achievements: [],
      joinDate: new Date().toISOString(),
      stats: {
        points: 2500,
        totalCollections: 25,
        totalWeight: 125.5,
      },
    },
    {
      id: 'user2',
      name: 'Jane Smith',
      avatar: 'https://example.com/avatar2.jpg',
      level: 4,
      achievements: [],
      joinDate: new Date().toISOString(),
      stats: {
        points: 2000,
        totalCollections: 20,
        totalWeight: 100.0,
      },
    },
    {
      id: 'user3',
      name: 'Mike Johnson',
      avatar: 'https://example.com/avatar3.jpg',
      level: 3,
      achievements: [],
      joinDate: new Date().toISOString(),
      stats: {
        points: 1500,
        totalCollections: 15,
        totalWeight: 75.0,
      },
    },
  ];

  beforeEach(() => {
    mockUseCommunity.mockReturnValue({
      leaderboard: mockLeaderboard,
      isLoading: false,
      error: null,
      loadLeaderboard: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders leaderboard entries correctly', () => {
    const { getByText } = render(<Leaderboard />);

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Jane Smith')).toBeTruthy();
    expect(getByText('Mike Johnson')).toBeTruthy();
    expect(getByText('2500')).toBeTruthy();
    expect(getByText('2000')).toBeTruthy();
    expect(getByText('1500')).toBeTruthy();
  });

  it('displays loading state', () => {
    mockUseCommunity.mockReturnValue({
      ...mockUseCommunity(),
      isLoading: true,
    });

    const { getByText } = render(<Leaderboard />);
    expect(getByText('Loading leaderboard...')).toBeTruthy();
  });

  it('displays error state', () => {
    mockUseCommunity.mockReturnValue({
      ...mockUseCommunity(),
      error: new Error('Failed to load leaderboard'),
    });

    const { getByText } = render(<Leaderboard />);
    expect(getByText('Error loading leaderboard. Please try again.')).toBeTruthy();
  });

  it('displays empty state when no entries', () => {
    mockUseCommunity.mockReturnValue({
      ...mockUseCommunity(),
      leaderboard: [],
    });

    const { getByText } = render(<Leaderboard />);
    expect(getByText('No users found in the leaderboard.')).toBeTruthy();
  });

  it('displays correct rank colors', () => {
    const { getByTestId } = render(<Leaderboard />);

    const firstPlace = getByTestId('rank-1');
    const secondPlace = getByTestId('rank-2');
    const thirdPlace = getByTestId('rank-3');
    const otherPlace = getByTestId('rank-4');

    expect(firstPlace.props.style[1].color).toBe('#FFD700'); // Gold
    expect(secondPlace.props.style[1].color).toBe('#C0C0C0'); // Silver
    expect(thirdPlace.props.style[1].color).toBe('#CD7F32'); // Bronze
    expect(otherPlace.props.style[1].color).toBe('#000000'); // Default text color
  });

  it('displays user stats correctly', () => {
    const { getByText } = render(<Leaderboard />);

    // Check first user's stats
    expect(getByText('25')).toBeTruthy();
    expect(getByText('125.5kg')).toBeTruthy();

    // Check second user's stats
    expect(getByText('20')).toBeTruthy();
    expect(getByText('100.0kg')).toBeTruthy();

    // Check third user's stats
    expect(getByText('15')).toBeTruthy();
    expect(getByText('75.0kg')).toBeTruthy();
  });

  it('displays user avatars correctly', () => {
    const { getByTestId } = render(<Leaderboard />);

    const avatar1 = getByTestId('avatar-user1');
    const avatar2 = getByTestId('avatar-user2');
    const avatar3 = getByTestId('avatar-user3');

    expect(avatar1.props.source.uri).toBe('https://example.com/avatar1.jpg');
    expect(avatar2.props.source.uri).toBe('https://example.com/avatar2.jpg');
    expect(avatar3.props.source.uri).toBe('https://example.com/avatar3.jpg');
  });

  it('displays fallback avatar when no avatar URL is provided', () => {
    const leaderboardWithoutAvatars = mockLeaderboard.map(user => ({
      ...user,
      avatar: undefined,
    }));

    mockUseCommunity.mockReturnValue({
      ...mockUseCommunity(),
      leaderboard: leaderboardWithoutAvatars,
    });

    const { getByTestId } = render(<Leaderboard />);

    const avatar1 = getByTestId('avatar-user1');
    const avatar2 = getByTestId('avatar-user2');
    const avatar3 = getByTestId('avatar-user3');

    expect(avatar1.props.children).toBeTruthy();
    expect(avatar2.props.children).toBeTruthy();
    expect(avatar3.props.children).toBeTruthy();
  });
}); 