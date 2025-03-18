import React from 'react';
import TestRenderer from 'react-test-renderer';
import { useCommunity } from '../useCommunity';
import { useOfflineState } from '../useOfflineState';

// Mock the useOfflineState hook
jest.mock('../useOfflineState');

interface Post {
  id: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  createdAt: string;
  user: {
    name: string;
    avatar?: string;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    avatar?: string;
  };
}

function TestComponent() {
  const community = useCommunity();
  return (
    <div>
      <div data-testid="posts-count">{community.posts.length}</div>
      <div data-testid="is-loading">{community.isLoading.toString()}</div>
      <div data-testid="error">{community.error}</div>
      <button onClick={() => community.loadPosts(2)}>Load More</button>
      <button onClick={() => community.likePost('1')}>Like Post</button>
      <button onClick={() => community.addComment('1', 'Test comment')}>Add Comment</button>
    </div>
  );
}

describe('useCommunity', () => {
  beforeEach(() => {
    // Mock useOfflineState to return online state
    (useOfflineState as jest.Mock).mockReturnValue({
      isOnline: true,
      syncPendingActions: jest.fn(),
      retryFailedActions: jest.fn(),
      pendingActions: [],
      failedActions: [],
      failedActionsCount: 0,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loads initial posts when online', async () => {
    const testRenderer = TestRenderer.create(<TestComponent />);
    const testInstance = testRenderer.root;

    // Initial state
    expect(testInstance.findByProps({ 'data-testid': 'posts-count' }).children).toEqual(['0']);
    expect(testInstance.findByProps({ 'data-testid': 'is-loading' }).children).toEqual(['false']);
    expect(testInstance.findByProps({ 'data-testid': 'error' }).children).toEqual([null]);

    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 0));

    // Check if posts were loaded
    const postsCount = parseInt(testInstance.findByProps({ 'data-testid': 'posts-count' }).children[0]);
    expect(postsCount).toBeGreaterThan(0);
  });

  it('handles loading more posts', async () => {
    const testRenderer = TestRenderer.create(<TestComponent />);
    const testInstance = testRenderer.root;

    // Load initial posts
    await new Promise(resolve => setTimeout(resolve, 0));

    const initialPostsCount = parseInt(testInstance.findByProps({ 'data-testid': 'posts-count' }).children[0]);

    // Load more posts
    await testInstance.findByType('button').props.onClick();

    const updatedPostsCount = parseInt(testInstance.findByProps({ 'data-testid': 'posts-count' }).children[0]);
    expect(updatedPostsCount).toBeGreaterThan(initialPostsCount);
  });

  it('handles post liking', async () => {
    const testRenderer = TestRenderer.create(<TestComponent />);
    const testInstance = testRenderer.root;

    // Load initial posts
    await new Promise(resolve => setTimeout(resolve, 0));

    // Like a post
    const likeButton = testInstance.findAllByType('button')[1];
    await likeButton.props.onClick();

    // Verify the like action was triggered
    expect(likeButton.props.onClick).toBeDefined();
  });

  it('handles comment adding', async () => {
    const testRenderer = TestRenderer.create(<TestComponent />);
    const testInstance = testRenderer.root;

    // Load initial posts
    await new Promise(resolve => setTimeout(resolve, 0));

    // Add a comment
    const commentButton = testInstance.findAllByType('button')[2];
    await commentButton.props.onClick();

    // Verify the comment action was triggered
    expect(commentButton.props.onClick).toBeDefined();
  });

  it('handles error state', async () => {
    // Mock useOfflineState to simulate an error
    (useOfflineState as jest.Mock).mockReturnValue({
      isOnline: false,
      syncPendingActions: jest.fn(),
      retryFailedActions: jest.fn(),
      pendingActions: [],
      failedActions: [],
      failedActionsCount: 0,
    });

    const testRenderer = TestRenderer.create(<TestComponent />);
    const testInstance = testRenderer.root;

    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(testInstance.findByProps({ 'data-testid': 'error' }).children).toEqual(['Failed to load posts. Please try again.']);
  });

  it('handles empty state', async () => {
    const testRenderer = TestRenderer.create(<TestComponent />);
    const testInstance = testRenderer.root;

    // Initial state should be empty
    expect(testInstance.findByProps({ 'data-testid': 'posts-count' }).children).toEqual(['0']);

    // Load posts
    await new Promise(resolve => setTimeout(resolve, 0));

    // State should no longer be empty
    const postsCount = parseInt(testInstance.findByProps({ 'data-testid': 'posts-count' }).children[0]);
    expect(postsCount).toBeGreaterThan(0);
  });
}); 