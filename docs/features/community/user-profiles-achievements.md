# User Profiles and Achievements

## Overview
The User Profiles and Achievements feature provides a personalized identity system within the EcoCart application, allowing users to track their environmental impact, showcase their sustainability accomplishments, and receive recognition for their recycling efforts. This gamification element encourages continued engagement and promotes healthy competition within the community.

## User-Facing Functionality
- **Customizable User Profiles**: User-editable profiles with photos, bios, and environmental impact statistics
- **Achievement System**: Collection of badges and awards for reaching recycling milestones
- **Progress Tracking**: Visual indicators of progress toward upcoming achievements
- **Leaderboards**: Rankings based on recycling metrics and community contributions
- **Impact Visualization**: Graphical representation of cumulative environmental impact
- **User Journey**: Timeline view of a user's recycling history and milestone achievements
- **Public/Private Settings**: Controls for what profile information is visible to the community

## Technical Implementation

### Architecture
- **Design Pattern(s)**: Observer Pattern for achievement updates, Strategy Pattern for achievement requirements
- **Key Components**: 
  - `UserProfileService`: Manages user profile data and preferences
  - `AchievementManager`: Tracks progress and awards achievements
  - `ProfileComponent`: Main UI component for displaying user profiles
  - `AchievementComponent`: UI for displaying achievements and progress
- **Dependencies**: 
  - Expo SecureStore for profile data
  - Firebase Auth for user identity
  - React Native reanimated for animations
  - Local SQLite database for achievement tracking

### Code Structure
```typescript
// User profile data model
interface UserProfile {
  userId: string;
  displayName: string;
  bio?: string;
  photoUrl?: string;
  joinDate: Date;
  privacySettings: {
    showImpactStats: boolean;
    showAchievements: boolean;
    showInLeaderboards: boolean;
    allowSharing: boolean;
  };
  stats: {
    totalCollections: number;
    totalWeight: number; // in kg
    totalPoints: number;
    streak: number; // consecutive weeks active
  };
}

// Achievement model
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'collection' | 'impact' | 'social' | 'consistency' | 'education';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirement: AchievementRequirement;
  progress?: number; // 0-100
  unlockedAt?: Date;
  visibleBeforeUnlock: boolean;
}

// Achievement requirement strategies
type AchievementRequirement =
  | { type: 'collection_count'; threshold: number }
  | { type: 'weight_collected'; threshold: number; unit: 'kg' }
  | { type: 'consecutive_days'; threshold: number }
  | { type: 'material_specific'; material: string; threshold: number }
  | { type: 'special_event'; eventId: string }
  | { type: 'community_contribution'; action: string; threshold: number };

// Example of the achievement manager implementation
class AchievementManager {
  private static instance: AchievementManager;
  private achievements: Achievement[] = [];
  private userProgress: Map<string, Map<string, number>> = new Map();
  
  private constructor() {
    // Load available achievements
    this.loadAchievements();
  }
  
  static getInstance(): AchievementManager {
    if (!AchievementManager.instance) {
      AchievementManager.instance = new AchievementManager();
    }
    return AchievementManager.instance;
  }
  
  async loadUserProgress(userId: string): Promise<void> {
    try {
      // Load user's achievement progress from database
      const progress = await DatabaseService.getUserAchievementProgress(userId);
      this.userProgress.set(userId, new Map(Object.entries(progress)));
    } catch (error) {
      console.error('Failed to load user achievement progress:', error);
      this.userProgress.set(userId, new Map());
    }
  }
  
  async checkForNewAchievements(userId: string, action: string, value: number): Promise<Achievement[]> {
    const newlyUnlocked: Achievement[] = [];
    
    // Ensure user progress is loaded
    if (!this.userProgress.has(userId)) {
      await this.loadUserProgress(userId);
    }
    
    const userProgress = this.userProgress.get(userId)!;
    
    // Update progress for relevant achievements
    for (const achievement of this.achievements) {
      if (this.isAchievementRelevantToAction(achievement, action)) {
        // Check if already unlocked
        if (achievement.unlockedAt) continue;
        
        // Update progress
        const currentProgress = userProgress.get(achievement.id) || 0;
        const newProgress = this.calculateNewProgress(
          achievement, 
          action, 
          value, 
          currentProgress
        );
        
        userProgress.set(achievement.id, newProgress);
        
        // Check if achievement is now unlocked
        if (this.isAchievementUnlocked(achievement, newProgress)) {
          achievement.unlockedAt = new Date();
          achievement.progress = 100;
          newlyUnlocked.push(achievement);
          
          // Persist unlocked status
          await DatabaseService.setAchievementUnlocked(userId, achievement.id);
          
          // Add points to user profile
          await UserProfileService.addPoints(userId, achievement.points);
        } else {
          achievement.progress = Math.min(100, (newProgress / this.getThreshold(achievement)) * 100);
          
          // Persist updated progress
          await DatabaseService.updateAchievementProgress(userId, achievement.id, newProgress);
        }
      }
    }
    
    return newlyUnlocked;
  }
  
  getAchievements(userId: string, filter?: { 
    category?: string, 
    unlockedOnly?: boolean,
    lockedOnly?: boolean
  }): Achievement[] {
    // Apply filters and return achievements for the user
    return this.achievements.filter(achievement => {
      // Filter by unlock status
      if (filter?.unlockedOnly && !achievement.unlockedAt) return false;
      if (filter?.lockedOnly && achievement.unlockedAt) return false;
      
      // Filter by category
      if (filter?.category && achievement.category !== filter.category) return false;
      
      // Hide locked achievements that shouldn't be visible
      if (!achievement.unlockedAt && !achievement.visibleBeforeUnlock) return false;
      
      return true;
    });
  }
  
  // Helper methods omitted for brevity
  private isAchievementRelevantToAction(achievement: Achievement, action: string): boolean { /* ... */ }
  private calculateNewProgress(achievement: Achievement, action: string, value: number, currentProgress: number): number { /* ... */ }
  private isAchievementUnlocked(achievement: Achievement, progress: number): boolean { /* ... */ }
  private getThreshold(achievement: Achievement): number { /* ... */ }
  private loadAchievements(): void { /* ... */ }
}

// Usage example
async function handleRecyclingCollectionComplete(userId: string, collectionData: CollectionData): Promise<void> {
  const achievementManager = AchievementManager.getInstance();
  
  // Check for new achievements based on this collection
  const newAchievements = await achievementManager.checkForNewAchievements(
    userId,
    'collection_complete',
    collectionData.weight
  );
  
  // If new achievements were unlocked, notify the user
  if (newAchievements.length > 0) {
    notificationService.showAchievementNotifications(newAchievements);
  }
  
  // Update user profile stats
  await UserProfileService.updateStats(userId, {
    totalCollections: increment(1),
    totalWeight: increment(collectionData.weight)
  });
}
```

### Key Files
- `src/services/UserProfileService.ts`: Service for managing user profile data
- `src/services/AchievementService.ts`: Service for managing achievements
- `src/components/profile/ProfileScreen.tsx`: Main profile screen component
- `src/components/achievements/AchievementList.tsx`: Component for displaying achievements
- `src/components/profile/ProfileStats.tsx`: Component for displaying profile statistics

## Integration Points
- **Related Features**: 
  - Environmental impact sharing
  - Community challenges
  - Leaderboards
- **API Endpoints**: 
  - `GET /api/users/{id}/profile`: Retrieves user profile data
  - `GET /api/users/{id}/achievements`: Retrieves user achievements
  - `PUT /api/users/{id}/profile`: Updates user profile data
- **State Management**: 
  - Redux slice for user profile and achievements
  - Local caching of frequently accessed profile data

## Performance Considerations
- **Optimization Techniques**: 
  - Lazy loading of achievement icons and assets
  - Background processing of achievement checks
  - Caching of profile data and achievements
- **Potential Bottlenecks**: 
  - Achievement checking during high activity periods
  - Image loading for many achievements
  - Leaderboard calculations with many users
- **Battery/Resource Impact**: 
  - Minimal impact as most operations are read-only
  - Batch processing of achievement updates

## Testing Strategy
- **Unit Tests**: 
  - Achievement requirement calculations
  - Profile data validation
  - Privacy settings enforcement
- **Integration Tests**: 
  - Achievement unlocking flow
  - Profile update synchronization
  - Leaderboard ranking accuracy
- **Mock Data**: 
  - Sample user profiles with varying levels of achievement
  - Simulated recycling histories
  - Edge cases for achievement requirements

## Accessibility
- **Keyboard Navigation**: 
  - Tab focus for all profile actions
  - List navigation for achievements
  - Keyboard shortcuts for common profile actions
- **Screen Reader Compatibility**: 
  - ARIA labels for achievement icons and stats
  - Descriptive text for achievement requirements
  - Announcements for newly unlocked achievements
- **Color Contrast**: 
  - High-contrast achievement rarity indicators
  - Text/background contrast meeting WCAG standards
  - Alternative indicators beyond color for achievement status

## Future Improvements
- Implement dynamic achievement generation based on user behavior
- Add social connections and friend recommendations
- Create team/group achievements for community efforts
- Develop seasonal and limited-time achievements
- Implement achievement sharing via AR experiences

## Related Documentation
- [Environmental Impact Sharing](./environmental-impact-sharing.md)
- [Social Sharing Capabilities](./social-sharing-capabilities.md)
- [Community Challenges](./community-challenges.md) 