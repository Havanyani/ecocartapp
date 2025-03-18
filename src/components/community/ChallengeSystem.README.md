# ChallengeSystem

## Overview
The ChallengeSystem component manages the display and interaction with community challenges in the EcoCart application. It allows users to browse active challenges, track their progress, participate in community sustainability goals, and earn achievements upon completion.

## Usage

```tsx
import { ChallengeSystem } from '@/components/community/ChallengeSystem';

// Basic usage
<ChallengeSystem />

// With full options
<ChallengeSystem 
  activeChallenges={challenges}
  achievements={userAchievements}
  onChallengeSelect={(challengeId) => handleChallengeSelect(challengeId)}
  onAchievementSelect={(achievementId) => handleAchievementSelect(achievementId)}
  filterType="active"
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `activeChallenges` | `Challenge[]` | No | `[]` | Array of challenge objects to display |
| `achievements` | `Achievement[]` | No | `[]` | Array of user achievements to display |
| `onChallengeSelect` | `(challengeId: string) => void` | No | `undefined` | Callback when a challenge is selected |
| `onAchievementSelect` | `(achievementId: string) => void` | No | `undefined` | Callback when an achievement is selected |
| `filterType` | `'active' \| 'upcoming' \| 'completed' \| 'all'` | No | `'active'` | Filter for which challenges to display |
| `showAchievements` | `boolean` | No | `true` | Whether to show achievements section |
| `refreshInterval` | `number` | No | `60000` | Interval in ms to refresh challenges (0 disables auto-refresh) |

## Features
- **Challenge Discovery**: Browse and filter available challenges
- **Progress Tracking**: Visual indicators of progress toward challenge goals
- **Achievement Display**: Showcases earned achievements with their details
- **Participation Controls**: Join or leave community challenges
- **Real-time Updates**: Periodically refreshes challenge data
- **Reward Visualization**: Shows potential rewards for completing challenges
- **Challenge Details**: Expandable view for challenge information

## Styling
The component supports theming and custom styling:

```tsx
// Example of styling options
<ChallengeSystem 
  style={{ marginHorizontal: 16 }}
  challengeCardStyle={{ borderRadius: 8 }}
  achievementStyle={{ backgroundColor: 'cardBackground' }}
/>
```

## Best Practices
- **Do**: Provide both active challenges and achievements for a complete experience
- **Do**: Implement proper error handling for the callbacks
- **Don't**: Set `refreshInterval` too low to avoid excessive API calls
- **Accessibility**: Ensure progress indicators convey information beyond color
- **Accessibility**: Add appropriate role attributes for interactive elements

## Examples

### Basic Challenge Display
```tsx
<ChallengeSystem />
```

### Filtered Challenges with Callbacks
```tsx
<ChallengeSystem 
  filterType="upcoming"
  onChallengeSelect={(challengeId) => {
    navigation.navigate('ChallengeDetails', { challengeId });
  }}
/>
```

### Complete Integration with Custom Styling
```tsx
const handleChallengeSelect = (challengeId) => {
  navigation.navigate('ChallengeDetails', { challengeId });
};

const handleAchievementSelect = (achievementId) => {
  navigation.navigate('AchievementDetails', { achievementId });
};

<ChallengeSystem 
  activeChallenges={userChallenges}
  achievements={userAchievements}
  onChallengeSelect={handleChallengeSelect}
  onAchievementSelect={handleAchievementSelect}
  filterType="active"
  style={{ 
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16
  }}
/>
```

## Internal Structure
The component is organized into several sections:
- **ChallengesList**: Scrollable list of available challenges
- **ChallengeCard**: Individual challenge display with progress
- **AchievementsList**: Scrollable list of user achievements
- **AchievementItem**: Individual achievement display with details
- **FilterControls**: UI for filtering challenges

Key state variables:
- Selected filter type
- Loading states
- Expanded challenge details

## Dependent Components
- `ChallengeCard`: Displays individual challenge information
- `ProgressBar`: Visual indicator of challenge progress
- `AchievementItem`: Displays individual achievements
- `FilterTabs`: UI for selecting different filter options
- `EmptyState`: Displayed when no challenges or achievements are available
- `RewardBadge`: Displays challenge rewards

## Related Documentation
- [Community Challenges](../../../docs/features/community/community-challenges.md)
- [User Profiles and Achievements](../../../docs/features/community/user-profiles-achievements.md)
- [Environmental Impact Sharing](../../../docs/features/community/environmental-impact-sharing.md) 