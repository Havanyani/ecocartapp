/**
 * FAQ.tsx
 * 
 * Community FAQ component for displaying frequently asked questions
 * with search functionality and category filtering.
 */

import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define FAQ item type
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// FAQ Component props
interface FAQProps {
  initialCategory?: string;
  showSearch?: boolean;
  showCategories?: boolean;
}

// Mock FAQ data
const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    question: 'How does plastic collection work in the app?',
    answer: 'You can schedule plastic waste collection through the app by selecting a date, time, and location. Our collection team will arrive at the scheduled time to collect your recyclable plastics. You earn eco-credits based on the weight and type of plastic collected.',
    category: 'Collection'
  },
  {
    id: '2',
    question: 'How are eco-credits calculated?',
    answer: 'Eco-credits are calculated based on the weight and type of recyclable materials collected. Different materials have different credit values. For example, PET plastic bottles might earn more credits than plastic bags. The app shows your earned credits after each collection.',
    category: 'Credits'
  },
  {
    id: '3',
    question: 'Can I use eco-credits for grocery deliveries?',
    answer: 'Yes! You can redeem your eco-credits for discounts on grocery deliveries from our partner stores. Navigate to the grocery section and select "Redeem Credits" at checkout to apply your available credits to your order.',
    category: 'Groceries'
  },
  {
    id: '4',
    question: 'How do I track my environmental impact?',
    answer: 'Your environmental impact is shown in the analytics dashboard. This includes metrics like CO2 emissions avoided, water saved, and equivalent trees preserved. Each collection contributes to your total impact, which is updated in real-time.',
    category: 'Impact'
  },
  {
    id: '5',
    question: 'What materials can be recycled through the app?',
    answer: 'We accept various recyclable materials including plastic bottles (PET, HDPE), plastic containers, glass, aluminum cans, paper, and cardboard. The app provides a comprehensive list of acceptable materials in the materials section.',
    category: 'Materials'
  },
  {
    id: '6',
    question: 'How do community challenges work?',
    answer: 'Community challenges are time-limited events where users can participate to achieve collective recycling goals. Successful challenges unlock special rewards for all participants. You can join challenges from the community section and track progress in real-time.',
    category: 'Community'
  },
  {
    id: '7',
    question: 'Can I use the app when offline?',
    answer: 'Yes! The app has comprehensive offline functionality. You can schedule collections, view your history, and even participate in some community features while offline. Data will sync automatically when you're back online.',
    category: 'App Usage'
  },
  {
    id: '8',
    question: 'How is my data protected?',
    answer: 'We take data privacy seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent. You can review our full privacy policy in the app settings.',
    category: 'Privacy'
  },
  {
    id: '9',
    question: 'How do I report a problem with collection?',
    answer: 'If you experience any issues with your collection, you can report it directly in the app. Go to your collection history, select the problematic collection, and tap "Report Issue". Provide details about the problem, and our support team will address it promptly.',
    category: 'Support'
  },
  {
    id: '10',
    question: 'Can I schedule recurring collections?',
    answer: 'Yes! You can set up recurring collections on a weekly, bi-weekly, or monthly basis. This feature is available when scheduling a new collection - simply toggle the "Recurring" option and select your preferred frequency.',
    category: 'Collection'
  }
];

export function FAQ({ 
  initialCategory,
  showSearch = true,
  showCategories = true 
}: FAQProps) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Extract unique categories from FAQ data
  const categories = useMemo(() => {
    const allCategories = FAQ_DATA.map(item => item.category);
    return ['All', ...Array.from(new Set(allCategories))];
  }, []);

  // Filter FAQ items based on search query and selected category
  const filteredFAQs = useMemo(() => {
    let result = FAQ_DATA;
    
    // Filter by category if selected
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(item => item.category === selectedCategory);
    }
    
    // Filter by search query if present
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        item => 
          item.question.toLowerCase().includes(query) || 
          item.answer.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [FAQ_DATA, searchQuery, selectedCategory]);

  // Toggle FAQ item expansion
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Render category pills
  const renderCategories = () => {
    if (!showCategories) return null;
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryPill,
              {
                backgroundColor: 
                  selectedCategory === category
                    ? theme.colors.primary
                    : `${theme.colors.primary}20`,
              },
            ]}
            onPress={() => setSelectedCategory(category)}
            accessible
            accessibilityLabel={`${category} category`}
            accessibilityHint={`Filter FAQs to show only ${category} related questions`}
          >
            <Text
              style={[
                styles.categoryText,
                {
                  color: 
                    selectedCategory === category
                      ? '#fff'
                      : theme.colors.primary,
                },
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // Render FAQ item
  const renderFAQItem = ({ item }: { item: FAQItem }) => {
    const isExpanded = expandedId === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.faqItem,
          { backgroundColor: theme.colors.card },
        ]}
        onPress={() => toggleExpand(item.id)}
        accessible
        accessibilityLabel={`Question: ${item.question}`}
        accessibilityHint={isExpanded ? "Tap to collapse" : "Tap to expand and view answer"}
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={styles.faqHeader}>
          <View style={styles.questionContainer}>
            <Text
              style={[styles.question, { color: theme.colors.text }]}
              numberOfLines={isExpanded ? undefined : 2}
            >
              {item.question}
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.colors.text}
          />
        </View>
        
        {isExpanded && (
          <View style={styles.answerContainer}>
            <Text style={[styles.answer, { color: theme.colors.text }]}>
              {item.answer}
            </Text>
            <View style={styles.categoryContainer}>
              <Text style={[styles.categoryLabel, { color: theme.colors.textSecondary }]}>
                Category:
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.category)}
                style={[
                  styles.answerCategoryPill,
                  { backgroundColor: `${theme.colors.primary}20` },
                ]}
              >
                <Text
                  style={[
                    styles.answerCategoryText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {item.category}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading FAQ...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Frequently Asked Questions
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Find answers to common questions about EcoCart
        </Text>
      </View>
      
      {showSearch && (
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search FAQ..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {renderCategories()}
      
      {filteredFAQs.length > 0 ? (
        <FlatList
          data={filteredFAQs}
          keyExtractor={(item) => item.id}
          renderItem={renderFAQItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="search-outline" 
            size={48} 
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            No matching questions found
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
            Try adjusting your search query or category
          </Text>
          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          >
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  faqItem: {
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  questionContainer: {
    flex: 1,
    marginRight: 8,
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
  },
  answer: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 12,
    marginRight: 8,
  },
  answerCategoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  answerCategoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default FAQ; 