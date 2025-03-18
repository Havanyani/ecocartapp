/**
 * RecyclingTips.tsx
 * 
 * Component for user-generated recycling tips and suggestions
 * Allows users to view, add, and interact with community recycling tips
 */

import { useStorage } from '@/hooks/useStorage';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define the RecyclingTip type
export interface RecyclingTip {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: number;
  likes: number;
  userLiked?: boolean;
  category: string;
  materialType?: string;
}

// Mock categories for recycling tips
const CATEGORIES = ['General', 'Plastic', 'Paper', 'Glass', 'Electronics', 'Composting'];

export default function RecyclingTips() {
  const { theme } = useTheme();
  const storage = useStorage();
  const [tips, setTips] = useState<RecyclingTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTipText, setNewTipText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch tips from storage
  useEffect(() => {
    const loadTips = async () => {
      try {
        const storedTips = await storage.getItem<string>('recycling_tips');
        if (storedTips) {
          setTips(JSON.parse(storedTips) as RecyclingTip[]);
        } else {
          // Initialize with some sample tips if none exist
          const sampleTips = generateSampleTips();
          await storage.setItem('recycling_tips', JSON.stringify(sampleTips));
          setTips(sampleTips);
        }
      } catch (error) {
        console.error('Error loading recycling tips:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTips();
  }, []);
  
  // Generate sample tips for initial data
  const generateSampleTips = (): RecyclingTip[] => {
    return [
      {
        id: '1',
        userId: 'system',
        userName: 'EcoCart Team',
        text: 'Rinse plastic containers before recycling to remove food residue.',
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
        likes: 42,
        category: 'Plastic',
      },
      {
        id: '2',
        userId: 'system',
        userName: 'EcoCart Team',
        text: 'Remove tape and staples from cardboard before recycling.',
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
        likes: 38,
        category: 'Paper',
      },
      {
        id: '3',
        userId: 'system',
        userName: 'EcoCart Team',
        text: 'Most grocery stores have plastic bag recycling bins at their entrances.',
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
        likes: 29,
        category: 'Plastic',
      },
    ];
  };
  
  // Add a new recycling tip
  const addTip = async () => {
    if (!newTipText.trim()) {
      Alert.alert('Error', 'Please enter a tip before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newTip: RecyclingTip = {
        id: Date.now().toString(), // Simple ID generation
        userId: 'current-user', // In a real app, get from auth context
        userName: 'You', // In a real app, get from user profile
        text: newTipText.trim(),
        createdAt: Date.now(),
        likes: 0,
        category: selectedCategory,
      };
      
      const updatedTips = [newTip, ...tips];
      await storage.setItem('recycling_tips', JSON.stringify(updatedTips));
      setTips(updatedTips);
      setNewTipText('');
      
      // Show success message
      Alert.alert('Success', 'Your recycling tip has been added!');
    } catch (error) {
      console.error('Error adding recycling tip:', error);
      Alert.alert('Error', 'Failed to add your tip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Like or unlike a tip
  const toggleLike = async (tipId: string) => {
    try {
      const updatedTips = tips.map(tip => {
        if (tip.id === tipId) {
          const userLiked = tip.userLiked || false;
          return {
            ...tip,
            likes: userLiked ? tip.likes - 1 : tip.likes + 1,
            userLiked: !userLiked,
          };
        }
        return tip;
      });
      
      await storage.setItem('recycling_tips', JSON.stringify(updatedTips));
      setTips(updatedTips);
    } catch (error) {
      console.error('Error updating tip like:', error);
    }
  };
  
  // Format the creation date of a tip
  const formatDate = (timestamp: number) => {
    return formatDistanceToNow(timestamp, { addSuffix: true });
  };
  
  // Render a single tip item
  const renderTipItem = ({ item }: { item: RecyclingTip }) => {
    return (
      <View style={[styles.tipCard, { backgroundColor: theme.colors.background }]}>
        <View style={styles.tipHeader}>
          <Text style={[styles.userName, { color: theme.colors.text.primary }]}>{item.userName}</Text>
          <Text style={[styles.dateText, { color: theme.colors.text.secondary }]}>{formatDate(item.createdAt)}</Text>
        </View>
        
        <Text style={[styles.tipText, { color: theme.colors.text.primary }]}>{item.text}</Text>
        
        <View style={styles.tipFooter}>
          <TouchableOpacity
            style={styles.categoryTag}
            onPress={() => setSelectedCategory(item.category)}
          >
            <Text style={styles.categoryText}>{item.category}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => toggleLike(item.id)}
          >
            <Ionicons
              name={item.userLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={item.userLiked ? '#ff6b6b' : theme.colors.text.primary}
            />
            <Text style={[styles.likeCount, { color: theme.colors.text.primary }]}>{item.likes}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Render category selector
  const renderCategorySelector = () => {
    return (
      <View style={styles.categorySelector}>
        <FlatList
          horizontal
          data={CATEGORIES}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === item && { color: '#fff' },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };
  
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>Loading recycling tips...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text.primary }]}
          placeholder="Share your recycling tip..."
          placeholderTextColor={theme.colors.text.secondary}
          value={newTipText}
          onChangeText={setNewTipText}
          multiline
        />
        
        {renderCategorySelector()}
        
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
          onPress={addTip}
          disabled={isSubmitting || !newTipText.trim()}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Share Tip</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={tips}
        renderItem={renderTipItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.tipsList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  inputContainer: {
    padding: 16,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  tipsList: {
    padding: 16,
  },
  tipCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontWeight: '600',
    fontSize: 16,
  },
  dateText: {
    fontSize: 12,
    opacity: 0.7,
  },
  tipText: {
    fontSize: 16,
    lineHeight: 22,
  },
  tipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  categoryTag: {
    backgroundColor: '#34D399',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 14,
  },
  categorySelector: {
    marginVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 