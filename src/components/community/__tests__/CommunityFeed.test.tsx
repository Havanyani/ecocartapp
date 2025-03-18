import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useCommunity } from '../../../hooks/useCommunity';
import { useTheme } from '../../../hooks/useTheme';
import { CommunityFeed } from '../CommunityFeed';

// Mock the hooks
jest.mock('../../../hooks/useCommunity');
jest.mock('../../../hooks/useTheme');

describe('CommunityFeed', () => {
  const mockPosts = [
    {
      id: '1',
      content: 'Test post 1',
      images: ['https://picsum.photos/400/400?random=1'],
      likes: 10,
      comments: 5,
      createdAt: new Date().toISOString(),
      user: {
        name: 'Test User 1',
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
    },
    {
      id: '2',
      content: 'Test post 2',
      likes: 20,
      comments: 8,
      createdAt: new Date().toISOString(),
      user: {
        name: 'Test User 2',
      },
    },
  ];

  const mockComments = {
    '1': [
      {
        id: 'comment-1',
        content: 'Test comment 1',
        createdAt: new Date().toISOString(),
        user: {
          name: 'Commenter 1',
          avatar: 'https://i.pravatar.cc/150?img=101',
        },
      },
    ],
  };

  beforeEach(() => {
    // Mock useTheme
    (useTheme as jest.Mock).mockReturnValue({
      theme: {
        colors: {
          primary: '#007AFF',
          secondary: '#5856D6',
          background: '#FFFFFF',
          text: {
            primary: '#000000',
            secondary: '#8E8E93',
          },
        },
      },
    });

    // Mock useCommunity
    (useCommunity as jest.Mock).mockReturnValue({
      posts: mockPosts,
      comments: mockComments,
      isLoading: false,
      error: null,
      hasMorePosts: true,
      loadPosts: jest.fn(),
      loadComments: jest.fn(),
      likePost: jest.fn(),
      addComment: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders posts correctly', () => {
    const { getByText, getByTestId } = render(<CommunityFeed />);

    // Check if posts are rendered
    expect(getByText('Test post 1')).toBeTruthy();
    expect(getByText('Test post 2')).toBeTruthy();
    expect(getByText('Test User 1')).toBeTruthy();
    expect(getByText('Test User 2')).toBeTruthy();
  });

  it('handles post filtering', async () => {
    const { getByText, getByPlaceholderText } = render(<CommunityFeed />);

    // Test search functionality
    const searchInput = getByPlaceholderText('Search posts...');
    fireEvent.changeText(searchInput, 'Test post 1');

    await waitFor(() => {
      expect(getByText('Test post 1')).toBeTruthy();
      expect(() => getByText('Test post 2')).toThrow();
    });

    // Test filter buttons
    fireEvent.press(getByText('Recent'));
    fireEvent.press(getByText('Popular'));
    fireEvent.press(getByText('All'));
  });

  it('handles post interactions', async () => {
    const mockLikePost = jest.fn();
    const mockAddComment = jest.fn();
    (useCommunity as jest.Mock).mockReturnValue({
      ...useCommunity(),
      likePost: mockLikePost,
      addComment: mockAddComment,
    });

    const { getByText, getByPlaceholderText } = render(<CommunityFeed />);

    // Test like functionality
    fireEvent.press(getByText('10'));
    expect(mockLikePost).toHaveBeenCalledWith('1');

    // Test comment functionality
    fireEvent.press(getByText('5'));
    const commentInput = getByPlaceholderText('Add a comment...');
    fireEvent.changeText(commentInput, 'New comment');
    fireEvent.press(getByText('Post'));

    expect(mockAddComment).toHaveBeenCalledWith('1', 'New comment');
  });

  it('displays loading state', () => {
    (useCommunity as jest.Mock).mockReturnValue({
      ...useCommunity(),
      isLoading: true,
    });

    const { getByTestId } = render(<CommunityFeed />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('displays error state', () => {
    (useCommunity as jest.Mock).mockReturnValue({
      ...useCommunity(),
      error: 'Failed to load posts',
    });

    const { getByText } = render(<CommunityFeed />);
    expect(getByText('Error loading community feed. Please try again.')).toBeTruthy();
  });

  it('displays empty state', () => {
    (useCommunity as jest.Mock).mockReturnValue({
      ...useCommunity(),
      posts: [],
    });

    const { getByText } = render(<CommunityFeed />);
    expect(getByText('No posts found. Be the first to share!')).toBeTruthy();
  });
}); 