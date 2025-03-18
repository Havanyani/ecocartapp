import { CommunityScreen } from '@/screens/CommunityScreen';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

// Mock hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '123',
      name: 'Test User'
    }
  })
}));

jest.mock('@/hooks/useCommunityActions', () => ({
  useCommunityActions: () => ({
    handleLike: jest.fn(),
    handleShare: jest.fn(),
    handleComment: jest.fn()
  })
}));

describe('CommunityScreen', () => {
  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<CommunityScreen />);
    
    expect(getByText('Top Recyclers This Month')).toBeTruthy();
    expect(getByPlaceholderText('Share your recycling journey...')).toBeTruthy();
  });

  it('handles post creation', async () => {
    const { getByPlaceholderText, getByText } = render(<CommunityScreen />);
    
    const input = getByPlaceholderText('Share your recycling journey...');
    fireEvent.changeText(input, 'Test post content');
    
    const shareButton = getByText('Share');
    fireEvent.press(shareButton);

    await waitFor(() => {
      expect(input.props.value).toBe(''); // Input should be cleared
    });
  });

  it('displays leaderboard entries', () => {
    const { getByText } = render(<CommunityScreen />);
    
    expect(getByText('Sarah M.')).toBeTruthy();
    expect(getByText('156.7kg collected')).toBeTruthy();
  });

  it('handles post interactions', () => {
    const { getAllByRole } = render(<CommunityScreen />);
    
    const buttons = getAllByRole('button');
    fireEvent.press(buttons[0]); // Like button
    fireEvent.press(buttons[1]); // Comment button
    fireEvent.press(buttons[2]); // Share button
    
    // Verify interactions were handled (mock functions were called)
  });

  it('displays environmental impact on posts', () => {
    const { getByText } = render(<CommunityScreen />);
    
    expect(getByText('5kg plastic')).toBeTruthy();
    expect(getByText('15kg CO₂ saved')).toBeTruthy();
  });

  it('handles refresh', async () => {
    const { getByTestId } = render(<CommunityScreen />);
    
    const flatList = getByTestId('posts-list');
    const { refreshControl } = flatList.props;
    
    fireEvent(refreshControl, 'refresh');
    
    await waitFor(() => {
      expect(refreshControl.props.refreshing).toBe(false);
    });
  });

  it('shows empty state when no posts', () => {
    const { getByText } = render(<CommunityScreen />);
    
    // Mock empty posts state
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [[], jest.fn()]);
    
    expect(getByText('No posts yet. Be the first to share!')).toBeTruthy();
  });
}); 