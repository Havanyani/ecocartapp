import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'discount' | 'donation' | 'merchandise' | 'experience';
  icon: string;
  available: boolean;
}

/**
 * Rewards Screen
 * Allows users to redeem their EcoPoints for various rewards
 */
export default function RewardsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userPoints] = useState(720); // Would come from user state in a real app

  // Mock data for rewards
  const rewards: Reward[] = [
    {
      id: '1',
      title: '10% Off at EcoStore',
      description: 'Get 10% off your next purchase at EcoStore',
      pointsCost: 200,
      category: 'discount',
      icon: 'pricetag-outline',
      available: true,
    },
    {
      id: '2',
      title: 'Plant a Tree',
      description: 'We\'ll plant a tree on your behalf',
      pointsCost: 150,
      category: 'donation',
      icon: 'leaf-outline',
      available: true,
    },
    {
      id: '3',
      title: 'EcoCart Tote Bag',
      description: 'Stylish and sustainable tote bag',
      pointsCost: 350,
      category: 'merchandise',
      icon: 'bag-outline',
      available: true,
    },
    {
      id: '4',
      title: 'Recycling Center Tour',
      description: 'Exclusive tour of a local recycling facility',
      pointsCost: 500,
      category: 'experience',
      icon: 'compass-outline',
      available: true,
    },
    {
      id: '5',
      title: '15% Off at GreenGrocer',
      description: 'Discount on organic produce',
      pointsCost: 250,
      category: 'discount',
      icon: 'pricetag-outline',
      available: true,
    },
    {
      id: '6',
      title: 'Clean Ocean Donation',
      description: 'Donate to ocean cleanup efforts',
      pointsCost: 200,
      category: 'donation',
      icon: 'water-outline',
      available: true,
    },
    {
      id: '7',
      title: 'Reusable Water Bottle',
      description: 'Premium stainless steel water bottle',
      pointsCost: 400,
      category: 'merchandise',
      icon: 'flask-outline',
      available: true,
    },
    {
      id: '8',
      title: 'Sustainable Workshop',
      description: 'Attend a workshop on sustainable living',
      pointsCost: 600,
      category: 'experience',
      icon: 'school-outline',
      available: true,
    },
  ];

  const categories = [
    { id: 'all', name: 'All Rewards', icon: 'grid-outline' },
    { id: 'discount', name: 'Discounts', icon: 'pricetag-outline' },
    { id: 'donation', name: 'Donations', icon: 'heart-outline' },
    { id: 'merchandise', name: 'Merchandise', icon: 'shirt-outline' },
    { id: 'experience', name: 'Experiences', icon: 'compass-outline' },
  ];

  const filteredRewards = selectedCategory && selectedCategory !== 'all'
    ? rewards.filter(reward => reward.category === selectedCategory)
    : rewards;

  const handleRedeemReward = (reward: Reward) => {
    if (userPoints >= reward.pointsCost) {
      Alert.alert(
        'Redeem Reward',
        `Are you sure you want to redeem ${reward.title} for ${reward.pointsCost} points?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Redeem',
            onPress: () => {
              // In a real app, this would call an API to redeem the reward
              Alert.alert(
                'Success!',
                `You've successfully redeemed ${reward.title}. Check your email for details.`,
                [{ text: 'OK' }]
              );
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Insufficient Points',
        `You need ${reward.pointsCost - userPoints} more points to redeem this reward.`,
        [{ text: 'OK' }]
      );
    }
  };

  const renderRewardItem = ({ item }: { item: Reward }) => {
    const canRedeem = userPoints >= item.pointsCost;
    
    return (
      <View 
        style={[
          styles.rewardCard, 
          { 
            backgroundColor: theme.colors.card,
            opacity: canRedeem ? 1 : 0.7 
          }
        ]}
      >
        <View style={styles.rewardHeader}>
          <View 
            style={[
              styles.rewardIcon, 
              { backgroundColor: `${theme.colors.primary}20` }
            ]}
          >
            <Ionicons name={item.icon as any} size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.rewardPoints}>
            <Text style={[styles.pointsCost, { color: canRedeem ? theme.colors.primary : theme.colors.textSecondary }]}>
              {item.pointsCost} pts
            </Text>
          </View>
        </View>
        
        <Text style={[styles.rewardTitle, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        
        <Text style={[styles.rewardDescription, { color: theme.colors.textSecondary }]}>
          {item.description}
        </Text>
        
        <TouchableOpacity
          style={[
            styles.redeemButton,
            { 
              backgroundColor: canRedeem ? theme.colors.primary : theme.colors.border,
            }
          ]}
          onPress={() => handleRedeemReward(item)}
          disabled={!canRedeem}
        >
          <Text style={[styles.redeemButtonText, { color: theme.colors.white }]}>
            {canRedeem ? 'Redeem' : 'Not Enough Points'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Rewards
        </Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Points Display */}
      <View style={[styles.pointsContainer, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.pointsContent}>
          <Text style={[styles.pointsLabel, { color: theme.colors.white }]}>Your EcoPoints</Text>
          <Text style={[styles.pointsValue, { color: theme.colors.white }]}>{userPoints}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.earnMoreButton, { backgroundColor: `${theme.colors.white}20` }]}
          onPress={() => router.push('/community/challenges')}
        >
          <Text style={[styles.earnMoreText, { color: theme.colors.white }]}>Earn More</Text>
        </TouchableOpacity>
      </View>
      
      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.id && { 
                  backgroundColor: `${theme.colors.primary}20`,
                  borderColor: theme.colors.primary 
                },
                !selectedCategory && item.id === 'all' && { 
                  backgroundColor: `${theme.colors.primary}20`,
                  borderColor: theme.colors.primary 
                },
                { borderColor: theme.colors.border }
              ]}
              onPress={() => setSelectedCategory(item.id === 'all' ? null : item.id)}
            >
              <Ionicons 
                name={item.icon as any} 
                size={18} 
                color={(selectedCategory === item.id || (!selectedCategory && item.id === 'all')) 
                  ? theme.colors.primary 
                  : theme.colors.text
                } 
              />
              <Text 
                style={[
                  styles.categoryText,
                  { 
                    color: (selectedCategory === item.id || (!selectedCategory && item.id === 'all')) 
                      ? theme.colors.primary 
                      : theme.colors.text
                  }
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      
      {/* Rewards List */}
      <FlatList
        data={filteredRewards}
        numColumns={2}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.rewardsList}
        renderItem={renderRewardItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No rewards available in this category
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
  },
  pointsContent: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  earnMoreButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  earnMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    marginTop: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  rewardsList: {
    padding: 16,
  },
  rewardCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    maxWidth: '46%',
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardPoints: {
    alignItems: 'flex-end',
  },
  pointsCost: {
    fontSize: 16,
    fontWeight: '700',
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  rewardDescription: {
    fontSize: 12,
    marginBottom: 16,
  },
  redeemButton: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  redeemButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
}); 