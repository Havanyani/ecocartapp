import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

interface Impact {
  plastic: number;
  carbon?: number;
  water?: number;
}

interface Post {
  id: string;
  userName: string;
  timeAgo: string;
  content: string;
  likes: number;
  achievement?: string;
  impact?: Impact;
}

interface CommunityBoardProps {
  posts: Post[];
  onShare: (postId: string) => void;
  onLike: (postId: string) => void;
}

export function CommunityBoard({ posts, onShare, onLike }: CommunityBoardProps) {
  const renderPost = ({ item }: { item: Post }) => (
    <ThemedView style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <MaterialCommunityIcons name="account-circle" size={40} color="#666" />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.postTime}>{item.timeAgo}</Text>
          </View>
        </View>
        {item.achievement && (
          <View style={styles.achievementBadge}>
            <MaterialCommunityIcons name="trophy" size={16} color="#FFD700" />
            <Text style={styles.achievementText}>{item.achievement}</Text>
          </View>
        )}
      </View>

      <ThemedText style={styles.postContent}>{item.content}</ThemedText>
      
      {item.impact && (
        <View style={styles.impactContainer}>
          <Text style={styles.impactText}>
            🌍 Saved {item.impact.plastic}kg of plastic
            {item.impact.carbon && `, ${item.impact.carbon}kg CO₂`}
            {item.impact.water && `, ${item.impact.water}L water`}
          </Text>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <HapticTab 
          style={styles.actionButton}
          onPress={() => onLike(item.id)}
        >
          <IconSymbol name="thumb-up" size={20} color="#2e7d32" />
          <ThemedText style={styles.actionText}>{item.likes}</ThemedText>
        </HapticTab>

        <HapticTab 
          style={styles.actionButton}
          onPress={() => onShare(item.id)}
        >
          <IconSymbol name="share" size={20} color="#2e7d32" />
          <ThemedText style={styles.actionText}>Share</ThemedText>
        </HapticTab>
      </View>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        <IconSymbol name="earth" size={24} color="#2e7d32" />
        Community Impact
      </ThemedText>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postTime: {
    fontSize: 12,
    color: '#666',
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff9c4',
    padding: 4,
    borderRadius: 4,
  },
  achievementText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#ffa000',
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  impactContainer: {
    backgroundColor: '#e8f5e9',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  impactText: {
    color: '#2e7d32',
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    marginLeft: 4,
    color: '#666',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
}); 