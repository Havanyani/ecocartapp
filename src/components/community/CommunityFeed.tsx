import { useTheme } from '@/theme';
import { Image } from 'expo-image';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useCommunity } from '../../hooks/useCommunity';
import { useOfflineState } from '../../hooks/useOfflineState';
import { Comment, CommunityPost } from '../../services/CommunityService';
import { Button } from '../ui/Button';
import { IconSymbol } from '../ui/IconSymbol';
import { MediaViewer } from '../ui/MediaViewer';
import { ThemedText } from '../ui/ThemedText';
import { ThemedView } from '../ui/ThemedView';

interface PostItemProps {
  post: CommunityPost;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onLoadComments: (postId: string) => void;
  comments: Comment[];
  isCommentsLoading?: boolean;
}

// Memoize the PostItem to prevent unnecessary re-renders
const PostItem = memo(({ post, onLike, onComment, onLoadComments, comments, isCommentsLoading }: PostItemProps) => {
  const theme = useTheme()()()()();
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMediaViewer, setShowMediaViewer] = useState(false);

  // Load comments when expanding the section
  useEffect(() => {
    if (isExpanded && (!comments || comments.length === 0) && !isCommentsLoading) {
      onLoadComments(post.id);
    }
  }, [isExpanded, comments, post.id, onLoadComments, isCommentsLoading]);

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText.trim());
      setCommentText('');
    }
  };

  return (
    <ThemedView style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          {post.user.avatar ? (
            <Image
              source={{ uri: post.user.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
              <ThemedText style={styles.avatarText}>
                {post.user.name[0].toUpperCase()}
              </ThemedText>
            </View>
          )}
          <View>
            <ThemedText style={styles.userName}>{post.user.name}</ThemedText>
            <ThemedText style={styles.timestamp}>
              {new Date(post.createdAt).toLocaleDateString()}
            </ThemedText>
          </View>
        </View>
      </View>

      <ThemedText style={styles.postContent}>{post.content}</ThemedText>

      {post.images && post.images.length > 0 && (
        <View style={styles.mediaContainer}>
          {post.images.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setShowMediaViewer(true)}
              accessibilityLabel={`Post image ${index + 1}`}
            >
              <Image
                source={{ uri: image }}
                style={styles.postImage}
                contentFit="cover"
                transition={300}
                placeholderContentFit="cover"
                placeholder={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' }}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLike(post.id)}
          accessibilityLabel={`Like post - ${post.likes} likes`}
        >
          <IconSymbol name="heart" size={24} color={theme.colors.primary} />
          <ThemedText style={styles.actionText}>{post.likes}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setIsExpanded(!isExpanded)}
          accessibilityLabel={`${isExpanded ? 'Hide' : 'Show'} comments - ${post.comments} comments`}
        >
          <IconSymbol name="comment" size={24} color={theme.colors.primary} />
          <ThemedText style={styles.actionText}>{post.comments}</ThemedText>
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <View style={styles.commentsSection}>
          {isCommentsLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={styles.commentsLoader} />
          ) : comments.length > 0 ? (
            comments.map(comment => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <ThemedText style={styles.commentUserName}>
                    {comment.user.name}
                  </ThemedText>
                  <ThemedText style={styles.commentTimestamp}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </ThemedText>
                </View>
                <ThemedText style={styles.commentContent}>
                  {comment.content}
                </ThemedText>
              </View>
            ))
          ) : (
            <ThemedText style={styles.noCommentsText}>
              No comments yet. Be the first to comment!
            </ThemedText>
          )}
          <View style={styles.commentInput}>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Add a comment..."
              placeholderTextColor={theme.colors.textSecondary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: commentText.trim() ? theme.colors.primary : theme.colors.disabled }
              ]}
              onPress={handleSubmitComment}
              disabled={!commentText.trim()}
            >
              <ThemedText style={styles.submitText}>Post</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showMediaViewer && (
        <MediaViewer
          images={post.images || []}
          onClose={() => setShowMediaViewer(false)}
        />
      )}
    </ThemedView>
  );
});

export function CommunityFeed() {
  const theme = useTheme()()()()();
  const { isOnline } = useOfflineState();
  
  const {
    posts,
    comments,
    isLoading,
    error,
    hasMorePosts,
    loadPosts,
    loadComments,
    likePost,
    addComment,
  } = useCommunity();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'recent' | 'popular'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedPostIds, setExpandedPostIds] = useState<Set<string>>(new Set());

  // Process and filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ? true :
      filter === 'recent' ? new Date(post.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) :
      post.likes > 10;
    return matchesSearch && matchesFilter;
  });

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMorePosts) {
      loadPosts(Math.floor(posts.length / 10) + 1);
    }
  }, [isLoading, hasMorePosts, loadPosts, posts.length]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadPosts(1);
    setIsRefreshing(false);
  }, [loadPosts]);

  const handleLoadComments = useCallback((postId: string) => {
    loadComments(postId);
    // Add to expanded set
    setExpandedPostIds(prev => new Set(prev).add(postId));
  }, [loadComments]);

  // Render error view
  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol name="alert-circle" size={48} color={theme.colors.error} />
        <ThemedText style={styles.errorText}>
          Error loading community feed.
        </ThemedText>
        <Button 
          title="Try Again" 
          onPress={() => loadPosts(1)} 
          style={styles.retryButton}
        />
        <ThemedText style={styles.offlineText}>
          {!isOnline ? "You're currently offline. Connect to see the latest posts." : ""}
        </ThemedText>
      </ThemedView>
    );
  }

  // Render empty state
  if (!isLoading && posts.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <IconSymbol name="message-circle" size={48} color={theme.colors.primary} />
        <ThemedText style={styles.emptyText}>
          No posts yet. Be the first to share something!
        </ThemedText>
        {!isOnline && (
          <ThemedText style={styles.offlineText}>
            You're currently offline. Connect to see posts.
          </ThemedText>
        )}
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <IconSymbol name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search posts..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
            onPress={() => setFilter('all')}
            accessibilityLabel="Filter: All posts"
          >
            <ThemedText style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
              All
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'recent' && styles.activeFilter]}
            onPress={() => setFilter('recent')}
            accessibilityLabel="Filter: Recent posts"
          >
            <ThemedText style={[styles.filterText, filter === 'recent' && styles.activeFilterText]}>
              Recent
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'popular' && styles.activeFilter]}
            onPress={() => setFilter('popular')}
            accessibilityLabel="Filter: Popular posts"
          >
            <ThemedText style={[styles.filterText, filter === 'popular' && styles.activeFilterText]}>
              Popular
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {!isOnline && (
        <View style={styles.offlineBanner}>
          <IconSymbol name="wifi-off" size={16} color="#fff" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Some features may be limited.
          </ThemedText>
        </View>
      )}

      <FlatList
        data={filteredPosts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            onLike={likePost}
            onComment={addComment}
            onLoadComments={handleLoadComments}
            comments={comments[item.id] || []}
            isCommentsLoading={expandedPostIds.has(item.id) && !comments[item.id]}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading && !isRefreshing ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={styles.footerLoader}
            />
          ) : null
        }
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </ThemedView>
  );
}

// Only render when necessary
CommunityFeed.whyDidYouRender = true;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 14,
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 16,
  },
  postContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontWeight: '600',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    marginBottom: 8,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
  },
  commentsSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  commentItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUserName: {
    fontWeight: '500',
    fontSize: 14,
  },
  commentTimestamp: {
    fontSize: 12,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentInput: {
    flexDirection: 'row',
    marginTop: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  submitButton: {
    marginLeft: 8,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
  offlineText: {
    marginTop: 8,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#757575',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  footerLoader: {
    marginVertical: 16,
  },
  commentsLoader: {
    marginVertical: 16,
  },
  noCommentsText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginVertical: 16,
    textAlign: 'center',
  },
  offlineBanner: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  offlineBannerText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
}); 