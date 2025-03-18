import { TourStep } from '@/components/FeatureTour';
import { MaterialCard } from '@/components/materials/MaterialCard';
import { MaterialHeader } from '@/components/materials/MaterialHeader';
import { MaterialList } from '@/components/materials/MaterialList';
import { useTheme } from '@/hooks/useTheme';
import useTutorial from '@/hooks/useTutorial';
import { TutorialID } from '@/services/TutorialService';
import { MaterialCategory } from '@/types/Material';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data for materials (this would come from an API in a real app)
const mockMaterials = [
  { 
    id: '1', 
    name: 'Plastic (PET)',
    description: 'Polyethylene terephthalate, commonly used for water bottles and food containers.',
    image: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGxhc3RpYyUyMGJvdHRsZXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    recyclingValue: 4.5,
    recyclingGuide: 'Rinse, remove labels if possible, crush to save space.',
    environmentalImpact: 'Reduces oil consumption and greenhouse gas emissions.',
  },
  { 
    id: '2', 
    name: 'Paper & Cardboard',
    description: 'Paper products including office paper, newspaper, magazines, and cardboard boxes.',
    image: 'https://images.unsplash.com/photo-1607703829739-c05b7beddf60?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNhcmRib2FyZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    recyclingValue: 3.8,
    recyclingGuide: 'Keep dry, remove plastic coatings or linings, flatten cardboard boxes.',
    environmentalImpact: 'Saves trees, reduces water pollution and energy consumption.',
  },
  { 
    id: '3', 
    name: 'Glass',
    description: 'Glass bottles and jars of any color (green, clear, brown).',
    image: 'https://images.unsplash.com/photo-1550511611-5abd23d3cdff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Z2xhc3MlMjBib3R0bGVzfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    recyclingValue: 5.0,
    recyclingGuide: 'Rinse thoroughly, remove lids, labels can stay on.',
    environmentalImpact: 'Infinitely recyclable without quality loss, saves raw materials.',
  },
  { 
    id: '4', 
    name: 'Aluminum',
    description: 'Beverage cans, foil, and aluminum food containers.',
    image: 'https://images.unsplash.com/photo-1610400288586-5b98b5390aaa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGFsdW1pbnVtJTIwY2Fuc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    recyclingValue: 4.8,
    recyclingGuide: 'Rinse, crush cans to save space, ball up foil into larger pieces.',
    environmentalImpact: 'Uses 95% less energy than producing new aluminum.',
  },
];

export default function MaterialsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Refs for feature tour
  const titleRef = useRef<View>(null);
  const materialCardRef = useRef<View>(null);
  const filterRef = useRef<View>(null);
  const headerRef = useRef<View>(null);

  // Tutorial steps
  const tutorialSteps: TourStep[] = [
    {
      targetRef: titleRef,
      title: 'Materials Directory',
      description: 'This screen shows all recyclable materials supported by EcoCart. Learn about each material and how to properly recycle it.',
      position: 'bottom',
    },
    {
      targetRef: materialCardRef,
      title: 'Material Cards',
      description: 'Tap on any material to see detailed information, recycling guides, and the environmental impact of recycling this material.',
      position: 'bottom',
    },
    {
      targetRef: filterRef,
      title: 'Filter Materials',
      description: 'Use this button to filter materials by type, value, or availability in your area.',
      position: 'bottom',
    },
    {
      targetRef: headerRef,
      title: 'Track Your Impact',
      description: 'EcoCart tracks your recycling activity. The more you recycle, the more environmental impact you make!',
      position: 'top',
    },
  ];

  // Use the tutorial hook
  const { 
    isVisible: isTutorialVisible,
    completeTutorial,
    resetTutorial,
  } = useTutorial(TutorialID.MATERIALS_TOUR, {
    showDelay: 1000,
  });

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsRefreshing(false);
  };

  const openMaterialDetails = (id: string) => {
    router.push(`/materials/${id}`);
  };

  const RenderMaterialCard = ({ item, index }: { item: any, index: number }) => (
    <TouchableOpacity 
      onPress={() => openMaterialDetails(item.id)}
      ref={index === 0 ? materialCardRef : null}
    >
      <MaterialCard material={item} style={{ marginBottom: 16 }} />
    </TouchableOpacity>
  );

  const handleCategorySelect = (category: MaterialCategory | null) => {
    setSelectedCategory(category);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <MaterialHeader searchQuery={searchQuery} onSearch={setSearchQuery} />
      <MaterialList searchQuery={searchQuery} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  content: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  featuredContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
  },
  resetButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: '500',
  },
}); 