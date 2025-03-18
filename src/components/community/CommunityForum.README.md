# CommunityForum

## Overview
The CommunityForum component provides a discussion platform where users can view, create, and engage with threads related to sustainability, recycling, and community initiatives. It enables community knowledge sharing, Q&A, and social interaction within the EcoCart application.

## Usage

```tsx
import { CommunityForum } from '@/components/community/CommunityForum';

// Basic usage
<CommunityForum />

// With customization and callbacks
<CommunityForum 
  categorized={true}
  showSearch={true}
  showNewThreadButton={true}
  onThreadSelect={(threadId) => {
    navigation.navigate('ThreadDetail', { threadId });
  }}
  onNewThreadPress={() => {
    navigation.navigate('NewThread');
  }}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onThreadSelect` | `(threadId: string) => void` | No | - | Callback when a thread is selected |
| `categorized` | `boolean` | No | `false` | Whether to show category filtering |
| `showSearch` | `boolean` | No | `true` | Whether to show the search bar |
| `showNewThreadButton` | `boolean` | No | `true` | Whether to show the new thread button |
| `onNewThreadPress` | `() => void` | No | - | Callback when the new thread button is pressed |
| `filterOptions` | `ForumFilterOptions` | No | - | Pre-applied filter options |
| `paginationOptions` | `ForumPaginationOptions` | No | - | Pagination configuration |
| `emptyStateComponent` | `ReactNode` | No | - | Custom component to show when no threads are found |
| `errorStateComponent` | `ReactNode` | No | - | Custom component to show on error |

## Features

- **Thread Listing**: Displays forum threads with title, author, tags, and preview
- **Thread Categories**: Filter threads by categories (derived from thread tags)
- **Search Functionality**: Search threads by title and content
- **New Thread Creation**: Create new discussion threads
- **Offline Support**: Shows appropriate UI when offline
- **Thread Interaction**: View threads and engage with discussions
- **Sticky Threads**: Important threads can be pinned to the top
- **Locked Threads**: Threads can be locked to prevent new replies

## Styling

The component uses the application's theme for consistent styling:

```tsx
// Example of custom styling
<CommunityForum 
  style={{ marginBottom: 20 }}
/>
```

## Best Practices

- **Do**: Implement moderation tools when deploying to production
- **Do**: Add analytics tracking for popular threads and engagement
- **Do**: Use the categorized prop for communities with diverse topics
- **Don't**: Disable search on forums with many threads
- **Accessibility**: Ensure all thread elements have appropriate accessibility labels

## Examples

### Basic Forum

```tsx
<CommunityForum />
```

### Category-filtered Forum

```tsx
<CommunityForum 
  categorized={true}
  filterOptions={{
    tags: ['Recycling']
  }}
/>
```

### Search-focused Forum

```tsx
<CommunityForum 
  showSearch={true}
  showNewThreadButton={false}
/>
```

### Forum with Navigation

```tsx
const handleThreadSelect = (threadId) => {
  navigation.navigate('ThreadDetail', { threadId });
};

const handleNewThread = () => {
  navigation.navigate('NewThread');
};

<CommunityForum 
  onThreadSelect={handleThreadSelect}
  onNewThreadPress={handleNewThread}
/>
```

## Internal Structure

The component is composed of several key parts:
- **ThreadItem**: Renders individual thread items
- **Search**: Text input with search functionality
- **Category Filtering**: Horizontal scrolling category pills
- **List Management**: Pagination, refresh control, and error handling

State management includes:
- Thread data loading and caching
- Search and filter state
- Loading and error states
- Refresh and pagination handling

## Dependent Components

- `ThreadDetail`: For viewing thread content and messages
- `NewThreadForm`: For creating new threads
- `ForumMessage`: For displaying individual messages
- `UserAvatar`: For displaying user avatars
- `ThreadMetrics`: For showing thread engagement metrics

## Related Documentation

- [Community Features](../../../docs/features/community/community-features.md)
- [Social Sharing Capabilities](../../../docs/features/community/social-sharing-capabilities.md)
- [User Profiles and Achievements](../../../docs/features/community/user-profiles-achievements.md) 