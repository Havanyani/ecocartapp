import { productService } from '@/services/ProductService';
import type { Product } from '@/types/product';
import { useCallback, useEffect, useState } from 'react';

interface UseProductsOptions {
  pageSize?: number;
  initialPage?: number;
}

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  currentPage: number;
  refreshProducts: () => Promise<void>;
  loadMore: () => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  getProductsByCategory: (category: string) => Promise<void>;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { pageSize = 20, initialPage = 1 } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productService.getProducts();
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = response.slice(startIndex, endIndex);
      setProducts(prev => page === 1 ? paginatedProducts : [...prev, ...paginatedProducts]);
      setHasMore(endIndex < response.length);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products'));
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchProducts(initialPage);
  }, [fetchProducts, initialPage]);

  const refreshProducts = useCallback(async () => {
    await fetchProducts(1);
  }, [fetchProducts]);

  const loadMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      await fetchProducts(currentPage + 1);
    }
  }, [currentPage, fetchProducts, hasMore, isLoading]);

  const searchProducts = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const results = await productService.searchProducts(query);
      setProducts(results);
      setHasMore(false);
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to search products'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProductsByCategory = useCallback(async (category: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const results = await productService.getProductsByCategory(category);
      setProducts(results);
      setHasMore(false);
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products by category'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    products,
    isLoading,
    error,
    hasMore,
    currentPage,
    refreshProducts,
    loadMore,
    searchProducts,
    getProductsByCategory,
  };
}

 