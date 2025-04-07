import { Material, MaterialCategory } from '@/types/materials';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Sample materials data (in a real app, this would come from an API)
const SAMPLE_MATERIALS: Material[] = [
  {
    id: '1',
    name: 'Plastic Bottles',
    description: 'PET plastic bottles and containers',
    category: 'recyclable',
    imageUrl: 'https://example.com/plastic-bottles.jpg',
    recyclingInstructions: ['Rinse containers', 'Remove caps', 'Crush to save space'],
    environmentalImpact: 'High impact if not recycled properly',
    disposalGuidelines: ['Place in recycling bin', 'Keep dry and clean']
  },
  {
    id: '2',
    name: 'Food Waste',
    description: 'Organic food waste and leftovers',
    category: 'non-recyclable',
    imageUrl: 'https://example.com/food-waste.jpg',
    recyclingInstructions: ['Compost if possible'],
    environmentalImpact: 'Produces methane in landfills',
    disposalGuidelines: ['Use composting bin if available', 'Seal in bags']
  },
  {
    id: '3',
    name: 'Aluminum Cans',
    description: 'Aluminum beverage cans',
    category: 'recyclable',
    imageUrl: 'https://example.com/aluminum-cans.jpg',
    recyclingInstructions: ['Rinse containers', 'Crush if possible'],
    environmentalImpact: 'Highly recyclable with low energy cost',
    disposalGuidelines: ['Place in recycling bin', 'Keep dry']
  },
  {
    id: '4',
    name: 'Glass Bottles',
    description: 'Glass bottles and jars',
    category: 'recyclable',
    imageUrl: 'https://example.com/glass-bottles.jpg',
    recyclingInstructions: ['Remove caps and lids', 'Rinse thoroughly'],
    environmentalImpact: 'Infinitely recyclable without quality loss',
    disposalGuidelines: ['Place in glass recycling bin', 'Handle with care']
  },
  {
    id: '5',
    name: 'Styrofoam',
    description: 'Expanded polystyrene foam',
    category: 'non-recyclable',
    imageUrl: 'https://example.com/styrofoam.jpg',
    recyclingInstructions: ['Check local facilities for special recycling programs'],
    environmentalImpact: 'Non-biodegradable and harmful to environment',
    disposalGuidelines: ['Place in regular trash', 'Reduce usage when possible']
  },
  {
    id: '6',
    name: 'Cardboard Box',
    description: 'Corrugated cardboard packaging',
    category: 'Paper',
    imageUrl: 'https://picsum.photos/200/303',
    points: 5,
    recyclingInstructions: 'Flatten and keep dry',
    carbonFootprint: 35.4,
    recyclability: 0.88,
  },
  {
    id: '7',
    name: 'Newspaper',
    description: 'Printed newspaper',
    category: 'Paper',
    imageUrl: 'https://picsum.photos/200/304',
    points: 3,
    recyclingInstructions: 'Bundle or place in paper bag',
    carbonFootprint: 28.1,
    recyclability: 0.91,
  },
  {
    id: '8',
    name: 'Steel Can',
    description: 'Food cans made of steel',
    category: 'Metal',
    imageUrl: 'https://picsum.photos/200/305',
    points: 12,
    recyclingInstructions: 'Rinse and remove label if possible',
    carbonFootprint: 68.7,
    recyclability: 0.92,
  },
  {
    id: '9',
    name: 'Plastic Container',
    description: 'Food containers made of plastic',
    category: 'Plastic',
    imageUrl: 'https://picsum.photos/200/306',
    points: 8,
    recyclingInstructions: 'Rinse and remove food residue',
    carbonFootprint: 76.2,
    recyclability: 0.85,
  },
  {
    id: '10',
    name: 'Magazine',
    description: 'Glossy magazines and catalogs',
    category: 'Paper',
    imageUrl: 'https://picsum.photos/200/307',
    points: 4,
    recyclingInstructions: 'Keep dry and bundle together',
    carbonFootprint: 31.5,
    recyclability: 0.87,
  },
];

// Sample categories
const SAMPLE_CATEGORIES: MaterialCategory[] = [
  { id: 'Plastic', name: 'Plastic', icon: 'bottle' },
  { id: 'Metal', name: 'Metal', icon: 'can' },
  { id: 'Glass', name: 'Glass', icon: 'glass' },
  { id: 'Paper', name: 'Paper', icon: 'paper' },
];

export interface UseMaterialsOptions {
  searchQuery?: string;
  categories?: string[];
  page?: number;
  limit?: number;
  sortBy?: keyof Material;
  sortDirection?: 'asc' | 'desc';
}

export interface UseMaterialsResult {
  materials: Material[];
  isLoading: boolean;
  error: string | null;
  fetchMaterials: () => Promise<void>;
  filterMaterials: (category: 'recyclable' | 'non-recyclable') => Material[];
}

/**
 * A hook for accessing and filtering materials with optimized performance
 */
export function useMaterials(options: UseMaterialsOptions = {}): UseMaterialsResult {
  const {
    searchQuery = '',
    categories = [],
    page = 1,
    limit = 10,
    sortBy = 'name',
    sortDirection = 'asc',
  } = options;

  const [materials, setMaterials] = useState<Material[]>(SAMPLE_MATERIALS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Memoize the filtering and sorting logic to avoid unnecessary recalculations
  const filteredAndSortedMaterials = useMemo(() => {
    // Filter materials based on search query and selected categories
    let result = [...SAMPLE_MATERIALS];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(material => 
        material.name.toLowerCase().includes(query) || 
        material.description.toLowerCase().includes(query) ||
        material.category.toLowerCase().includes(query)
      );
    }
    
    if (categories.length > 0) {
      result = result.filter(material => 
        categories.includes(material.category)
      );
    }
    
    // Sort materials
    result.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  }, [searchQuery, categories, sortBy, sortDirection]);

  // Load materials based on current pagination
  useEffect(() => {
    const loadMaterials = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Calculate pagination
        const startIndex = 0;
        const endIndex = page * limit;
        const paginatedMaterials = filteredAndSortedMaterials.slice(startIndex, endIndex);
        
        setMaterials(paginatedMaterials);
        setTotalCount(filteredAndSortedMaterials.length);
        setHasMore(endIndex < filteredAndSortedMaterials.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMaterials();
  }, [page, limit, filteredAndSortedMaterials]);

  // Function to load more items
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      // In a real implementation, you would increment the page
      // Here we're just simulating it since we already have all data
    }
  }, [isLoading, hasMore]);

  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // Simulating API call with sample data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMaterials(SAMPLE_MATERIALS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterMaterials = useCallback((category: 'recyclable' | 'non-recyclable') => {
    return materials.filter(material => material.category === category);
  }, [materials]);

  return {
    materials,
    isLoading,
    error,
    fetchMaterials,
    filterMaterials,
  };
} 