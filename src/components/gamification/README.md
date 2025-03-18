# Gamification Components

This directory contains components for implementing game-like features and rewards in the EcoCart application to encourage user engagement and environmental awareness.

## Components

### GamificationProfile

Manages user's gamification progress and achievements.

```tsx
import { GamificationProfile } from './GamificationProfile';

<GamificationProfile
  userId={currentUserId}
  showProgress={true}
  enableAnimations={true}
/>
```

#### Features
- Level progression
- Achievement tracking
- Points system
- Rewards management
- Progress visualization

### AchievementCard

Displays individual achievements and progress.

```tsx
import { AchievementCard } from './AchievementCard';

<AchievementCard
  achievement={achievementData}
  showProgress={true}
  onUnlock={handleUnlock}
/>
```

#### Features
- Visual progress tracking
- Unlock animations
- Reward display
- Share functionality
- Interactive elements

### ImpactAchievements

Visualizes environmental impact achievements.

```tsx
import { ImpactAchievements } from './ImpactAchievements';

<ImpactAchievements
  userId={currentUserId}
  category="recycling"
  showMilestones={true}
/>
```

#### Features
- Impact visualization
- Milestone tracking
- Category filtering
- Comparative stats
- Historical data

### ImpactVisualization

Creates engaging visualizations of environmental impact.

```tsx
import { ImpactVisualization } from './ImpactVisualization';

<ImpactVisualization
  data={impactData}
  animationType="growth"
  interactive={true}
/>
```

#### Features
- Interactive animations
- Real-time updates
- Comparative metrics
- Custom themes
- Accessibility support

## Data Types

### Achievement
```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'recycling' | 'conservation' | 'community' | 'special';
  requirements: {
    type: string;
    target: number;
    current: number;
  };
  rewards: {
    points: number;
    badges?: string[];
    perks?: string[];
  };
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
```

### GamificationProgress
```typescript
interface GamificationProgress {
  userId: string;
  level: number;
  experience: number;
  nextLevelThreshold: number;
  totalPoints: number;
  achievements: {
    completed: Achievement[];
    inProgress: Achievement[];
  };
  stats: {
    dailyStreak: number;
    bestStreak: number;
    totalActions: number;
    categoryProgress: Record<string, number>;
  };
}
```

### ImpactMetrics
```typescript
interface ImpactMetrics {
  carbonOffset: number;
  treesPlanted: number;
  wasteRecycled: number;
  waterSaved: number;
  energyConserved: number;
  communityContribution: number;
}
```

## Best Practices

1. **User Engagement**
   - Design meaningful achievements
   - Balance difficulty levels
   - Provide instant feedback
   - Create engaging animations
   - Implement social features

2. **Performance**
   - Optimize animations
   - Cache achievement data
   - Lazy load assets
   - Minimize re-renders
   - Handle state efficiently

3. **Accessibility**
   - Support screen readers
   - Provide alternative text
   - Enable keyboard navigation
   - Maintain color contrast
   - Support reduced motion

4. **User Experience**
   - Clear progress indicators
   - Intuitive interactions
   - Meaningful rewards
   - Progressive difficulty
   - Regular feedback

## Contributing

When adding new gamification components:

1. Follow gamification principles
2. Consider user motivation
3. Balance difficulty levels
4. Include proper animations
5. Add comprehensive tests
6. Document features clearly

## Testing

1. **Unit Tests**
   - Test achievement logic
   - Verify point calculations
   - Test unlock conditions
   - Validate animations

2. **Integration Tests**
   - Test progress tracking
   - Verify reward system
   - Test social features
   - Validate persistence

3. **User Testing**
   - Test engagement levels
   - Verify motivation impact
   - Test achievement flow
   - Validate reward satisfaction

## Animation Guidelines

1. **Achievement Unlocks**
   - Use smooth transitions
   - Include particle effects
   - Add sound effects
   - Support haptic feedback
   - Enable skip option

2. **Progress Updates**
   - Animate progress bars
   - Show level-up effects
   - Implement counting animations
   - Add celebration effects
   - Support reduced motion

3. **Impact Visualization**
   - Use engaging transitions
   - Implement interactive elements
   - Add dynamic effects
   - Support gesture controls
   - Enable exploration

## Reward System

1. **Points**
   - Clear earning rules
   - Balanced distribution
   - Multiple categories
   - Special bonuses
   - Streak rewards

2. **Badges**
   - Unique designs
   - Clear requirements
   - Rarity levels
   - Collection system
   - Display options

3. **Perks**
   - Meaningful benefits
   - Unlock progression
   - Special features
   - Community status
   - Exclusive content 