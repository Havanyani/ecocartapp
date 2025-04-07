import { CommunityFeed } from '@/components/community/CommunityFeed';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

// Mock the animations
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock the expo-image component
jest.mock('expo-image', () => ({
  Image: 'MockedImage'
}));

// Mock the hooks
jest.mock('../../../hooks/useCommunity', () => ({
  useCommunity: jest.fn()
}));

jest.mock('../../../hooks/useOfflineState', () => ({
  useOfflineState: jest.fn()
}));

// Mock the theme hook
jest.mock('@/theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        text: '#000000',
        textSecondary: '#666666',
        background: '#FFFFFF',
        card: '#F5F5F5',
        border: '#E0E0E0',
        primary: '#2E7D32',
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        white: '#FFFFFF',
        black: '#000000',
      },
      dark: false,
    },
    toggleTheme: jest.fn(),
  }),
  getColor: (theme: any, color: string) => theme.colors[color],
  getSpacing: (theme: any, spacing: string) => 8,
}));

// Mock the component dependencies
jest.mock('../../../components/ui/Button', () => ({
  Button: ({ onPress, children }: any) => (
    <button onClick={onPress}>{children}</button>
  )
}));

jest.mock('../../../components/ui/IconSymbol', () => ({
  IconSymbol: ({ name, size, color }: any) => (
    <div data-testid={`icon-${name}`} style={{ width: size, height: size, color }}>
      {name}
    </div>
  )
}));

jest.mock('../../../components/ui/MediaViewer', () => ({
  MediaViewer: ({ images, onClose }: any) => (
    <div data-testid="media-viewer">
      {images.map((img: string, i: number) => (
        <div key={i}>{img}</div>
      ))}
      <button onClick={onClose}>Close</button>
    </div>
  )
}));

// Create mock data
const mockPosts = [
  {
    id: '1',
    content: 'Test post 1',
    createdAt: '2023-09-30T12:00:00Z',
    likes: 5,
    comments: 2,
    user: {
      id: 'user1',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg'
    },
    images: ['https://example.com/image.jpg']
  },
  {
    id: '2',
    content: 'Test post 2',
    createdAt: '2023-09-29T12:00:00Z',
    likes: 15,
    comments: 3,
    user: {
      id: 'user2',
      name: 'Another User',
      avatar: null
    },
    images: []
  }
];

const mockComments = {
  '1': [
    {
      id: 'comment1',
      content: 'Test comment',
      createdAt: '2023-09-30T13:00:00Z',
      user: {
        id: 'user2',
        name: 'Another User'
      }
    }
  ]
};

describe('CommunityFeed', () => {
  // Set up mocks before each test
  beforeEach(() => {
    const useCommunity = require('../../../hooks/useCommunity').useCommunity;
    const useOfflineState = require('../../../hooks/useOfflineState').useOfflineState;
    
    useCommunity.mockReturnValue({
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
    
    useOfflineState.mockReturnValue({
      isOnline: true
    });
  });
  
  it('renders the feed with posts', () => {
    render(
      <ThemeProvider>
        <CommunityFeed />
      </ThemeProvider>
    );
    
    // Check that posts are rendered
    expect(screen.getByText('Test post 1')).toBeTruthy();
    expect(screen.getByText('Test post 2')).toBeTruthy();
    expect(screen.getByText('Test User')).toBeTruthy();
    expect(screen.getByText('Another User')).toBeTruthy();
  });
  
  it('displays empty state when there are no posts', () => {
    const useCommunity = require('../../../hooks/useCommunity').useCommunity;
    useCommunity.mockReturnValue({
      posts: [],
      comments: {},
      isLoading: false,
      error: null,
      hasMorePosts: false,
      loadPosts: jest.fn(),
      loadComments: jest.fn(),
      likePost: jest.fn(),
      addComment: jest.fn(),
    });
    
    render(
      <ThemeProvider>
        <CommunityFeed />
      </ThemeProvider>
    );
    
    expect(screen.getByText('No posts yet. Be the first to share something!')).toBeTruthy();
  });
  
  it('displays error state when there is an error', () => {
    const useCommunity = require('../../../hooks/useCommunity').useCommunity;
    useCommunity.mockReturnValue({
      posts: [],
      comments: {},
      isLoading: false,
      error: new Error('Test error'),
      hasMorePosts: false,
      loadPosts: jest.fn(),
      loadComments: jest.fn(),
      likePost: jest.fn(),
      addComment: jest.fn(),
    });
    
    render(
      <ThemeProvider>
        <CommunityFeed />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Error loading community feed.')).toBeTruthy();
  });
  
  it('displays offline banner when offline', () => {
    const useOfflineState = require('../../../hooks/useOfflineState').useOfflineState;
    useOfflineState.mockReturnValue({
      isOnline: false
    });
    
    render(
      <ThemeProvider>
        <CommunityFeed />
      </ThemeProvider>
    );
    
    expect(screen.getByText("You're offline. Some features may be limited.")).toBeTruthy();
  });
  
  it('filters posts when search query changes', () => {
    const { getByPlaceholderText } = render(
      <ThemeProvider>
        <CommunityFeed />
      </ThemeProvider>
    );
    
    const searchInput = getByPlaceholderText('Search posts...');
    fireEvent.changeText(searchInput, 'Test post 1');
    
    // Only the first post should be visible now
    expect(screen.getByText('Test post 1')).toBeTruthy();
    expect(screen.queryByText('Test post 2')).toBeNull();
  });
  
  it('filters posts when filter is changed', () => {
    const { getByText } = render(
      <ThemeProvider>
        <CommunityFeed />
      </ThemeProvider>
    );
    
    // Click on Popular filter
    const popularFilter = getByText('Popular');
    fireEvent.press(popularFilter);
    
    // Only the second post should be visible (it has 15 likes, which is > 10)
    expect(screen.queryByText('Test post 1')).toBeNull();
    expect(screen.getByText('Test post 2')).toBeTruthy();
  });
}); 