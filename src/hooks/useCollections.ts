import { useCallback, useState } from 'react';

interface Collection {
  id: string;
  date: string;
  weight: number;
  credits: number;
  status: 'completed' | 'pending' | 'cancelled';
  impact: {
    plasticSaved: number;
    co2Reduced: number;
    treesEquivalent: number;
  };
}

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      const mockCollections: Collection[] = [
        {
          id: '1',
          date: new Date().toISOString(),
          weight: 5,
          credits: 50,
          status: 'completed',
          impact: {
            plasticSaved: 5,
            co2Reduced: 2,
            treesEquivalent: 1
          }
        }
      ];
      setCollections(mockCollections);
    } catch (err) {
      setError('Failed to fetch collections');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { collections, isLoading, error, fetchCollections };
} 