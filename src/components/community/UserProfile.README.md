# UserProfile

## Overview
The UserProfile component displays a user's profile information, achievements, and environmental impact statistics. It serves as the personal identity hub within the EcoCart application, allowing users to view their progress, accomplishments, and contribution to sustainability efforts.

## Usage

```tsx
import { UserProfile } from '@/components/community/UserProfile';

// Basic usage with current user
<UserProfile />

// With specified user and options
<UserProfile 
  userId="user-123"
  showImpactStats={true}
  showAchievements={true}
  isEditable={false}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `userId` | `string` | No | Current user | ID of the user whose profile to display |
| `showImpactStats` | `boolean` | No | `true` | Whether to show environmental impact statistics |
| `showAchievements` | `boolean` | No | `true` | Whether to show user achievements |
| `showActivityHistory` | `boolean` | No | `false` | Whether to show recent activity history |
| `isEditable` | `boolean` | No | `false` | Whether to allow profile editing (only for current user) |
| `onAchievementSelect` | `(achievementId: string) => void` | No | `undefined` | Callback when an achievement is selected |
| `onShareProfile` | `() => void` | No | `undefined` | Callback when the share profile button is pressed |

## Features
- **Customizable Profile**: Display user photo, name, bio, and join date
- **Achievement Showcase**: Visual display of earned achievements with details
- **Environmental Impact**: Statistics on recycling volume, CO2 savings, etc.
- **Progress Indicators**: Visual representation of progress toward goals
- **Privacy Controls**: Configurable display of profile information
- **Editing Capabilities**: Optional UI for editing profile information
- **Activity Timeline**: Optional display of recent recycling activities

## Styling
The component supports theming and custom styling:

```tsx
// Example of styling options
<UserProfile 
  style={{ marginHorizontal: 16 }}
  headerStyle={{ backgroundColor: 'primaryColor' }}
  accentColor="secondaryColor"
/>
```

## Best Practices
- **Do**: Use the `onAchievementSelect` callback to show achievement details
- **Do**: Ensure proper error handling for profile data loading
- **Don't**: Enable `isEditable` for users other than the current user
- **Accessibility**: Ensure all images have proper alt text for screen readers
- **Accessibility**: Maintain proper heading hierarchy for screen readers

## Examples

### Basic Profile
```tsx
<UserProfile />
```

### View Another User's Profile
```tsx
<UserProfile 
  userId="user-456"
  showImpactStats={true}
  showAchievements={true}
  showActivityHistory={true}
  isEditable={false}
/>
```

### Editable Profile with Callbacks
```tsx
const handleAchievementSelect = (achievementId) => {
  navigation.navigate('AchievementDetails', { achievementId });
};

const handleShareProfile = () => {
  SocialSharingService.shareProfile(currentUser.id);
};

<UserProfile 
  isEditable={true}
  onAchievementSelect={handleAchievementSelect}
  onShareProfile={handleShareProfile}
/>
```

## Internal Structure
The component is structured into several sections:
- **ProfileHeader**: User photo, name, and bio
- **ImpactStatistics**: Environmental impact metrics
- **AchievementGallery**: Visual display of earned achievements
- **ActivityTimeline**: Recent recycling activities
- **EditProfileModal**: Modal for editing profile information

Key state variables:
- Loading states for different data types
- Visible modal state
- Expanded section states

## Dependent Components
- `AchievementItem`: Displays individual achievements
- `ImpactMetricCard`: Displays environmental impact statistics
- `ProgressRing`: Visual progress indicator
- `ActivityItem`: Displays individual activity events
- `UserAvatar`: Displays user profile image
- `EditProfileForm`: Form for editing profile information

## Related Documentation
- [User Profiles and Achievements](../../../docs/features/community/user-profiles-achievements.md)
- [Environmental Impact Sharing](../../../docs/features/community/environmental-impact-sharing.md)
- [Social Sharing Capabilities](../../../docs/features/community/social-sharing-capabilities.md) 