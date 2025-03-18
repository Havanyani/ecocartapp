# CommunityFeed

## Overview
The CommunityFeed component displays user-generated content, environmental impacts, and achievements shared by the community. It serves as the primary social interaction hub within the EcoCart application, allowing users to view, like, comment on, and share posts from other community members.

## Usage

```tsx
import { CommunityFeed } from '@/components/community/CommunityFeed';

// Basic usage
<CommunityFeed />

// With filtering and callbacks
<CommunityFeed 
  category="achievements"
  onPostInteraction={(postId, interactionType) => {
    console.log(`User ${interactionType} post ${postId}`);
  }}
  refreshInterval={30000}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `category` | `string` | No | `'all'` | Filter posts by category ('achievements', 'impact', 'challenges', 'all') |
| `limit` | `number` | No | `20` | Maximum number of posts to display initially |
| `onPostInteraction` | `(postId: string, type: 'like' \| 'comment' \| 'share') => void` | No | `undefined` | Callback when user interacts with a post |
| `refreshInterval` | `number` | No | `60000` | Interval in ms to refresh feed (0 disables auto-refresh) |
| `showPostActions` | `boolean` | No | `true` | Whether to show like, comment, and share buttons |
| `highlightedPostId` | `string` | No | `undefined` | ID of a post to highlight (e.g., when deep-linked) |

## Features
- **Real-time Updates**: Automatically refreshes to show the latest content
- **Content Filtering**: Filter posts by category or content type
- **Interactive Elements**: Support for likes, comments, and shares
- **Media Support**: Displays images, progress charts, and achievement badges
- **Infinite Scrolling**: Loads additional content as the user scrolls
- **Time-based Formatting**: Shows relative timestamps (e.g., "2 hours ago")
- **Deep Linking Support**: Can highlight specific posts when accessed via links

## Styling
The component supports theming and custom styling through prop injection:

```tsx
// Example of styling options
<CommunityFeed 
  style={{ marginHorizontal: 16 }}
  itemStyle={{ borderRadius: 8 }}
  contentColor="primaryBackground"
/>
```

## Best Practices
- **Do**: Initialize with a reasonable `limit` value (10-20) for performance
- **Do**: Implement proper error handling for the `onPostInteraction` callback
- **Don't**: Set `refreshInterval` too low (<30s) to avoid excessive API calls
- **Accessibility**: Ensure all images have proper alt text for screen readers

## Examples

### Basic Feed
```tsx
<CommunityFeed />
```

### Filtered Feed with Custom Styling
```tsx
<CommunityFeed 
  category="challenges"
  limit={15}
  style={{ 
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16
  }} 
/>
```

### Interactive Feed with Custom Handler
```tsx
const handlePostInteraction = (postId, type) => {
  // Track analytics
  Analytics.trackEvent(`post_${type}`, { postId });
  
  // Update local state if needed
  if (type === 'like') {
    updateLikeCount(postId);
  }
};

<CommunityFeed 
  onPostInteraction={handlePostInteraction}
  refreshInterval={45000}
/>
```

## Internal Structure
The component uses a FlatList to render feed items efficiently. It maintains internal state for:
- Currently loaded posts
- Loading states (initial, refreshing, loading more)
- Interaction states (liked posts, expanded comments)

Key internal components include:
- `PostItem`: Renders individual posts with interaction controls
- `PostSkeleton`: Placeholder during loading states
- `CommentSection`: Expandable comment display and input
- `InteractionBar`: Like, comment, and share buttons

## Dependent Components
- `PostItem`: Renders individual posts in the feed
- `UserAvatar`: Displays user profile images
- `TimeAgo`: Formats post timestamps
- `ProgressChart`: For displaying impact metrics
- `AchievementBadge`: For displaying achievements
- `ActionSheet`: For share options

## Related Documentation
- [Social Sharing Capabilities](../../../docs/features/community/social-sharing-capabilities.md)
- [Environmental Impact Sharing](../../../docs/features/community/environmental-impact-sharing.md)
- [User Profiles and Achievements](../../../docs/features/community/user-profiles-achievements.md) 