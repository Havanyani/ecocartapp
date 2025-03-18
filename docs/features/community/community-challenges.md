# Community Challenges

## Overview
The Community Challenges feature enables users to participate in collective recycling goals and sustainability initiatives. These time-bound challenges foster a sense of community, encourage consistent recycling habits, and amplify individual environmental impact through collaborative efforts. Participants can track progress, receive rewards, and share their contributions to community goals.

## User-Facing Functionality
- **Challenge Discovery**: Browsable list of active, upcoming, and completed challenges
- **Challenge Details**: Comprehensive information about goals, timeframes, and rewards
- **Progress Tracking**: Real-time visualization of individual and community progress
- **Participation Controls**: Simple opt-in/opt-out mechanism for challenges
- **Reward System**: Achievement badges, points, and status rewards for participation
- **Social Elements**: Ability to invite friends and view participants
- **Results Summary**: Post-challenge statistics and impact visualization
- **Notifications**: Timely alerts about challenge status and milestones

## Technical Implementation

### Architecture
- **Design Pattern(s)**: Observer Pattern for progress updates, Factory Pattern for challenge creation
- **Key Components**: 
  - `ChallengeService`: Manages challenge data and participation
  - `ChallengeProgressTracker`: Monitors and updates progress metrics
  - `ChallengeDiscoveryComponent`: UI for browsing available challenges
  - `ChallengeDetailsComponent`: UI for displaying challenge information
- **Dependencies**: 
  - Firebase Firestore for real-time challenge data
  - Firebase Cloud Functions for challenge processing
  - React Native reanimated for progress animations
  - Expo Notifications for challenge alerts

### Code Structure
```typescript
// Challenge model
interface Challenge {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: 'individual' | 'team' | 'community';
  status: 'upcoming' | 'active' | 'completed';
  startDate: Date;
  endDate: Date;
  goals: ChallengeGoal[];
  rewards: ChallengeReward[];
  rules: string[];
  participants: {
    count: number;
    canViewList: boolean;
  };
  createdBy: string; // Admin or organization ID
}

// Challenge goal model
interface ChallengeGoal {
  id: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  progressPercentage: number;
  isCompleted: boolean;
}

// Challenge reward model
interface ChallengeReward {
  id: string;
  type: 'badge' | 'points' | 'tier' | 'physical';
  title: string;
  description: string;
  imageUrl?: string;
  value?: number; // For points
  threshold?: number; // Required progress percentage
  isUnlocked: boolean;
}

// User participation model
interface ChallengeParticipation {
  userId: string;
  challengeId: string;
  joinDate: Date;
  status: 'active' | 'completed' | 'withdrawn';
  contribution: {
    [goalId: string]: number;
  };
  earnedRewards: string[]; // Reward IDs
}

// Example of the challenge service implementation
class ChallengeService {
  private static instance: ChallengeService;
  private firestore: FirebaseFirestore.Firestore;
  
  private constructor() {
    this.firestore = firebase.firestore();
  }
  
  static getInstance(): ChallengeService {
    if (!ChallengeService.instance) {
      ChallengeService.instance = new ChallengeService();
    }
    return ChallengeService.instance;
  }
  
  async getChallenges(filter?: {
    status?: 'upcoming' | 'active' | 'completed',
    type?: 'individual' | 'team' | 'community',
    participatedBy?: string
  }): Promise<Challenge[]> {
    let query: FirebaseFirestore.Query = this.firestore.collection('challenges');
    
    // Apply filters
    if (filter?.status) {
      query = query.where('status', '==', filter.status);
    }
    
    if (filter?.type) {
      query = query.where('type', '==', filter.type);
    }
    
    // Get challenges
    const snapshot = await query.get();
    const challenges = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Challenge));
    
    // Filter by participation if needed
    if (filter?.participatedBy) {
      const participations = await this.getUserParticipations(filter.participatedBy);
      const participatedChallengeIds = participations.map(p => p.challengeId);
      return challenges.filter(challenge => participatedChallengeIds.includes(challenge.id));
    }
    
    return challenges;
  }
  
  async joinChallenge(userId: string, challengeId: string): Promise<boolean> {
    try {
      // Check if challenge exists and is active
      const challengeDoc = await this.firestore.collection('challenges').doc(challengeId).get();
      if (!challengeDoc.exists || challengeDoc.data()?.status !== 'active') {
        throw new Error('Challenge is not available for joining');
      }
      
      // Check if user is already participating
      const existingParticipation = await this.firestore
        .collection('challenge_participations')
        .where('userId', '==', userId)
        .where('challengeId', '==', challengeId)
        .get();
      
      if (!existingParticipation.empty) {
        throw new Error('User is already participating in this challenge');
      }
      
      // Create participation record
      const challenge = challengeDoc.data() as Challenge;
      const participation: ChallengeParticipation = {
        userId,
        challengeId,
        joinDate: new Date(),
        status: 'active',
        contribution: {},
        earnedRewards: []
      };
      
      // Initialize contribution for each goal
      challenge.goals.forEach(goal => {
        participation.contribution[goal.id] = 0;
      });
      
      // Add participation to database
      await this.firestore.collection('challenge_participations').add(participation);
      
      // Update challenge participant count
      await this.firestore.collection('challenges').doc(challengeId).update({
        'participants.count': firebase.firestore.FieldValue.increment(1)
      });
      
      return true;
    } catch (error) {
      console.error('Error joining challenge:', error);
      return false;
    }
  }
  
  async recordContribution(
    userId: string, 
    challengeId: string, 
    goalId: string, 
    value: number
  ): Promise<boolean> {
    try {
      // Get user's participation
      const participationQuery = await this.firestore
        .collection('challenge_participations')
        .where('userId', '==', userId)
        .where('challengeId', '==', challengeId)
        .where('status', '==', 'active')
        .get();
      
      if (participationQuery.empty) {
        throw new Error('User is not participating in this challenge');
      }
      
      const participationDoc = participationQuery.docs[0];
      const participation = participationDoc.data() as ChallengeParticipation;
      
      // Update contribution
      const currentValue = participation.contribution[goalId] || 0;
      const newValue = currentValue + value;
      participation.contribution[goalId] = newValue;
      
      // Update in database
      await participationDoc.ref.update({
        [`contribution.${goalId}`]: newValue
      });
      
      // Update goal progress in challenge
      await this.firestore.collection('challenges').doc(challengeId).update({
        [`goals.${goalId}.currentValue`]: firebase.firestore.FieldValue.increment(value)
      });
      
      // Check for newly earned rewards
      const challenge = await this.getChallengeById(challengeId);
      const newRewards = this.checkForNewRewards(challenge, participation);
      
      if (newRewards.length > 0) {
        // Update earned rewards
        const updatedEarnedRewards = [...participation.earnedRewards, ...newRewards.map(r => r.id)];
        await participationDoc.ref.update({
          earnedRewards: updatedEarnedRewards
        });
        
        // Notify user about new rewards
        NotificationService.sendChallengeRewardNotifications(userId, challengeId, newRewards);
      }
      
      return true;
    } catch (error) {
      console.error('Error recording contribution:', error);
      return false;
    }
  }
  
  // Helper methods omitted for brevity
  private async getUserParticipations(userId: string): Promise<ChallengeParticipation[]> { /* ... */ }
  private async getChallengeById(challengeId: string): Promise<Challenge> { /* ... */ }
  private checkForNewRewards(challenge: Challenge, participation: ChallengeParticipation): ChallengeReward[] { /* ... */ }
}

// Usage example
async function handleRecyclingSubmission(
  userId: string, 
  recyclingData: RecyclingSubmission
): Promise<void> {
  // Get active challenges the user is participating in
  const challengeService = ChallengeService.getInstance();
  const activeChallenges = await challengeService.getChallenges({
    status: 'active',
    participatedBy: userId
  });
  
  // Record contributions for relevant challenges
  for (const challenge of activeChallenges) {
    for (const goal of challenge.goals) {
      // Check if this recycling submission is relevant to this goal
      if (isSubmissionRelevantToGoal(recyclingData, goal)) {
        const contributionValue = calculateContributionValue(recyclingData, goal);
        await challengeService.recordContribution(
          userId,
          challenge.id,
          goal.id,
          contributionValue
        );
      }
    }
  }
}
```

### Key Files
- `src/services/ChallengeService.ts`: Service for managing challenges
- `src/components/challenges/ChallengeList.tsx`: Component for displaying available challenges
- `src/components/challenges/ChallengeDetails.tsx`: Component for displaying challenge details
- `src/components/challenges/ChallengeProgress.tsx`: Component for visualizing challenge progress
- `src/screens/ChallengesScreen.tsx`: Main screen for the challenges feature

## Integration Points
- **Related Features**: 
  - User profiles and achievements
  - Environmental impact sharing
  - Notification system
- **API Endpoints**: 
  - `GET /api/challenges`: Retrieves available challenges
  - `POST /api/challenges/{id}/join`: Joins a challenge
  - `POST /api/challenges/{id}/contribution`: Records a contribution
- **State Management**: 
  - Redux slice for challenges data
  - Local caching of active challenges
  - Real-time updates for challenge progress

## Performance Considerations
- **Optimization Techniques**: 
  - Batched updates for challenge progress
  - Lazy loading of challenge details
  - Caching of challenge data
- **Potential Bottlenecks**: 
  - Many simultaneous contributions during popular challenges
  - Large number of participants in community challenges
  - Real-time progress updates with many concurrent users
- **Battery/Resource Impact**: 
  - Throttled real-time updates to reduce battery consumption
  - Optimized firestore queries to minimize data transfer

## Testing Strategy
- **Unit Tests**: 
  - Challenge contribution calculations
  - Reward eligibility logic
  - Challenge filtering functionality
- **Integration Tests**: 
  - End-to-end challenge participation flow
  - Real-time updates of challenge progress
  - Reward distribution accuracy
- **Mock Data**: 
  - Sample challenges of various types and durations
  - Simulated user contributions
  - Edge cases for goal completion

## Accessibility
- **Keyboard Navigation**: 
  - Tab focus for challenge cards and actions
  - List navigation for challenge browsing
  - Keyboard shortcuts for common actions
- **Screen Reader Compatibility**: 
  - ARIA labels for challenge elements
  - Descriptive text for challenge goals and progress
  - Announcements for milestone achievements
- **Color Contrast**: 
  - High-contrast progress indicators
  - Text/background contrast meeting WCAG standards
  - Alternative indicators beyond color for challenge status

## Future Improvements
- Implement location-based community challenges
- Add team challenges with collaborative goals
- Create challenge templates for organizations to customize
- Develop challenge leaderboards for friendly competition
- Implement challenge sponsorship opportunities for partner organizations

## Related Documentation
- [User Profiles and Achievements](./user-profiles-achievements.md)
- [Environmental Impact Sharing](./environmental-impact-sharing.md)
- [Social Sharing Capabilities](./social-sharing-capabilities.md) 