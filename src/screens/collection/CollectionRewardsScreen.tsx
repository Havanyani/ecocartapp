import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/hooks/useTheme';
import { RecyclingRewardsService } from '@/services/RecyclingRewardsService';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  imageUrl: string;
  isAvailable: boolean;
}

export function CollectionRewardsScreen() {
  const { theme } = useTheme();
  const { user } = useUser();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setIsLoading(true);
      const [rewardsData, pointsData] = await Promise.all([
        RecyclingRewardsService.getAvailableRewards(),
        RecyclingRewardsService.getUserPoints(user?.id || '')
      ]);
      setRewards(rewardsData);
      setUserPoints(pointsData);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemReward = async (rewardId: string) => {
    try {
      await RecyclingRewardsService.redeemReward(user?.id || '', rewardId);
      // Refresh rewards and points after redemption
      loadRewards();
    } catch (error) {
      console.error('Error redeeming reward:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading rewards...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <ThemedView style={styles.content}>
          {/* Points Summary */}
          <Card style={styles.pointsCard}>
            <View style={styles.pointsHeader}>
              <IconSymbol name="star" size={24} color={theme.colors.warning} />
              <ThemedText style={styles.pointsTitle}>Your Points</ThemedText>
            </View>
            <ThemedText style={styles.pointsValue}>{userPoints}</ThemedText>
            <ThemedText style={styles.pointsSubtext}>
              Earn more points by recycling more materials!
            </ThemedText>
          </Card>

          {/* Available Rewards */}
          <ThemedText style={styles.sectionTitle}>Available Rewards</ThemedText>
          {rewards.map((reward) => (
            <Card key={reward.id} style={styles.rewardCard}>
              <View style={styles.rewardHeader}>
                <View style={styles.rewardInfo}>
                  <ThemedText style={styles.rewardTitle}>{reward.title}</ThemedText>
                  <ThemedText style={styles.rewardDescription}>
                    {reward.description}
                  </ThemedText>
                </View>
                <View style={styles.pointsContainer}>
                  <IconSymbol name="star" size={16} color={theme.colors.warning} />
                  <ThemedText style={styles.pointsCost}>
                    {reward.pointsCost}
                  </ThemedText>
                </View>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.redeemButton,
                  (!reward.isAvailable || userPoints < reward.pointsCost) && styles.disabledButton
                ]}
                onPress={() => handleRedeemReward(reward.id)}
                disabled={!reward.isAvailable || userPoints < reward.pointsCost}
              >
                <ThemedText style={styles.redeemButtonText}>
                  {!reward.isAvailable
                    ? 'Not Available'
                    : userPoints < reward.pointsCost
                    ? 'Not Enough Points'
                    : 'Redeem Reward'}
                </ThemedText>
              </TouchableOpacity>
            </Card>
          ))}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsCard: {
    marginBottom: 24,
    padding: 16,
    alignItems: 'center',
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  pointsSubtext: {
    textAlign: 'center',
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  rewardCard: {
    marginBottom: 16,
    padding: 16,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  rewardInfo: {
    flex: 1,
    marginRight: 16,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardDescription: {
    opacity: 0.7,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsCost: {
    marginLeft: 4,
    fontWeight: '600',
  },
  redeemButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  redeemButtonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 