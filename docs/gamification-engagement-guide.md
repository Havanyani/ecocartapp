# EcoCart Gamification & Engagement Guide

## Overview

This guide documents the gamification and engagement strategies implemented in the EcoCart application. Gamification elements are designed to incentivize user participation, encourage consistent recycling behavior, and create a sense of community around sustainability efforts. This document outlines the architecture, components, and best practices for the gamification system.

## Table of Contents

1. [Achievement System](#achievement-system)
2. [User Leveling Mechanism](#user-leveling-mechanism)
3. [Rewards Implementation](#rewards-implementation)
4. [Community Challenges & Leaderboards](#community-challenges--leaderboards)
5. [Environmental Impact Visualization](#environmental-impact-visualization)
6. [Notification & Reminder Strategy](#notification--reminder-strategy)
7. [Best Practices](#best-practices)

## Achievement System

### Architecture

The achievement system tracks user activities and awards badges and points for completing specific milestones:

```
┌─────────────────┐      ┌────────────────┐       ┌─────────────────┐
│                 │      │                │       │                 │
│  User Actions   ├─────►│  Achievement   ├──────►│  Achievement    │
│                 │      │  Tracker       │       │  Unlocking      │
│                 │      │                │       │                 │
└─────────────────┘      └────────────────┘       └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐      ┌────────────────┐       ┌─────────────────┐
│                 │      │                │       │                 │
│  Achievement    │◄─────┤  User Profile  │◄──────┤  Notification   │
│  Display        │      │  Updates       │       │  System         │
│                 │      │                │       │                 │
└─────────────────┘      └────────────────┘       └─────────────────┘
```

### Key Components

- **AchievementService** (`src/services/AchievementService.ts`): Manages achievement tracking and unlocking
- **AchievementCard** (`src/components/achievements/AchievementCard.tsx`): Displays individual achievements
- **AchievementGrid** (`src/components/achievements/AchievementGrid.tsx`): Displays collections of achievements
- **AchievementProgress** (`src/components/achievements/AchievementProgress.tsx`): Shows progress towards achievements

### Achievement Categories

Achievements are organized into categories:

1. **Collection Milestones**: Based on number and weight of collections
   - First Collection
   - 5/10/25/50/100 Collections
   - 10kg/50kg/100kg/500kg Collected

2. **Consistency**: Based on regular participation
   - Weekly Warrior (4 consecutive weeks)
   - Monthly Master (3 consecutive months)
   - Quarterly Champion (4 consecutive quarters)

3. **Material Diversity**: Based on recycling different materials
   - Plastic Pioneer (recycle 5 different plastic types)
   - Mixed Materials (recycle 3 different material categories)
   - Complete Collector (recycle all available material types)

4. **Community Contribution**: Based on social aspects
   - Referral Rewards (invite friends)
   - Community Challenge Participant
   - Top Contributor (weekly/monthly)

### Implementation

The achievement system tracks events and awards achievements when criteria are met:

```typescript
// Example achievement definition
interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  points: number;
  icon: string;
  criteria: AchievementCriteria;
  progress?: {
    current: number;
    target: number;
  };
  unlockedAt?: Date;
}

// Example achievement tracker function
import { useAchievements } from '../hooks/useAchievements';

function MaterialCollectionForm() {
  const { trackEvent } = useAchievements();
  
  const handleSubmit = async (collectionData) => {
    // Submit collection data
    const result = await submitCollection(collectionData);
    
    // Track achievement event
    if (result.success) {
      trackEvent('collection_completed', {
        materialType: collectionData.materialType,
        weight: collectionData.weight,
        isFirstCollection: collectionData.isFirstTime,
      });
    }
    
    // Rest of the function...
  };
  
  // Component implementation...
}
```

## User Leveling Mechanism

### Architecture

The user leveling system provides progression based on recycling activity and engagement:

```
┌─────────────────┐      ┌────────────────┐       ┌─────────────────┐
│                 │      │                │       │                 │
│  Experience     ├─────►│  Level         ├──────►│  Benefits       │
│  Points         │      │  Calculation   │       │  Unlocking      │
│                 │      │                │       │                 │
└─────────────────┘      └────────────────┘       └─────────────────┘
                                 │
                                 ▼
┌─────────────────┐      ┌────────────────┐
│                 │      │                │
│  Level Display  │◄─────┤  User Profile  │
│  & Badge        │      │  Updates       │
│                 │      │                │
└─────────────────┘      └────────────────┘
```

### Level Tiers

Users progress through defined tiers, each with increasing benefits:

1. **Bronze** (0-100 XP)
   - Basic credit earning rate (1x)
   - Standard collection features

2. **Silver** (101-500 XP)
   - 10% bonus credit earning (1.1x)
   - Priority scheduling

3. **Gold** (501-1500 XP)
   - 25% bonus credit earning (1.25x)
   - Priority scheduling
   - Exclusive material types

4. **Platinum** (1501+ XP)
   - 50% bonus credit earning (1.5x)
   - Premium scheduling options
   - Exclusive challenges and rewards
   - Early access to new features

### Experience Point System

XP is earned through various activities:

- Collection completion: 10 XP + (weight in kg × 5 XP)
- Achievement unlocking: Achievement point value
- Community challenge participation: 25 XP
- Referrals: 50 XP per successful referral
- Consistent activity: 5 XP per day of app usage (capped at 25 XP per week)

### Implementation

```typescript
// Example level calculation
function calculateLevel(experiencePoints: number): UserLevel {
  if (experiencePoints >= 1501) return 'platinum';
  if (experiencePoints >= 501) return 'gold';
  if (experiencePoints >= 101) return 'silver';
  return 'bronze';
}

// Example level display component
import { useUser } from '../hooks/useUser';

function UserLevelDisplay() {
  const { user } = useUser();
  const level = calculateLevel(user.experiencePoints);
  const nextLevel = getNextLevel(level);
  const pointsToNextLevel = getPointsToNextLevel(user.experiencePoints, level);
  
  return (
    <View style={styles.container}>
      <LevelBadge level={level} />
      
      <Text style={styles.levelName}>{formatLevelName(level)}</Text>
      
      {nextLevel && (
        <>
          <ProgressBar 
            progress={getProgressPercentage(user.experiencePoints, level)} 
            color={getLevelColor(level)}
          />
          
          <Text style={styles.nextLevelText}>
            {pointsToNextLevel} XP to {formatLevelName(nextLevel)}
          </Text>
        </>
      )}
    </View>
  );
}
```

## Rewards Implementation

### Architecture

The rewards system converts recycling activity into redeemable credits and special offers:

```
┌─────────────────┐      ┌────────────────┐      ┌────────────────┐
│                 │      │                │      │                │
│  Collection     ├─────►│  Credit        ├─────►│  Reward        │
│  Completion     │      │  Calculation   │      │  Catalog       │
│                 │      │                │      │                │
└─────────────────┘      └────────────────┘      └────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐      ┌────────────────┐      ┌────────────────┐
│                 │      │                │      │                │
│  Redemption     │◄─────┤  User Credit   │◄─────┤  Selection     │
│  Processing     │      │  Balance       │      │  Process       │
│                 │      │                │      │                │
└─────────────────┘      └────────────────┘      └────────────────┘
```

### Credit System

Credits are the primary reward currency:

- **Earning**: 5 credits per kg of recycled material (adjusted by level multiplier)
- **Storing**: Credits are stored on user profile
- **Expiration**: Credits expire after 6 months (with notification warnings)
- **Viewing**: Credits can be viewed on profile and dedicated rewards screen

### Reward Types

The app offers multiple reward types:

1. **Discounts**: Percentage or fixed-amount discounts on grocery purchases
2. **Free Products**: Redeem for specific sustainable products
3. **Donation Options**: Convert credits to donations for environmental causes
4. **Premium Features**: Unlock exclusive app features
5. **Partner Offers**: Special deals with sustainable brand partners

### Implementation

```typescript
// Example rewards service
class RewardsService {
  // Calculate credits for a collection
  calculateCredits(weight: number, materialType: string, userLevel: UserLevel): number {
    const baseCredits = weight * 5;
    const materialMultiplier = this.getMaterialMultiplier(materialType);
    const levelMultiplier = this.getLevelMultiplier(userLevel);
    
    return Math.round(baseCredits * materialMultiplier * levelMultiplier);
  }
  
  // Get available rewards
  async getAvailableRewards(userCredits: number): Promise<Reward[]> {
    const allRewards = await this.fetchRewards();
    return allRewards.filter(reward => reward.creditCost <= userCredits);
  }
  
  // Redeem a reward
  async redeemReward(userId: string, rewardId: string): Promise<RedemptionResult> {
    // Implementation details...
  }
  
  // Helper methods
  private getMaterialMultiplier(materialType: string): number {
    // Different materials may have different credit values
    const multipliers = {
      'PET': 1.2,
      'HDPE': 1.1,
      'PVC': 0.9,
      'LDPE': 1.0,
      'PP': 1.1,
      'PS': 0.8,
      'OTHER': 1.0
    };
    
    return multipliers[materialType] || 1.0;
  }
  
  private getLevelMultiplier(userLevel: UserLevel): number {
    const multipliers = {
      'bronze': 1.0,
      'silver': 1.1,
      'gold': 1.25,
      'platinum': 1.5
    };
    
    return multipliers[userLevel] || 1.0;
  }
}
```

## Community Challenges & Leaderboards

### Architecture

Community features create social engagement around recycling:

```
┌─────────────────┐      ┌────────────────┐       ┌─────────────────┐
│                 │      │                │       │                 │
│  Challenge      ├─────►│  Progress      ├──────►│  Goal           │
│  Definition     │      │  Tracking      │       │  Achievement    │
│                 │      │                │       │                 │
└─────────────────┘      └────────────────┘       └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐      ┌────────────────┐       ┌─────────────────┐
│                 │      │                │       │                 │
│  Participant    │      │  Leaderboard   │       │  Reward         │
│  Registration   │      │  Ranking       │       │  Distribution   │
│                 │      │                │       │                 │
└─────────────────┘      └────────────────┘       └─────────────────┘
```

### Challenge Types

Various challenges keep the community engaged:

1. **Time-Limited Challenges**
   - Weekly challenges (e.g., "Collect 5kg this week")
   - Monthly themes (e.g., "Focus on HDPE plastics")
   - Seasonal events (e.g., "Spring Cleaning Challenge")

2. **Milestone Challenges**
   - Community-wide goals (e.g., "100,000kg total collection")
   - Regional targets (e.g., "5,000kg in the Northern Region")
   - Special material focus (e.g., "10,000 plastic bottles")

3. **Competitive Challenges**
   - Individual competition (personal leaderboards)
   - Team-based challenges (form groups to compete)
   - Regional competitions (geographic-based teams)

### Leaderboard System

Leaderboards showcase top contributors:

- **Weekly/Monthly Resets**: Fresh competition periods
- **Categories**: Different leaderboards for weight, consistency, etc.
- **Rewards**: Special recognition and rewards for top performers
- **Personalized View**: Show nearby ranks to motivate improvement

### Implementation

```typescript
// Example challenge component
import { useChallenges } from '../hooks/useChallenges';

function ActiveChallengesList() {
  const { activeChallenges, joinChallenge, isLoading } = useChallenges();
  
  if (isLoading) {
    return <ChallengesListSkeleton />;
  }
  
  if (!activeChallenges.length) {
    return (
      <EmptyState
        title="No Active Challenges"
        message="Check back soon for new community challenges!"
        illustration={<NoActiveChallengesIllustration />}
      />
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Challenges</Text>
      
      <FlatList
        data={activeChallenges}
        renderItem={({ item }) => (
          <ChallengeCard
            challenge={item}
            onJoin={() => joinChallenge(item.id)}
            isJoined={item.isParticipating}
          />
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

// Example leaderboard component
function ChallengeLeaderboard({ challengeId }) {
  const { leaderboard, userRank, isLoading } = useLeaderboard(challengeId);
  
  // Component implementation...
}
```

## Environmental Impact Visualization

### Architecture

Visual representations of impact help users understand the significance of their actions:

```
┌─────────────────┐      ┌────────────────┐       ┌─────────────────┐
│                 │      │                │       │                 │
│  Collection     ├─────►│  Impact        ├──────►│  Visualization  │
│  Data           │      │  Calculation   │       │  Rendering      │
│                 │      │                │       │                 │
└─────────────────┘      └────────────────┘       └─────────────────┘
                                │
                                │
                                ▼
┌─────────────────┐      ┌────────────────┐
│                 │      │                │
│  Shareable      │◄─────┤  Comparative   │
│  Content        │      │  Metrics       │
│                 │      │                │
└─────────────────┘      └────────────────┘
```

### Impact Metrics

Several metrics help quantify environmental impact:

1. **Primary Metrics**
   - Weight of plastic diverted from landfills/oceans
   - CO₂ emissions avoided
   - Water conservation impact
   - Energy saved through recycling

2. **Equivalent Metrics**
   - Trees planted equivalent
   - Cars off the road equivalent
   - Plastic bottles saved
   - Homes powered (energy equivalent)

### Visualization Types

Multiple visualization formats make impact tangible:

1. **Progress Charts**
   - Personal progress over time
   - Community-wide impact
   - Goal completion visualization

2. **Comparison Visualizations**
   - "Your impact is equivalent to..."
   - Before/after environmental scenarios
   - Personal contribution vs. community average

3. **Interactive Elements**
   - "Impact calculator" for recycling activities
   - Virtual forest (trees added based on impact)
   - Digital "ocean cleanup" visualization

### Implementation

```typescript
// Example impact calculator
class ImpactCalculator {
  // Calculate CO2 emissions saved
  calculateCO2Saved(weightInKg: number, materialType: string): number {
    // Different materials have different CO2 impact
    const co2FactorPerKg = {
      'PET': 2.5,
      'HDPE': 1.8,
      'PVC': 2.0,
      'LDPE': 1.7,
      'PP': 1.9,
      'PS': 2.1,
      'OTHER': 1.5
    };
    
    return weightInKg * (co2FactorPerKg[materialType] || 1.5);
  }
  
  // Calculate equivalent trees
  calculateTreeEquivalent(co2SavedInKg: number): number {
    // Average tree absorbs ~25kg CO2 per year
    return co2SavedInKg / 25;
  }
  
  // Generate impact summary
  generateImpactSummary(collections: Collection[]): ImpactSummary {
    let totalWeight = 0;
    let totalCO2Saved = 0;
    
    collections.forEach(collection => {
      totalWeight += collection.weight;
      totalCO2Saved += this.calculateCO2Saved(collection.weight, collection.materialType);
    });
    
    const treeEquivalent = this.calculateTreeEquivalent(totalCO2Saved);
    const bottleEquivalent = this.calculateBottleEquivalent(totalWeight);
    const carEquivalent = this.calculateCarEquivalent(totalCO2Saved);
    
    return {
      totalWeight,
      totalCO2Saved,
      treeEquivalent,
      bottleEquivalent,
      carEquivalent
    };
  }
  
  // Other calculation methods...
}

// Example impact visualization component
function ImpactDashboard() {
  const { user } = useUser();
  const { collections } = useCollections(user.id);
  const impactCalculator = new ImpactCalculator();
  
  const impact = useMemo(() => {
    return impactCalculator.generateImpactSummary(collections);
  }, [collections]);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Environmental Impact</Text>
      
      <View style={styles.metricsContainer}>
        <ImpactMetricCard
          title="CO₂ Saved"
          value={`${impact.totalCO2Saved.toFixed(1)} kg`}
          icon="cloud"
        />
        
        <ImpactMetricCard
          title="Tree Equivalent"
          value={`${impact.treeEquivalent.toFixed(1)} trees`}
          icon="tree"
        />
        
        <ImpactMetricCard
          title="Bottles Saved"
          value={`${impact.bottleEquivalent} bottles`}
          icon="bottle"
        />
      </View>
      
      <ImpactChart data={generateChartData(collections)} />
      
      <ShareButton 
        title="Share Your Impact" 
        onPress={() => shareImpact(impact)} 
      />
    </View>
  );
}
```

## Notification & Reminder Strategy

### Engagement Notifications

Strategic notifications keep users engaged with the gamification system:

1. **Achievement Notifications**
   - New achievements unlocked
   - Progress updates on nearly-completed achievements
   - Reminders of available but inactive achievements

2. **Level-Up Notifications**
   - Level advancement celebrations
   - Benefits of the new level
   - Progress towards next level

3. **Challenge Notifications**
   - New challenges available
   - Challenge progress updates
   - Challenge completion and rewards
   - Leaderboard position changes

4. **Reward Notifications**
   - New rewards available
   - Credit balance updates
   - Credit expiration warnings
   - Special limited-time offers

### Implementation

```typescript
// Example notification service for gamification
class GamificationNotificationService {
  // Schedule notifications based on user state
  scheduleNotifications(user: User): void {
    this.scheduleAchievementNotifications(user);
    this.scheduleLevelNotifications(user);
    this.scheduleChallengeNotifications(user);
    this.scheduleRewardNotifications(user);
  }
  
  // Achievement notifications
  private scheduleAchievementNotifications(user: User): void {
    // Find nearly complete achievements
    const nearlyComplete = this.findNearlyCompleteAchievements(user);
    
    // Schedule reminders
    nearlyComplete.forEach(achievement => {
      this.scheduleNotification({
        title: 'Achievement Almost Unlocked!',
        body: `You're close to unlocking "${achievement.title}". Complete the required actions to claim it!`,
        data: { type: 'achievement', id: achievement.id },
        trigger: { seconds: 86400 } // 1 day
      });
    });
  }
  
  // Other notification scheduling methods...
  
  // Helper to find achievements that are nearly complete
  private findNearlyCompleteAchievements(user: User): Achievement[] {
    // Implementation details...
  }
}
```

## Best Practices

### Engagement Balance

- **Avoid Overwhelming**: Don't bombard users with too many achievements/challenges
- **Progressive Disclosure**: Introduce advanced features as users become more engaged
- **Meaningful Rewards**: Ensure rewards have real value to users
- **Intrinsic Motivation**: Balance extrinsic rewards with intrinsic environmental motivation

### Gamification Ethics

- **Transparency**: Be clear about how gamification elements work
- **Opt-Out Options**: Allow users to disable certain gamification features
- **Privacy Consideration**: Be thoughtful about leaderboards and social sharing
- **Inclusive Design**: Ensure gamification is accessible to all users

### Performance Considerations

- **Efficient Tracking**: Minimize performance impact of achievement tracking
- **Lazy Loading**: Load gamification elements only when needed
- **Caching Strategy**: Cache achievement and level data to reduce API calls
- **Offline Support**: Allow achievements to be unlocked offline

### Data-Driven Optimization

- **Track Engagement**: Monitor which gamification elements drive the most engagement
- **A/B Testing**: Test different achievement criteria and rewards
- **Adjustment**: Be willing to adjust difficulty levels based on user data
- **Regular Updates**: Keep content fresh with new challenges and achievements

## References

- [Gamification Design Framework](https://yukaichou.com/gamification-examples/octalysis-complete-gamification-framework/)
- [Sustainable Gamification Principles](https://uxplanet.org/gamification-for-sustainable-development-3257c989d65)
- [React Native Animations](https://reactnative.dev/docs/animations)
- [Behavioral Design Patterns](https://www.interaction-design.org/literature/topics/behavioral-design) 