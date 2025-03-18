import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data for rewards
const mockRewards = [
  {
    id: '1',
    title: 'Eco-Friendly Water Bottle',
    description: 'Get a reusable water bottle made from recycled materials.',
    pointsRequired: 100,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    category: 'merchandise',
  },
  {
    id: '2',
    title: '10% Off at EcoStore',
    description: 'Receive a 10% discount on your next purchase at EcoStore.',
    pointsRequired: 150,
    image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    category: 'discount',
  },
  {
    id: '3',
    title: 'Plant a Tree in Your Name',
    description: 'We will plant a tree in a deforested area in your name.',
    pointsRequired: 200,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    category: 'impact',
  },
];

// Component to display an individual reward card
function RewardCard({ reward }: { reward: typeof mockRewards[0] }) {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.rewardCard, { backgroundColor: theme.colors.card }]}>
      <Image 
        source={{ uri: reward.image }} 
        style={styles.rewardImage} 
        resizeMode="cover"
      />
      <View style={styles.rewardContent}>
        <View style={styles.rewardHeader}>
          <ThemedText style={styles.rewardTitle}>{reward.title}</ThemedText>
          <View style={[styles.pointsBadge, { backgroundColor: theme.colors.primary }]}>
            <ThemedText style={styles.pointsText}>{reward.pointsRequired} pts</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.rewardDescription}>{reward.description}</ThemedText>
        <TouchableOpacity 
          style={[styles.redeemButton, { backgroundColor: theme.colors.primary }]}
        >
          <ThemedText style={styles.redeemButtonText}>Redeem</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RewardsScreen() {
  const { theme } = useTheme();
  
  // Mock user points
  const userPoints = 175;
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerText}>Rewards</ThemedText>
          <ThemedText style={styles.subHeaderText}>
            Redeem your points for eco-friendly rewards
          </ThemedText>
        </View>
        
        <View style={[styles.pointsContainer, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="trophy" size={24} color={theme.colors.primary} />
          <View style={styles.pointsTextContainer}>
            <ThemedText style={styles.pointsLabel}>Your Points</ThemedText>
            <ThemedText style={styles.pointsValue}>{userPoints}</ThemedText>
          </View>
          <TouchableOpacity style={styles.historyButton}>
            <ThemedText style={[styles.historyButtonText, { color: theme.colors.primary }]}>
              History
            </ThemedText>
          </TouchableOpacity>
        </View>
        
        <View style={styles.categoriesContainer}>
          <TouchableOpacity style={[styles.categoryTab, styles.activeCategory]}>
            <ThemedText style={styles.categoryText}>All</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTab}>
            <ThemedText style={styles.categoryText}>Merchandise</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTab}>
            <ThemedText style={styles.categoryText}>Discounts</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTab}>
            <ThemedText style={styles.categoryText}>Impact</ThemedText>
          </TouchableOpacity>
        </View>
        
        <View style={styles.rewardsList}>
          {mockRewards.map(reward => (
            <RewardCard key={reward.id} reward={reward} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 16,
    opacity: 0.7,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pointsTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  pointsLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  historyButton: {
    padding: 8,
  },
  historyButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  activeCategory: {
    backgroundColor: '#e0f2e0',
  },
  categoryText: {
    fontSize: 14,
  },
  rewardsList: {
    marginBottom: 16,
  },
  rewardCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rewardImage: {
    width: '100%',
    height: 150,
  },
  rewardContent: {
    padding: 16,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  pointsBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  pointsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rewardDescription: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  redeemButton: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  redeemButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 