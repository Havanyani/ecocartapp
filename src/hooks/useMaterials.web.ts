import { useEffect, useState } from 'react';
import materials, { MaterialType } from '../mocks/materials.web';

/**
 * Hook for accessing materials data in web environment
 */
export function useMaterials() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return {
    isLoading,
    error,
    materials: materials.materials,
    materialTypes: MaterialType,
    getMaterialById: materials.getMaterialById,
    getMaterialsByType: materials.getMaterialsByType,
  };
}

export default useMaterials; 