import { ErrorView } from '@/components/ErrorView';
import { LoadingView } from '@/components/LoadingView';
import { useTheme } from '@/hooks/useTheme';
import { SmartHomeStackParamList } from '@/navigation/types';
import { SmartHomeService } from '@/services/smart-home/SmartHomeService';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type EnergySavingTipsScreenProps = {
  route: RouteProp<SmartHomeStackParamList, 'EnergySavingTips'>;
  navigation: StackNavigationProp<SmartHomeStackParamList, 'EnergySavingTips'>;
};

interface EnergySavingTip {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  appliesTo: string[]; // device types this tip applies to
  saved: boolean;
  imageUri?: string;
}

export default function EnergySavingTipsScreen({ route, navigation }: EnergySavingTipsScreenProps) {
  const { deviceId } = route.params || {};
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tips, setTips] = useState<EnergySavingTip[]>([]);
  const [filteredTips, setFilteredTips] = useState<EnergySavingTip[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [device, setDevice] = useState<any>(null);
  
  useEffect(() => {
    loadEnergySavingTips();
  }, [deviceId]);
  
  useEffect(() => {
    filterTips();
  }, [activeCategory, tips]);
  
  const loadEnergySavingTips = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const smartHomeService = SmartHomeService.getInstance();
      
      // If deviceId is provided, we'll filter tips for this specific device
      if (deviceId) {
        const deviceData = await smartHomeService.getDeviceById(deviceId);
        setDevice(deviceData);
      }
      
      // Load all tips
      const energyTips = await smartHomeService.getEnergySavingTips();
      setTips(energyTips);
      
      // Extract unique categories
      const uniqueCategories = ['all', ...new Set(energyTips.map(tip => tip.category))];
      setCategories(uniqueCategories);
      
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load energy saving tips');
      setIsLoading(false);
    }
  };
  
  const filterTips = () => {
    // If no tips yet, don't filter
    if (tips.length === 0) return;
    
    let result = [...tips];
    
    // Filter by device if provided
    if (device) {
      result = result.filter(tip => 
        tip.appliesTo.includes('all') || 
        tip.appliesTo.includes(device.type)
      );
    }
    
    // Filter by category if not 'all'
    if (activeCategory !== 'all') {
      result = result.filter(tip => tip.category === activeCategory);
    }
    
    setFilteredTips(result);
  };
  
  const toggleSaveTip = async (tipId: string, currentSavedState: boolean) => {
    try {
      // Update UI immediately for responsive feel
      setTips(tips.map(tip => 
        tip.id === tipId ? { ...tip, saved: !currentSavedState } : tip
      ));
      
      // Update on the server
      const smartHomeService = SmartHomeService.getInstance();
      await smartHomeService.saveEnergySavingTip(tipId, !currentSavedState);
    } catch (err) {
      // Revert on error
      setTips(prevTips => [...prevTips]);
      Alert.alert('Error', 'Failed to save this tip');
    }
  };
  
  const shareTip = async (tip: EnergySavingTip) => {
    try {
      const message = `Energy Saving Tip: ${tip.title}\n\n${tip.description}\n\nShared from EcoCart App`;
      
      await Share.share({
        message,
        title: 'Energy Saving Tip',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share this tip');
    }
  };
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.info;
      default: return theme.colors.secondaryText;
    }
  };
  
  const renderTipItem = ({ item }: { item: EnergySavingTip }) => (
    <View style={[styles.tipCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.tipHeader}>
        <View style={styles.tipTitleRow}>
          <Text style={[styles.tipTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          <View 
            style={[
              styles.impactBadge,
              { backgroundColor: getImpactColor(item.impact) + '30' }
            ]}
          >
            <Text style={[
              styles.impactText, 
              { color: getImpactColor(item.impact) }
            ]}>
              {item.impact.toUpperCase()} IMPACT
            </Text>
          </View>
        </View>
        
        <View style={styles.tipActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleSaveTip(item.id, item.saved)}
          >
            <Ionicons 
              name={item.saved ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={item.saved ? theme.colors.primary : theme.colors.secondaryText} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => shareTip(item)}
          >
            <Ionicons name="share-social-outline" size={24} color={theme.colors.secondaryText} />
          </TouchableOpacity>
        </View>
      </View>
      
      {item.imageUri && (
        <Image 
          source={{ uri: item.imageUri }} 
          style={styles.tipImage}
          resizeMode="cover"
        />
      )}
      
      <Text style={[styles.tipDescription, { color: theme.colors.text }]}>
        {item.description}
      </Text>
      
      <View style={styles.categoryBadge}>
        <Text style={[styles.categoryText, { color: theme.colors.secondaryText }]}>
          {item.category}
        </Text>
      </View>
    </View>
  );
  
  if (isLoading) {
    return <LoadingView message="Loading energy saving tips..." />;
  }
  
  if (error) {
    return <ErrorView message={error} onRetry={loadEnergySavingTips} />;
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Energy Saving Tips
        </Text>
        {device && (
          <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
            For {device.name}
          </Text>
        )}
      </View>
      
      <View style={styles.categoryTabs}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryTab,
                activeCategory === item && { 
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary
                }
              ]}
              onPress={() => setActiveCategory(item)}
            >
              <Text 
                style={{ 
                  color: activeCategory === item ? theme.colors.white : theme.colors.text 
                }}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryTabsContent}
        />
      </View>
      
      {filteredTips.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bulb-outline" size={64} color={theme.colors.secondaryText} />
          <Text style={[styles.emptyStateText, { color: theme.colors.secondaryText }]}>
            No tips available
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: theme.colors.secondaryText }]}>
            {activeCategory !== 'all' 
              ? 'Try selecting a different category' 
              : 'Check back later for energy saving tips'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTips}
          keyExtractor={(item) => item.id}
          renderItem={renderTipItem}
          contentContainerStyle={styles.tipsList}
          showsVerticalScrollIndicator={false}
        />
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  categoryTabs: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginRight: 8,
  },
  tipsList: {
    padding: 16,
  },
  tipCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tipHeader: {
    marginBottom: 12,
  },
  tipTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  impactText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tipActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 16,
  },
  tipImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  categoryText: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
}); 