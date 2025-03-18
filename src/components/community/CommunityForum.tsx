import { useOfflineState } from '@/hooks/useOfflineState';
import { useTheme } from '@/hooks/useTheme';
import { CommunityForumProps as ForumProps, ForumThread } from '@/types/forum';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Thread Item interface for props passing
interface ForumThreadProps {
  thread: ForumThread;
  onPress: (threadId: string) => void;
}

// Thread Item Component
const ThreadItem: React.FC<ForumThreadProps> = ({ thread, onPress }) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[styles.threadItem, { backgroundColor: theme.colors.background }]} 
      onPress={() => onPress(thread.id)}
      accessible
      accessibilityLabel={`Forum thread: ${thread.title}`}
      accessibilityHint="Tap to view this discussion thread"
    >
      <View style={styles.threadHeader}>
        <View style={styles.threadTitleContainer}>
          {thread.isSticky && (
            <Ionicons name="pin" size={16} color={theme.colors.primary} style={styles.threadIcon} />
          )}
          {thread.isLocked && (
            <Ionicons name="lock-closed" size={16} color={theme.colors.primary} style={styles.threadIcon} />
          )}
          <Text style={[styles.threadTitle, { color: theme.colors.text }]} numberOfLines={2}>
            {thread.title}
          </Text>
        </View>
        <Text style={[styles.threadDate, { color: theme.colors.text }]}>
          {format(thread.lastUpdatedAt, 'MMM d, yyyy')}
        </Text>
      </View>
      
      <View style={styles.threadMeta}>
        <Text style={[styles.threadAuthor, { color: theme.colors.text }]}>
          {thread.authorName}
        </Text>
        <View style={styles.threadStats}>
          <Ionicons name="chatbubble-outline" size={14} color={theme.colors.text} />
          <Text style={[styles.threadMessages, { color: theme.colors.text }]}>
            {thread.messageCount}
          </Text>
        </View>
      </View>
      
      {thread.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {thread.tags.map((tag, index) => (
            <View key={index} style={[styles.tagBadge, { backgroundColor: `${theme.colors.primary}20` }]}>
              <Text style={[styles.tagText, { color: theme.colors.primary }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}
      
      <Text style={[styles.threadPreview, { color: theme.colors.text }]} numberOfLines={2}>
        {thread.lastMessagePreview}
      </Text>
    </TouchableOpacity>
  );
};

// Main Component
export function CommunityForum({
  onThreadSelect,
  categorized = false,
  showSearch = true,
  showNewThreadButton = true,
  onNewThreadPress
}: ForumProps) {
  const { theme } = useTheme();
  const { isOnline } = useOfflineState();
  
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [filteredThreads, setFilteredThreads] = useState<ForumThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Placeholder for loading forum data
  const loadForumThreads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This would be an API call in production
      // const response = await api.getForumThreads();
      // setThreads(response.data);
      
      // Placeholder data
      setTimeout(() => {
        const placeholderThreads: ForumThread[] = [
          {
            id: '1',
            title: 'How to properly recycle plastic containers?',
            authorId: 'user1',
            authorName: 'EcoEnthusiast',
            createdAt: new Date(2023, 5, 15),
            lastUpdatedAt: new Date(2023, 5, 20),
            messageCount: 24,
            isSticky: true,
            isLocked: false,
            tags: ['Recycling', 'Plastics', 'Guide'],
            lastMessagePreview: 'Remember to always rinse containers before recycling. This helps prevent contamination of other recyclables.'
          },
          {
            id: '2',
            title: 'Weekly challenge: Zero waste grocery shopping',
            authorId: 'user2',
            authorName: 'ZeroWasteHero',
            createdAt: new Date(2023, 6, 1),
            lastUpdatedAt: new Date(2023, 6, 3),
            messageCount: 15,
            isSticky: false,
            isLocked: false,
            tags: ['Challenge', 'Shopping', 'Zero Waste'],
            lastMessagePreview: 'I managed to do all my grocery shopping with zero packaging waste this week! Here are my tips...'
          },
          {
            id: '3',
            title: 'App suggestion: Add barcode scanner for recyclability check',
            authorId: 'user3',
            authorName: 'TechGreen',
            createdAt: new Date(2023, 4, 10),
            lastUpdatedAt: new Date(2023, 6, 2),
            messageCount: 32,
            isSticky: false,
            isLocked: false,
            tags: ['Feature Request', 'App Improvement'],
            lastMessagePreview: 'It would be great if we could scan product barcodes to check if they are recyclable in our local area.'
          },
          {
            id: '4',
            title: 'Composting basics for beginners',
            authorId: 'user4',
            authorName: 'GardenGuru',
            createdAt: new Date(2023, 3, 25),
            lastUpdatedAt: new Date(2023, 6, 1),
            messageCount: 47,
            isSticky: true,
            isLocked: false,
            tags: ['Composting', 'Guide', 'Beginners'],
            lastMessagePreview: 'Start with a simple compost bin in your garden. You can use both green materials (vegetable scraps) and brown materials (paper, cardboard).'
          },
          {
            id: '5',
            title: 'Community cleanup event - June 15th',
            authorId: 'user5',
            authorName: 'CommunityChampion',
            createdAt: new Date(2023, 5, 1),
            lastUpdatedAt: new Date(2023, 6, 5),
            messageCount: 28,
            isSticky: false,
            isLocked: true,
            tags: ['Event', 'Cleanup', 'Community'],
            lastMessagePreview: 'Location details and what to bring have been finalized. Please check the first post for all information.'
          },
        ];
        
        setThreads(placeholderThreads);
        setFilteredThreads(placeholderThreads);
        
        // Extract categories from tags
        const allTags = placeholderThreads.flatMap(thread => thread.tags);
        const uniqueCategories = Array.from(new Set(allTags));
        setCategories(uniqueCategories);
        
        setIsLoading(false);
        setIsRefreshing(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load forum threads. Please try again later.');
      console.error('Error loading forum threads:', err);
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);
  
  // Initial load
  useEffect(() => {
    loadForumThreads();
  }, [loadForumThreads]);
  
  // Filter threads based on search and category
  useEffect(() => {
    let filtered = threads;
    
    if (searchQuery) {
      filtered = filtered.filter(thread => 
        thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.lastMessagePreview.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(thread => 
        thread.tags.includes(selectedCategory)
      );
    }
    
    setFilteredThreads(filtered);
  }, [threads, searchQuery, selectedCategory]);
  
  // Handle thread selection
  const handleThreadPress = (threadId: string) => {
    if (onThreadSelect) {
      onThreadSelect(threadId);
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadForumThreads();
  };
  
  // Handle new thread
  const handleNewThread = () => {
    if (onNewThreadPress) {
      onNewThreadPress();
    }
  };
  
  // Render category pill
  const renderCategoryPill = (category: string) => {
    const isSelected = category === selectedCategory;
    
    return (
      <TouchableOpacity
        key={category}
        style={[
          styles.categoryPill,
          { backgroundColor: isSelected ? theme.colors.primary : theme.colors.background },
          { borderColor: theme.colors.primary }
        ]}
        onPress={() => setSelectedCategory(isSelected ? null : category)}
      >
        <Text
          style={[
            styles.categoryText,
            { color: isSelected ? '#FFFFFF' : theme.colors.primary }
          ]}
        >
          {category}
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {showNewThreadButton && (
          <TouchableOpacity
            style={[styles.newThreadButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleNewThread}
            disabled={!isOnline}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={[styles.newThreadText, { color: "#FFFFFF" }]}>
              New Thread
            </Text>
          </TouchableOpacity>
        )}
        
        {showSearch && (
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="search" size={20} color={theme.colors.text} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search threads..."
              placeholderTextColor={theme.colors.text}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            ) : null}
          </View>
        )}
        
        {categorized && categories.length > 0 && (
          <View style={styles.categoriesContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContent}
            >
              {categories.map(renderCategoryPill)}
            </ScrollView>
          </View>
        )}
        
        {!isOnline && (
          <View style={[styles.offlineNotice, { backgroundColor: `${theme.colors.primary}20` }]}>
            <Ionicons name="cloud-offline" size={16} color={theme.colors.primary} />
            <Text style={[styles.offlineText, { color: theme.colors.primary }]}>
              You're offline. Some content may be unavailable.
            </Text>
          </View>
        )}
        
        {isLoading && !isRefreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Loading forum threads...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#FF3B30" />
            <Text style={[styles.errorText, { color: theme.colors.text }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              onPress={loadForumThreads}
            >
              <Text style={[styles.retryText, { color: "#FFFFFF" }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredThreads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={theme.colors.text} />
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              {searchQuery
                ? `No threads found for "${searchQuery}"`
                : selectedCategory
                ? `No threads found in ${selectedCategory}`
                : 'No forum threads available yet'}
            </Text>
            {(searchQuery || selectedCategory) && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
              >
                <Text style={[styles.clearFiltersText, { color: theme.colors.primary }]}>
                  Clear filters
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredThreads}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ThreadItem thread={item} onPress={handleThreadPress} />
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
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  threadItem: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  threadTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  threadIcon: {
    marginRight: 4,
  },
  threadTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  threadDate: {
    fontSize: 12,
    marginLeft: 8,
  },
  threadMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  threadAuthor: {
    fontSize: 14,
  },
  threadStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  threadMessages: {
    fontSize: 14,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  threadPreview: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  clearFiltersButton: {
    paddingVertical: 8,
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  newThreadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newThreadText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
  },
  offlineText: {
    fontSize: 14,
    marginLeft: 8,
  },
  categoriesContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 