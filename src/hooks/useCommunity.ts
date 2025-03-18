import { useCallback, useEffect, useState } from 'react';
import { Comment, CommunityPost, communityService } from '../services/CommunityService';
import { useOfflineState } from './useOfflineState';

interface CommunityState {
  posts: CommunityPost[];
  comments: Record<string, Comment[]>;
  isLoading: boolean;
  error: string | null;
  hasMorePosts: boolean;
  lastPage: number;
}

export function useCommunity() {
  const { isOnline } = useOfflineState();
  const [state, setState] = useState<CommunityState>({
    posts: [],
    comments: {},
    isLoading: false,
    error: null,
    hasMorePosts: true,
    lastPage: 0,
  });

  const loadPosts = useCallback(async (page: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      let posts: CommunityPost[];
      
      if (isOnline) {
        posts = await communityService.getCommunityPosts(page);
      } else {
        // Use cached data or mock data if offline
        const cachedPosts = await communityService.getCommunityPosts(page)
          .catch(() => {
            // If can't get cached posts, return mock data
            return Array.from({ length: 10 }, (_, i) => ({
              id: `${page * 10 + i}`,
              userId: `user-${i}`,
              content: `Post content ${page * 10 + i}`,
              images: Math.random() > 0.5 ? [`https://picsum.photos/400/400?random=${page * 10 + i}`] : undefined,
              likes: Math.floor(Math.random() * 100),
              comments: Math.floor(Math.random() * 20),
              createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              user: {
                name: `User ${page * 10 + i}`,
                avatar: Math.random() > 0.5 ? `https://i.pravatar.cc/150?img=${page * 10 + i}` : undefined,
              },
            }));
          });
        
        posts = cachedPosts;
      }

      setState(prev => ({
        ...prev,
        posts: page === 1 ? posts : [...prev.posts, ...posts],
        hasMorePosts: posts.length === 10, // If we got a full page, assume there's more
        lastPage: Math.max(prev.lastPage, page),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading posts:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load posts. Please try again.',
        isLoading: false,
      }));
    }
  }, [isOnline]);

  const loadComments = useCallback(async (postId: string) => {
    // Don't reload comments if already loaded
    if (state.comments[postId]) {
      return;
    }
    
    try {
      let comments: Comment[];
      
      if (isOnline) {
        comments = await communityService.getComments(postId);
      } else {
        // Use cached data or mock data if offline
        const cachedComments = await communityService.getComments(postId)
          .catch(() => {
            // If can't get cached comments, return mock data
            return Array.from({ length: 5 }, (_, i) => ({
              id: `${postId}-comment-${i}`,
              postId,
              userId: `commenter-${i}`,
              content: `Comment ${i + 1} on post ${postId}`,
              createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
              user: {
                name: `Commenter ${i + 1}`,
                avatar: Math.random() > 0.5 ? `https://i.pravatar.cc/150?img=${i + 100}` : undefined,
              },
            }));
          });
        
        comments = cachedComments;
      }

      setState(prev => ({
        ...prev,
        comments: {
          ...prev.comments,
          [postId]: comments,
        },
      }));
    } catch (error) {
      console.error('Failed to load comments:', error);
      // Don't set global error for comment loading failures
    }
  }, [isOnline, state.comments]);

  const likePost = useCallback(async (postId: string) => {
    try {
      // Update UI immediately for better UX
      setState(prev => ({
        ...prev,
        posts: prev.posts.map(post =>
          post.id === postId
            ? { ...post, likes: post.likes + 1 }
            : post
        ),
      }));
      
      // Send API request if online
      if (isOnline) {
        await communityService.likePost(postId);
      } else {
        // Enqueued for sync when back online through the service
        await communityService.likePost(postId);
      }
    } catch (error) {
      console.error('Failed to like post:', error);
      // Revert the optimistic update if there was an error
      setState(prev => ({
        ...prev,
        posts: prev.posts.map(post =>
          post.id === postId
            ? { ...post, likes: post.likes - 1 }
            : post
        ),
      }));
    }
  }, [isOnline]);

  const addComment = useCallback(async (postId: string, content: string) => {
    try {
      let newComment: Comment;
      
      // Create optimistic comment for immediate UI update
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        postId,
        userId: 'current-user',
        content,
        createdAt: new Date().toISOString(),
        user: {
          name: 'You',
          avatar: undefined, // This would be replaced with the actual user avatar
        },
      };
      
      // Update UI immediately for better UX
      setState(prev => ({
        ...prev,
        comments: {
          ...prev.comments,
          [postId]: [...(prev.comments[postId] || []), optimisticComment],
        },
        posts: prev.posts.map(post =>
          post.id === postId
            ? { ...post, comments: post.comments + 1 }
            : post
        ),
      }));
      
      // Send API request if online
      if (isOnline) {
        newComment = await communityService.addComment(postId, content);
        
        // Replace the optimistic comment with the real one
        setState(prev => ({
          ...prev,
          comments: {
            ...prev.comments,
            [postId]: prev.comments[postId]?.map(c => 
              c.id === optimisticComment.id ? newComment : c
            ) || [],
          },
        }));
      } else {
        // Enqueued for sync when back online through the service
        await communityService.addComment(postId, content);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      // Revert the optimistic update if there was an error
      setState(prev => ({
        ...prev,
        comments: {
          ...prev.comments,
          [postId]: prev.comments[postId]?.filter(c => !c.id.startsWith('temp-')) || [],
        },
        posts: prev.posts.map(post =>
          post.id === postId
            ? { ...post, comments: Math.max(0, post.comments - 1) }
            : post
        ),
      }));
    }
  }, [isOnline]);

  // Load initial posts on mount
  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);
  
  // Reload posts when coming back online
  useEffect(() => {
    if (isOnline && state.lastPage > 0) {
      loadPosts(1);
    }
  }, [isOnline, loadPosts, state.lastPage]);

  return {
    ...state,
    loadPosts,
    loadComments,
    likePost,
    addComment,
  };
} 