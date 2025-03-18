import { Product } from '@/types/product';

class ProductService {
  private static instance: ProductService;
  private cache: Map<string, Product[] | number> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  async getProducts(): Promise<Product[]> {
    const cachedProducts = this.getCachedProducts();
    if (cachedProducts) {
      return cachedProducts;
    }

    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const products = await response.json();
      this.cacheProducts(products);
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await fetch(`/api/products/category/${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching products for category ${category}:`, error);
      throw error;
    }
  }

  private getCachedProducts(): Product[] | null {
    const cached = this.cache.get('all') as Product[] | undefined;
    if (!cached) return null;

    const timestamp = this.cache.get('timestamp') as number | undefined;
    if (!timestamp || Date.now() - timestamp > this.cacheTimeout) {
      this.cache.clear();
      return null;
    }

    return cached;
  }

  private cacheProducts(products: Product[]): void {
    this.cache.set('all', products);
    this.cache.set('timestamp', Date.now());
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const productService = ProductService.getInstance(); 