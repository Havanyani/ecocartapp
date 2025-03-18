import { ChallengeSystem } from '@/components/community/ChallengeSystem';
import { render } from '@testing-library/react-native';
import React from 'react';

describe('ChallengeSystem', () => {
  const mockChallenges = [
    {
      id: '1',
      title: 'Daily Collection',
      description: 'Collect 5kg of plastic today',
      icon: 'recycle',
      targetAmount: 5,
      currentAmount: 3,
      reward: { credits: 50 },
      type: 'daily' as const
    },
    {
      id: '2',
      title: 'Special Event',
      description: 'Collect 100kg in Earth Month',
      icon: 'earth',
      targetAmount: 100,
      currentAmount: 0,
      reward: { credits: 500, badge: 'earth-champion' },
      type: 'special' as const,
      deadline: new Date('2024-04-30')
    }
  ];

  const mockAchievements = [
    {
      id: '1',
      title: 'First Collection',
      description: 'Complete your first plastic collection',
      icon: 'trophy',
      unlockedAt: new Date('2024-03-01'),
      rarity: 'common' as const
    },
    {
      id: '2',
      title: 'Legendary Collector',
      description: 'Collect 1000kg total',
      icon: 'crown',
      rarity: 'legendary' as const
    }
  ];

  it('handles challenges with zero progress', () => {
    const zeroChallenges = [
      {
        ...mockChallenges[0],
        currentAmount: 0
      }
    ];

    const { getByText } = render(
      <ChallengeSystem
        activeChallenges={zeroChallenges}
        achievements={mockAchievements}
        onChallengeSelect={jest.fn()}
        onAchievementSelect={jest.fn()}
      />
    );

    expect(getByText('0/5kg')).toBeTruthy();
  });

  it('handles challenges exceeding target', () => {
    const exceededChallenge = [
      {
        ...mockChallenges[0],
        currentAmount: 7,
        targetAmount: 5
      }
    ];

    const { getByText } = render(
      <ChallengeSystem
        activeChallenges={exceededChallenge}
        achievements={mockAchievements}
        onChallengeSelect={jest.fn()}
        onAchievementSelect={jest.fn()}
      />
    );

    expect(getByText('7/5kg')).toBeTruthy();
  });

  it('handles expired challenges', () => {
    const expiredChallenge = [
      {
        ...mockChallenges[1],
        deadline: new Date('2024-01-01')
      }
    ];

    const { getByText } = render(
      <ChallengeSystem
        activeChallenges={expiredChallenge}
        achievements={mockAchievements}
        onChallengeSelect={jest.fn()}
        onAchievementSelect={jest.fn()}
      />
    );

    expect(getByText('Ends: 1/1/2024')).toBeTruthy();
  });

  it('handles empty challenge and achievement lists', () => {
    const { queryByText } = render(
      <ChallengeSystem
        activeChallenges={[]}
        achievements={[]}
        onChallengeSelect={jest.fn()}
        onAchievementSelect={jest.fn()}
      />
    );

    expect(queryByText(/Collect/)).toBeNull();
  });

  it('handles malformed achievement dates', () => {
    const badAchievements = [
      {
        ...mockAchievements[0],
        unlockedAt: 'invalid-date' as any
      }
    ];

    const { queryByText } = render(
      <ChallengeSystem
        activeChallenges={mockChallenges}
        achievements={badAchievements}
        onChallengeSelect={jest.fn()}
        onAchievementSelect={jest.fn()}
      />
    );

    expect(queryByText('Invalid Date')).toBeNull();
  });
}); 