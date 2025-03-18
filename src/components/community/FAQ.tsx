import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface FAQProps {
  faqs: FAQItem[];
  showSearch?: boolean;
  showCategories?: boolean;
  title?: string;
}

export function FAQ({ faqs, showSearch = true, showCategories = true, title = 'Frequently Asked Questions' }: FAQProps) {
  const { theme } = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Get unique categories
  const categories = [...new Set(faqs.map(faq => faq.category))];
  
  // Filter FAQs based on search and category
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };
  
  const renderFAQItem = ({ item }: { item: FAQItem }) => {
    const isExpanded = expandedId === item.id;
    
    return (
      <View style={[styles.faqItem, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={styles.questionContainer}
          onPress={() => toggleExpand(item.id)}
          accessible
          accessibilityLabel={item.question}
          accessibilityHint={isExpanded ? "Collapse answer" : "Expand to see answer"}
          accessibilityRole="button"
        >
          <Text style={[styles.question, { color: theme.colors.text.primary }]}>{item.question}</Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.answerContainer}>
            <Text style={[styles.answer, { color: theme.colors.text.primary }]}>{item.answer}</Text>
            <View style={styles.categoryTag}>
              <Text style={[styles.categoryText, { color: theme.colors.primary }]}>
                {item.category}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>{title}</Text>
      
      {showSearch && (
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
          <Ionicons name="search" size={20} color={theme.colors.text.primary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text.primary }]}
            placeholder="Search FAQs..."
            placeholderTextColor={theme.colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.text.primary} />
            </TouchableOpacity>
          ) : null}
        </View>
      )}
      
      {showCategories && categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          <TouchableOpacity
            style={[
              styles.categoryPill,
              { 
                backgroundColor: !selectedCategory ? theme.colors.primary : theme.colors.background,
                borderColor: theme.colors.primary,
              }
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.categoryPillText,
                { color: !selectedCategory ? '#FFFFFF' : theme.colors.primary }
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryPill,
                { 
                  backgroundColor: selectedCategory === category ? theme.colors.primary : theme.colors.background,
                  borderColor: theme.colors.primary
                }
              ]}
              onPress={() => setSelectedCategory(category === selectedCategory ? null : category)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  { color: selectedCategory === category ? '#FFFFFF' : theme.colors.primary }
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      
      {filteredFAQs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="help-circle-outline" size={40} color={theme.colors.text.primary} />
          <Text style={[styles.emptyText, { color: theme.colors.text.primary }]}>
            No FAQs found for "{searchQuery}"
          </Text>
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={() => {
              setSearchQuery('');
              setSelectedCategory(null);
            }}
          >
            <Text style={[styles.resetText, { color: theme.colors.primary }]}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredFAQs}
          renderItem={renderFAQItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 16,
  },
  faqItem: {
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  questionContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
  },
  answer: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resetText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 