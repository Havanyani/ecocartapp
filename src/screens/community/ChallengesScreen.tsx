import ChallengeCard from '@/components/community/ChallengeCard';
import EmptyState from '@/components/shared/EmptyState';
import FilterChip from '@/components/ui/FilterChip';
import SearchBar from '@/components/ui/SearchBar';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { useAuth } from '@/providers/AuthProvider';
import { ChallengeService } from '@/services/ChallengeService';
import {
    Challenge,
    ChallengeCategory,
    ChallengeDifficulty,
    ChallengeFilters,
    ChallengeStatus
} from '@/types/Challenge';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

enum FilterTab {
  ALL = 'All',
  ACTIVE = 'Active',
  UPCOMING = 'Upcoming',
  COMPLETED = 'Completed',
  MY = 'My Challenges',
}

export default function ChallengesScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedTab, setSelectedTab] = useState<FilterTab>(FilterTab.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<ChallengeCategory[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<ChallengeDifficulty[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const loadChallenges = useCallback(async (refresh: boolean = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else if (!isRefreshing) {
      setIsLoading(true);
    }
    
    try {
      const filters: ChallengeFilters = {
        search: searchQuery,
        category: selectedCategories.length > 0 ? selectedCategories : undefined,
        difficulty: selectedDifficulties.length > 0 ? selectedDifficulties : undefined,
      };
      
      if (selectedTab === FilterTab.ACTIVE) {
        filters.status = [ChallengeStatus.ACTIVE];
      } else if (selectedTab === FilterTab.UPCOMING) {
        filters.status = [ChallengeStatus.UPCOMING];
      } else if (selectedTab === FilterTab.COMPLETED) {
        filters.status = [ChallengeStatus.COMPLETED];
      }
      
      let fetchedChallenges;
      
      if (selectedTab === FilterTab.MY && user) {
        fetchedChallenges = await ChallengeService.getUserChallenges(user.id);
      } else {
        fetchedChallenges = await ChallengeService.getChallenges(filters);
      }
      
      setChallenges(fetchedChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedTab, searchQuery, selectedCategories, selectedDifficulties, user]);
  
  useFocusEffect(
    useCallback(() => {
      loadChallenges();
    }, [loadChallenges])
  );
  
  const handleTabChange = (tab: FilterTab) => {
    setSelectedTab(tab);
  };
  
  const handleRefresh = () => {
    loadChallenges(true);
  };
  
  const handleChallengePress = (challenge: Challenge) => {
    navigation.navigate('ChallengeDetails' as never, { challengeId: challenge.id } as never);
  };
  
  const toggleCategoryFilter = (category: ChallengeCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const toggleDifficultyFilter = (difficulty: ChallengeDifficulty) => {
    setSelectedDifficulties(prev => 
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };
  
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedDifficulties([]);
    setSearchQuery('');
  };
  
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      );
    }
    
    return (
      <EmptyState
        icon="trophy-outline"
        title="No Challenges Found"
        message={
          selectedTab === FilterTab.MY
            ? "You haven't joined any challenges yet. Explore and join challenges to see them here."
            : "No challenges found with the current filters. Try adjusting your filters or check back later for new challenges."
        }
        actionLabel={selectedTab === FilterTab.MY ? "Explore Challenges" : "Clear Filters"}
        onAction={selectedTab === FilterTab.MY ? () => setSelectedTab(FilterTab.ALL) : clearFilters}
      />
    );
  };
  
  const filterTabs = [
    FilterTab.ALL,
    FilterTab.ACTIVE,
    FilterTab.UPCOMING,
    FilterTab.COMPLETED,
    FilterTab.MY,
  ];
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Challenges</Text>
        <SegmentedControl
          tabs={filterTabs}
          currentIndex={filterTabs.indexOf(selectedTab)}
          onChange={(index) => handleTabChange(filterTabs[index])}
          containerStyle={styles.segmentedControl}
        />
      </View>
      
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search challenges..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => loadChallenges()}
          onClear={() => {
            setSearchQuery('');
            loadChallenges();
          }}
          style={styles.searchBar}
        />
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name={showFilters ? "options" : "options-outline"}
            size={24}
            color={selectedCategories.length > 0 || selectedDifficulties.length > 0 
              ? Theme.colors.primary 
              : Theme.colors.text}
          />
        </TouchableOpacity>
      </View>
      
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Categories</Text>
          <View style={styles.chipContainer}>
            {Object.values(ChallengeCategory).map((category) => (
              <FilterChip
                key={category}
                label={category}
                isSelected={selectedCategories.includes(category)}
                onPress={() => toggleCategoryFilter(category)}
              />
            ))}
          </View>
          
          <Text style={styles.filterTitle}>Difficulty</Text>
          <View style={styles.chipContainer}>
            {Object.values(ChallengeDifficulty).map((difficulty) => (
              <FilterChip
                key={difficulty}
                label={difficulty}
                isSelected={selectedDifficulties.includes(difficulty)}
                onPress={() => toggleDifficultyFilter(difficulty)}
              />
            ))}
          </View>
          
          {(selectedCategories.length > 0 || selectedDifficulties.length > 0) && (
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChallengeCard
            challenge={item}
            onPress={() => handleChallengePress(item)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Theme.colors.primary]}
            tintColor={Theme.colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    padding: 16,
    paddingTop: 24,
    backgroundColor: Theme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 16,
  },
  segmentedControl: {
    marginVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.cardBackground,
  },
  searchBar: {
    flex: 1,
  },
  filterButton: {
    marginLeft: 8,
    padding: 8,
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: Theme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  clearButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    marginTop: 8,
  },
  clearButtonText: {
    color: Theme.colors.primary,
    fontWeight: '500',
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
}); 