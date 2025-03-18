# Rewards Components

This directory contains components for managing the rewards and incentives system in the EcoCart application.

## Components

### RewardsManager

Central component for managing user rewards and points.

```tsx
import { RewardsManager } from './RewardsManager';

<RewardsManager
  userId={currentUserId}
  showProgress={true}
  onRewardEarned={handleReward}
/>
```

#### Features
- Points tracking
- Reward distribution
- Achievement unlocks
- Progress visualization
- History tracking

### RewardCard

Displays individual rewards and their details.

```tsx
import { RewardCard } from './RewardCard';

<RewardCard
  reward={rewardData}
  isUnlocked={true}
  onRedeem={handleRedeem}
/>
```

#### Features
- Reward details
- Unlock conditions
- Redemption flow
- Progress tracking
- Visual feedback

### PointsHistory

Displays user's points history and transactions.

```tsx
import { PointsHistory } from './PointsHistory';

<PointsHistory
  userId={currentUserId}
  filter="all"
  showDetails={true}
/>
```

#### Features
- Transaction history
- Points breakdown
- Filter options
- Export capability
- Detailed analytics

## Data Types

### Reward
```typescript
interface Reward {
  id: string;
  title: string;
  description: string;
  type: 'discount' | 'badge' | 'feature' | 'special';
  requirements: {
    points: number;
    achievements?: string[];
    level?: number;
  };
  value: {
    points?: number;
    discount?: number;
    feature?: string;
  };
  expiresAt?: Date;
  restrictions?: string[];
  image?: string;
}
```

### PointsTransaction
```typescript
interface PointsTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend' | 'expire' | 'bonus';
  amount: number;
  description: string;
  category: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

### UserRewards
```typescript
interface UserRewards {
  userId: string;
  totalPoints: number;
  availablePoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  rewards: {
    active: Reward[];
    redeemed: Reward[];
    expired: Reward[];
  };
  history: PointsTransaction[];
}
```

## Best Practices

1. **Reward Design**
   - Clear value proposition
   - Achievable goals
   - Fair distribution
   - Regular updates
   - Seasonal events

2. **Points System**
   - Transparent rules
   - Balanced economy
   - Anti-fraud measures
   - Regular audits
   - Clear documentation

3. **User Experience**
   - Clear progress tracking
   - Easy redemption
   - Instant feedback
   - Engaging animations
   - Clear notifications

4. **Performance**
   - Efficient calculations
   - Transaction batching
   - Cache management
   - Background processing
   - Error recovery

## Contributing

When adding new reward components:

1. Follow reward guidelines
2. Consider economy balance
3. Add proper validation
4. Include animations
5. Document features
6. Add test coverage

## Testing

1. **Unit Tests**
   - Test calculations
   - Verify conditions
   - Test transactions
   - Validate rules

2. **Integration Tests**
   - Test reward flow
   - Verify points system
   - Test redemption
   - Validate history

3. **Performance Tests**
   - Test calculations
   - Verify batching
   - Test concurrency
   - Measure impact

## Security

1. **Points Security**
   - Transaction validation
   - Anti-cheat measures
   - Audit logging
   - Rate limiting
   - Error detection

2. **Redemption Security**
   - Verification steps
   - Fraud prevention
   - Usage tracking
   - Access control
   - Error handling 