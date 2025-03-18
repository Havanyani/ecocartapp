/**
 * AIOfflineCache.ts
 * 
 * Service that manages caching and retrieving AI Assistant responses for offline use.
 * This service provides functionality to store, retrieve, and manage pre-cached responses
 * for the AI Assistant when the device is offline.
 */

import { faqData, FAQItem } from '@/data/faq-data';
import { calculateJaccardSimilarity } from '@/utils/ai/similarityUtils';
import { createInstrumentationContext, instrument } from '@/utils/performance/Instrumentation';
import { offlineStorageService } from '../OfflineStorageService';

export interface CachedResponse {
  query: string;
  response: string;
  timestamp: number;
  metadata?: {
    isFAQ?: boolean;
    faqId?: string;
    faqCategory?: string;
    source?: string;
  };
}

export type QueryMatch = {
  query: string;
  response: string;
  similarity: number;
  isFAQ?: boolean;
  faqId?: string;
  faqCategory?: string;
  source?: string;
}

// Similarity threshold for matching queries
const SIMILARITY_THRESHOLD = 0.7;

export class AIOfflineCache {
  private static instance: AIOfflineCache;
  private readonly CACHE_KEY = 'ai_assistant_responses';
  private readonly EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days
  private cache: CachedResponse[] = [];
  private isInitialized = false;

  /**
   * Get singleton instance
   */
  public static getInstance(): AIOfflineCache {
    if (!AIOfflineCache.instance) {
      AIOfflineCache.instance = new AIOfflineCache();
    }
    return AIOfflineCache.instance;
  }

  /**
   * Private constructor
   */
  private constructor() {
    // Initialize on first use
  }

  /**
   * Initialize the cache with common responses and FAQ data
   */
  public initialize = instrument(async (): Promise<void> => {
    if (this.isInitialized) {
      return;
    }

    // Load cache from storage
    this.cache = await this.getCache();
    
    // If cache is empty, preload with common responses and FAQs
    if (this.cache.length === 0) {
      await this.preloadCommonQueries();
      await this.cacheFAQData();
    }
    
    this.isInitialized = true;
  }, 'cache_load_time', 'AIOfflineCache.initialize');

  /**
   * Normalize query by removing extra whitespace, converting to lowercase
   */
  private normalizeQuery(query: string): string {
    return query.trim().toLowerCase();
  }

  /**
   * Find the best response match for a query
   */
  public findResponseMatch = instrument(async (query: string): Promise<QueryMatch | null> => {
    const lookupContext = createInstrumentationContext('similarity_calc', 'AIOfflineCache.similarityCalculation');
    
    const normalizedQuery = this.normalizeQuery(query);
    this.cache = await this.getCache();
    
    if (this.cache.length === 0) {
      return null;
    }
    
    // Calculate similarity with FAQ entries first
    const faqMatches = lookupContext.measure(() => {
      return this.cache
        .filter(item => item.metadata?.isFAQ)
        .map(item => ({
          query: item.query,
          response: item.response,
          similarity: calculateJaccardSimilarity(normalizedQuery, this.normalizeQuery(item.query)),
          isFAQ: item.metadata?.isFAQ,
          faqId: item.metadata?.faqId,
          faqCategory: item.metadata?.faqCategory,
          source: item.metadata?.source
        }))
        .filter(match => match.similarity > SIMILARITY_THRESHOLD)
        .sort((a, b) => b.similarity - a.similarity);
    });
    
    // If we found a FAQ match, return it
    if (faqMatches.length > 0) {
      return faqMatches[0];
    }
    
    // Otherwise check regular cached responses
    const matches = lookupContext.measure(() => {
      return this.cache
        .filter(item => !item.metadata?.isFAQ)
        .map(item => ({
          query: item.query,
          response: item.response,
          similarity: calculateJaccardSimilarity(normalizedQuery, this.normalizeQuery(item.query)),
          isFAQ: false
        }))
        .filter(match => match.similarity > SIMILARITY_THRESHOLD)
        .sort((a, b) => b.similarity - a.similarity);
    });
    
    if (matches.length > 0) {
      return matches[0];
    }
    
    return null;
  }, 'cache_lookup', 'AIOfflineCache.findResponseMatch');

  /**
   * Find a FAQ match for a query
   */
  public async findFAQMatch(query: string): Promise<FAQItem | null> {
    const match = await this.findResponseMatch(query);
    if (match?.isFAQ && match.faqId) {
      const faq = faqData.find(f => f.id === match.faqId);
      return faq || null;
    }
    return null;
  }

  /**
   * Cache a query and its response
   */
  public saveResponse = instrument(async (
    query: string, 
    response: string, 
    metadata?: {
      isFAQ?: boolean;
      faqId?: string;
      faqCategory?: string;
      source?: string;
    }
  ): Promise<void> => {
    const normalizedQuery = this.normalizeQuery(query);
    
    // Get current cache
    this.cache = await this.getCache();
    
    // Check if a similar query already exists
    const existingIndex = this.cache.findIndex(
      item => calculateJaccardSimilarity(normalizedQuery, this.normalizeQuery(item.query)) > 0.9
    );
    
    // Add or replace the entry
    const entry: CachedResponse = {
      query: query,
      response: response,
      timestamp: Date.now(),
      metadata
    };
    
    if (existingIndex >= 0) {
      this.cache[existingIndex] = entry;
    } else {
      this.cache.push(entry);
    }
    
    // Keep the cache size manageable - limit to 1000 entries
    if (this.cache.length > 1000) {
      // Sort by timestamp (newest first) and keep the newest 1000
      this.cache.sort((a, b) => b.timestamp - a.timestamp);
      this.cache = this.cache.slice(0, 1000);
    }
    
    // Save updated cache
    await this.saveCache(this.cache);
  }, 'cache_load_time', 'AIOfflineCache.saveResponse');

  /**
   * Preload common queries and responses
   */
  public preloadCommonQueries = instrument(async (): Promise<void> => {
    const commonQueries = [
      {
        query: "How can I reduce my carbon footprint?",
        response: "You can reduce your carbon footprint by choosing eco-friendly products in the EcoCart app, recycling your waste properly, and being mindful of your energy and water consumption. The app will show you the environmental impact of your purchases and suggest alternatives with lower impact."
      },
      {
        query: "What is EcoCart?",
        response: "EcoCart is an app that helps you make more sustainable shopping choices. It shows you the environmental impact of products, offers eco-friendly alternatives, and helps you track your personal environmental impact over time."
      },
      {
        query: "How does the recycling program work?",
        response: "EcoCart's recycling program allows you to schedule pickups for recyclable materials directly from the app. You can earn eco-points for recycling, which can be redeemed for discounts on future purchases or donated to environmental causes."
      }
    ];
    
    for (const item of commonQueries) {
      await this.saveResponse(item.query, item.response);
    }
  }, 'cache_load_time', 'AIOfflineCache.preloadCommonQueries');

  /**
   * Cache all FAQ data for offline use
   */
  public cacheFAQData = instrument(async (): Promise<void> => {
    for (const faq of faqData) {
      await this.saveResponse(
        faq.question,
        faq.answer,
        {
          isFAQ: true,
          faqId: faq.id,
          faqCategory: faq.category,
          source: 'EcoCart FAQ'
        }
      );
    }
  }, 'cache_load_time', 'AIOfflineCache.cacheFAQData');

  /**
   * Get the cache from storage
   */
  private getCache = instrument(async (): Promise<CachedResponse[]> => {
    const data = await offlineStorageService.getCachedData<CachedResponse[]>(this.CACHE_KEY);
    return data || [];
  }, 'cache_lookup', 'AIOfflineCache.getCache');
  
  /**
   * Save the cache to storage
   */
  private saveCache = instrument(async (cache: CachedResponse[]): Promise<void> => {
    await offlineStorageService.cacheData(this.CACHE_KEY, cache, this.EXPIRATION_TIME);
  }, 'cache_load_time', 'AIOfflineCache.saveCache');
}

// Export singleton instance
export const aiOfflineCache = AIOfflineCache.getInstance();
export default aiOfflineCache; 