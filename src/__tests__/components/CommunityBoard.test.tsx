import { act, fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import CommunityBoard from '../../components/CommunityBoard';
import { useTheme } from '../../hooks/useTheme';

// Mock theme hook
jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn()
}));

// Mock icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
  Feather: 'Feather'
}));

describe('CommunityBoard', () => {
  const mockPosts = [
    {
      id: '1',
      userId: 'user1',
      username: 'EcoWarrior',
      content: 'Just recycled 10kg of plastic!',
      timestamp: '2024-02-20T10:00:00Z',
      likes: 15,
      comments: 3,
      imageUrl: 'https://example.com/image1.jpg'
    },
    {
      id: '2',
      userId: 'user2',
      username: 'GreenHero',
      content: 'New collection milestone reached!',
      timestamp: '2024-02-20T09:30:00Z',
      likes: 8,
      comments: 1,
      imageUrl: null
    }
  ];

  const mockTheme = {
    colors: {
      primary: '#2e7d32',
      text: '#000000',
      background: '#ffffff'
    }
  };

  const mockOnLike = jest.fn();
  const mockOnShare = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders posts correctly', () => {
    const { getByText, getAllByTestId } = render(
      <CommunityBoard 
        posts={mockPosts}
        onLike={mockOnLike}
        onShare={mockOnShare}
      />
    );

    expect(getAllByTestId('post-item')).toHaveLength(2);
    expect(getByText('EcoWarrior')).toBeTruthy();
    expect(getByText('Just recycled 10kg of plastic!')).toBeTruthy();
  });

  it('handles like interaction', async () => {
    const { getByTestId } = render(
      <CommunityBoard 
        posts={mockPosts}
        onLike={mockOnLike}
        onShare={mockOnShare}
      />
    );

    await act(async () => {
      fireEvent.press(getByTestId('like-button-1'));
    });

    expect(mockOnLike).toHaveBeenCalledWith('1');
  });

  it('handles share interaction', async () => {
    const { getByTestId } = render(
      <CommunityBoard 
        posts={mockPosts}
        onLike={mockOnLike}
        onShare={mockOnShare}
      />
    );

    await act(async () => {
      fireEvent.press(getByTestId('share-button-1'));
    });

    expect(mockOnShare).toHaveBeenCalledWith(mockPosts[0]);
  });

  it('displays post metadata correctly', () => {
    const { getByText } = render(
      <CommunityBoard 
        posts={mockPosts}
        onLike={mockOnLike}
        onShare={mockOnShare}
      />
    );

    expect(getByText('15 likes')).toBeTruthy();
    expect(getByText('3 comments')).toBeTruthy();
  });

  it('handles empty posts list', () => {
    const { getByText } = render(
      <CommunityBoard 
        posts={[]}
        onLike={mockOnLike}
        onShare={mockOnShare}
      />
    );

    expect(getByText('No posts yet')).toBeTruthy();
  });

  it('provides accessible interactions', () => {
    const { getByTestId } = render(
      <CommunityBoard 
        posts={mockPosts}
        onLike={mockOnLike}
        onShare={mockOnShare}
      />
    );

    const likeButton = getByTestId('like-button-1');
    expect(likeButton).toHaveAccessibilityRole('button');
    expect(likeButton).toHaveAccessibilityLabel(
      expect.stringContaining('Like')
    );
    expect(likeButton).toHaveAccessibilityValue({ text: '15 likes' });
  });

  it('applies theme styles correctly', () => {
    const { getByTestId } = render(
      <CommunityBoard 
        posts={mockPosts}
        onLike={mockOnLike}
        onShare={mockOnShare}
      />
    );

    const postItem = getByTestId('post-item-1');
    expect(postItem).toHaveStyle({
      backgroundColor: mockTheme.colors.background,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16
    });
  });
}); 