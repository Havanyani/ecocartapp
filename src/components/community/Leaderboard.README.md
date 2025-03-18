# Leaderboard

## Overview
The Leaderboard component displays user rankings based on recycling metrics and community contributions. It promotes healthy competition among users, highlights top performers, and encourages sustained engagement with the EcoCart application's sustainability initiatives.

## Usage

```tsx
import { Leaderboard } from '@/components/community/Leaderboard';

// Basic usage
<Leaderboard />

// With custom options
<Leaderboard 
  category="total_collections"
  timeFrame="month"
  limit={10}
  highlightUserId={currentUser.id}
  onUserSelect={(userId) => handleUserSelect(userId)}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `category` | `string` | No | `'total_impact'` | Ranking category ('total_impact', 'total_collections', 'streak', etc.) |
| `timeFrame` | `'week' \| 'month' \| 'year' \| 'all'` | No | `'month'` | Time period for the leaderboard data |
| `limit` | `number` | No | `20` | Maximum number of users to display |
| `highlightUserId` | `string` | No | Current user ID | ID of the user to highlight in the rankings |
| `onUserSelect` | `(userId: string) => void` | No | `undefined` | Callback when a user is selected |
| `showMetrics` | `boolean` | No | `true` | Whether to display metric values beside rankings |
| `refreshInterval` | `number` | No | `300000` | Interval in ms to refresh leaderboard (0 disables auto-refresh) |

## Features
- **Multiple Ranking Categories**: Different metrics for various sustainability achievements
- **Time Period Filtering**: View rankings across different time frames
- **Current User Highlighting**: Easily locate the current user in the rankings
- **Detailed Metrics Display**: Shows specific values that determine rankings
- **Position Change Indicators**: Displays movement in rankings over time
- **Social Integration**: Quick access to user profiles from the leaderboard
- **Automatic Updates**: Periodically refreshes to show the latest rankings

## Styling
The component supports theming and custom styling:

```tsx
// Example of styling options
<Leaderboard 
  style={{ marginHorizontal: 16 }}
  itemStyle={{ borderRadius: 8 }}
  highlightColor="accentColor"
  medalColors={{
    first: '#FFD700',
    second: '#C0C0C0',
    third: '#CD7F32'
  }}
/>
```

## Best Practices
- **Do**: Choose an appropriate `limit` value for your UI layout
- **Do**: Set a reasonable `refreshInterval` to keep data current without excessive API calls
- **Don't**: Use extremely short time frames that may not have meaningful data
- **Accessibility**: Ensure ranking information is available to screen readers
- **Accessibility**: Don't rely solely on color to indicate ranking positions

## Examples

### Basic Leaderboard
```tsx
<Leaderboard />
```

### Custom Category and Time Frame
```tsx
<Leaderboard 
  category="streak"
  timeFrame="year"
  limit={10}
/>
```

### Interactive Leaderboard with User Selection
```tsx
const handleUserSelect = (userId) => {
  navigation.navigate('UserProfile', { userId });
};

<Leaderboard 
  category="total_collections"
  timeFrame="month"
  highlightUserId={currentUser.id}
  onUserSelect={handleUserSelect}
  showMetrics={true}
/>
```

## Internal Structure
The component is organized into several parts:
- **CategorySelector**: Controls for selecting the ranking category
- **TimeFrameSelector**: Controls for selecting the time period
- **RankingList**: The main scrollable list of ranked users
- **UserRankItem**: Individual user ranking display
- **MetricDisplay**: Shows the relevant metric value and unit

Key state variables:
- Selected category and time frame
- Loading states
- Cached leaderboard data
- User selection state

## Dependent Components
- `UserRankItem`: Displays individual user ranking information
- `UserAvatar`: Shows user profile images
- `RankBadge`: Visual indicator of top rankings (1st, 2nd, 3rd)
- `MetricValue`: Displays formatted metric values with appropriate units
- `PositionChange`: Shows ranking movement indicators (up/down/unchanged)
- `CategoryTabs`: Tab interface for selecting different ranking categories
- `TimeFramePicker`: Controls for selecting different time periods

## Related Documentation
- [Community Challenges](../../../docs/features/community/community-challenges.md)
- [User Profiles and Achievements](../../../docs/features/community/user-profiles-achievements.md)
- [Social Sharing Capabilities](../../../docs/features/community/social-sharing-capabilities.md) 