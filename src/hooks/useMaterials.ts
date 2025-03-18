import { Material, MaterialCategory } from '@/types/Material';
import { useEffect, useState } from 'react';

// Mock data for development
const mockMaterials: Material[] = [
  {
    id: '1',
    name: 'Plastic Bottles',
    description: 'Clean plastic bottles and containers',
    category: MaterialCategory.PLASTIC,
    value: 0.5,
    imageUrl: 'https://example.com/plastic-bottles.jpg',
  },
  {
    id: '2',
    name: 'Cardboard',
    description: 'Flattened cardboard boxes and packaging',
    category: MaterialCategory.PAPER,
    value: 0.3,
    imageUrl: 'https://example.com/cardboard.jpg',
  },
  {
    id: '3',
    name: 'Aluminum Cans',
    description: 'Empty and clean aluminum beverage cans',
    category: MaterialCategory.METAL,
    value: 0.8,
    imageUrl: 'https://example.com/aluminum-cans.jpg',
  },
];

export interface UseMaterialsOptions {
  category?: MaterialCategory;
  searchQuery?: string;
}

export interface UseMaterialsResult {
  materials: Material[];
  isLoading: boolean;
  error: Error | null;
}

export function useMaterials({ category, searchQuery }: UseMaterialsOptions): UseMaterialsResult {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchMaterials = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Filter materials based on category and search query
        let filteredMaterials = [...mockMaterials];

        if (category) {
          filteredMaterials = filteredMaterials.filter(
            material => material.category === category
          );
        }

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredMaterials = filteredMaterials.filter(
            material =>
              material.name.toLowerCase().includes(query) ||
              material.description.toLowerCase().includes(query)
          );
        }

        setMaterials(filteredMaterials);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch materials'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, [category, searchQuery]);

  return { materials, isLoading, error };
} 