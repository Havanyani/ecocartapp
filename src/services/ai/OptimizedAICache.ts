/**
 * OptimizedAICache.ts
 * 
 * Optimized cache implementation for AI Assistant responses with tiered storage
 * and improved performance for offline access.
 */

import { faqData, FAQItem } from '@/data/faq-data';
import { calculateJaccardSimilarity, calculateLevenshteinSimilarity } from '@/utils/ai/similarityUtils';
import { createInstrumentationContext, instrument, recordMemoryUsage } from '@/utils/performance/Instrumentation';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import LRUCache as a constructor to avoid TypeScript namespace issues
import { Buffer } from 'buffer';
import { gzip, ungzip } from 'pako';

// Types
export interface CacheEntry {
  query: string;
  response: string;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  metadata?: {
    isFAQ?: boolean;
    faqId?: string;
    faqCategory?: string;
    source?: string;
    tags?: string[];
    compressed?: boolean;
    originalSize?: number;
  };
}

export interface CacheMatch {
  query: string;
  response: string;
  similarity: number;
  isFAQ?: boolean;
  faqId?: string;
  faqCategory?: string;
  source?: string;
}

// Cache configuration
const CONFIG = {
  MEMORY_CACHE_SIZE: 100, // Number of entries in memory
  DISK_CACHE_SIZE: 1000,  // Number of entries on disk
  SIMILARITY_THRESHOLD: 0.75, // Threshold for FAQ matches
  RESPONSE_THRESHOLD: 0.7,    // Threshold for regular responses
  CACHE_EXPIRATION: 7 * 24 * 60 * 60 * 1000, // 7 days
  HIGH_PRIORITY_TAGS: ['faq', 'common', 'popular'],
  COMPRESSION_THRESHOLD: 500,  // Characters threshold for compression
  LAZY_LOAD_THRESHOLD: 20,     // Number of entries to lazy load at startup
  COMPRESSION_RATIO_THRESHOLD: 0.7, // Only store compressed if ratio is below this
};

// Cache storage keys
const KEYS = {
  DISK_CACHE: 'optimized_ai_cache_entries',
  META_INFO: 'optimized_ai_cache_meta',
  FAQ_CACHE: 'optimized_ai_faq_cache'
};

/**
 * Optimized AI cache with tiered storage strategy.
 * Uses a memory LRU cache for frequently accessed items,
 * with backup persistent storage for less frequently used items.
 */
export class OptimizedAICache {
  private static instance: OptimizedAICache;
  
  // Memory cache (fast access, limited size)
  private memoryCache: Map<string, CacheEntry>;
  private recentKeys: string[] = [];
  
  // In-memory index for quick lookup by normalized query
  private queryIndex: Map<string, string[]> = new Map();
  
  // Cached FAQ entries indexed by ID for fast lookup
  private faqIndex: Map<string, CacheEntry> = new Map();
  
  // Category index for faster lookup by category
  private categoryIndex: Map<string, string[]> = new Map();
  
  // Cache metadata
  private metadata = {
    lastUpdated: 0,
    totalEntries: 0,
    faqEntries: 0,
    regularEntries: 0
  };
  
  // Initialization flag
  private isInitialized = false;
  
  // Lazy loading tracking
  private isFullyLoaded = false;
  private lazyLoadInProgress = false;
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): OptimizedAICache {
    if (!OptimizedAICache.instance) {
      OptimizedAICache.instance = new OptimizedAICache();
    }
    return OptimizedAICache.instance;
  }
  
  /**
   * Private constructor
   */
  private constructor() {
    // Initialize memory cache
    this.memoryCache = new Map<string, CacheEntry>();
  }
  
  /**
   * Initialize the cache
   */
  public initialize = instrument(async (): Promise<void> => {
    if (this.isInitialized) return;
    
    const context = createInstrumentationContext('cache_load_time', 'OptimizedAICache.initialize');
    context.start();
    
    try {
      recordMemoryUsage('OptimizedAICache.initialize.start');
      
      // Load cache metadata
      await this.loadMetadata();
      
      // Only preload high-priority items initially for faster startup
      await this.preloadHighPriorityEntries();
      
      // Build indexes for fast lookup
      await this.buildIndexes();
      
      // If cache is empty, initialize with defaults
      if (this.metadata.totalEntries === 0) {
        await this.preloadDefaults();
      }
      
      this.isInitialized = true;
      this.isFullyLoaded = false; // Mark that we've only loaded essential items
      recordMemoryUsage('OptimizedAICache.initialize.end');
      
      // Trigger lazy loading of remaining items in the background
      this.lazyLoadRemainingEntries();
    } finally {
      context.end();
    }
  }, 'cache_load_time', 'OptimizedAICache.initialize');
  
  /**
   * Lazy load remaining cache entries in the background
   */
  private lazyLoadRemainingEntries = async (): Promise<void> => {
    if (this.lazyLoadInProgress || this.isFullyLoaded) return;
    
    this.lazyLoadInProgress = true;
    
    try {
      const allEntries = await this.loadEntriesFromDisk();
      const remainingEntries = allEntries.filter(entry => {
        // Skip entries already in memory cache
        const key = this.getKeyFromQuery(this.normalizeQuery(entry.query));
        return !this.memoryCache.has(key);
      });
      
      // Process entries in batches to avoid memory spikes
      const BATCH_SIZE = 20;
      for (let i = 0; i < remainingEntries.length; i += BATCH_SIZE) {
        const batch = remainingEntries.slice(i, i + BATCH_SIZE);
        
        // Process each entry in the batch
        for (const entry of batch) {
          // Decompress if needed
          const processedEntry = entry.metadata?.compressed 
            ? this.decompressEntry(entry) 
            : entry;
            
          // Update indexes but don't load into memory cache
          const key = this.getKeyFromQuery(this.normalizeQuery(processedEntry.query));
          this.addToQueryIndex(this.normalizeQuery(processedEntry.query), key);
          
          if (processedEntry.metadata?.isFAQ && processedEntry.metadata.faqId) {
            this.faqIndex.set(processedEntry.metadata.faqId, processedEntry);
            
            if (processedEntry.metadata.faqCategory) {
              this.addToCategoryIndex(processedEntry.metadata.faqCategory, key);
            }
          }
        }
        
        // Yield to event loop to avoid blocking UI
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      this.isFullyLoaded = true;
    } catch (error) {
      console.error('Error lazy loading cache entries:', error);
    } finally {
      this.lazyLoadInProgress = false;
    }
  };
  
  /**
   * Lookup a query in the cache
   */
  public findMatch = instrument(async (query: string): Promise<CacheMatch | null> => {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const normalizedQuery = this.normalizeQuery(query);
    const similarityContext = createInstrumentationContext('similarity_calc', 'OptimizedAICache.similarityCalculation');
    
    try {
      // First, try exact match (fastest path)
      const exactKey = this.getKeyFromQuery(normalizedQuery);
      let exactMatch = this.memoryCache.get(exactKey);
      
      if (exactMatch) {
        this.trackAccess(exactMatch, exactKey);
        if (exactMatch.metadata?.compressed) {
          exactMatch = this.decompressEntry(exactMatch);
          this.memoryCache.set(exactKey, exactMatch);
        }
        return this.entryToMatch(exactMatch, 1.0); // Perfect match
      }
      
      // Next, try indexed similar queries (fast path)
      const similarQueryKeys = this.findSimilarKeysFromIndex(normalizedQuery);
      if (similarQueryKeys.length > 0) {
        // Get all potential matches from memory cache first
        const potentialMatches: Array<{entry: CacheEntry, similarity: number, key: string}> = [];
        
        // Calculate similarity for each potential match
        return similarityContext.measure(() => {
          for (const key of similarQueryKeys) {
            const entry = this.memoryCache.get(key);
            if (entry) {
              const similarity = this.calculateQuerySimilarity(normalizedQuery, this.normalizeQuery(entry.query));
              if ((entry.metadata?.isFAQ && similarity > CONFIG.SIMILARITY_THRESHOLD) || 
                  similarity > CONFIG.RESPONSE_THRESHOLD) {
                potentialMatches.push({ entry, similarity, key });
              }
            }
          }
          
          // If we have matches, return the best one
          if (potentialMatches.length > 0) {
            // Sort by similarity (highest first)
            potentialMatches.sort((a, b) => b.similarity - a.similarity);
            const bestMatch = potentialMatches[0];
            this.trackAccess(bestMatch.entry, bestMatch.key);
            if (bestMatch.entry.metadata?.compressed) {
              const decompressed = this.decompressEntry(bestMatch.entry);
              this.memoryCache.set(bestMatch.key, decompressed);
              return this.entryToMatch(decompressed, bestMatch.similarity);
            }
            return this.entryToMatch(bestMatch.entry, bestMatch.similarity);
          }
          
          return null;
        });
      }
      
      // Finally, fallback to full scan of FAQs for important queries (slow path)
      return await this.fullScanForMatch(normalizedQuery);
      
    } catch (error) {
      console.error('Error in cache lookup:', error);
      return null;
    }
  }, 'cache_lookup', 'OptimizedAICache.findMatch');
  
  /**
   * Find FAQ match
   */
  public findFAQMatch = instrument(async (query: string): Promise<FAQItem | null> => {
    const match = await this.findMatch(query);
    if (match?.isFAQ && match.faqId) {
      const faq = faqData.find(f => f.id === match.faqId);
      return faq || null;
    }
    return null;
  }, 'cache_lookup', 'OptimizedAICache.findFAQMatch');
  
  /**
   * Save a response to the cache
   */
  public saveResponse = instrument(async (
    query: string, 
    response: string, 
    metadata?: CacheEntry['metadata']
  ): Promise<void> => {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const normalizedQuery = this.normalizeQuery(query);
    const key = this.getKeyFromQuery(normalizedQuery);
    
    // Determine if response should be compressed
    let compressedResponse = response;
    let isCompressed = false;
    let originalSize = 0;
    
    if (response.length > CONFIG.COMPRESSION_THRESHOLD) {
      // Try compressing
      const compressionResult = this.compressString(response);
      isCompressed = compressionResult.compressionRatio < CONFIG.COMPRESSION_RATIO_THRESHOLD;
      
      if (isCompressed) {
        compressedResponse = compressionResult.compressed;
        originalSize = response.length;
      }
    }
    
    // Create or update cache entry
    const entry: CacheEntry = {
      query,
      response: isCompressed ? compressedResponse : response,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
      metadata: {
        ...metadata,
        compressed: isCompressed,
        originalSize: isCompressed ? originalSize : undefined
      }
    };
    
    // Save to memory cache
    this.memoryCache.set(key, entry);
    
    // Update LRU tracking
    this.trackAccess(entry, key);
    
    // Update indexes
    this.addToQueryIndex(normalizedQuery, key);
    
    if (metadata?.isFAQ && metadata.faqId) {
      this.faqIndex.set(metadata.faqId, entry);
      
      if (metadata.faqCategory) {
        this.addToCategoryIndex(metadata.faqCategory.toLowerCase(), key);
      }
    }
    
    // Update metadata
    this.updateMetadata(entry);
    
    // Periodically persist metadata
    this.debounceMetadataSave();
    
    // If memory cache is too large, evict least recently used items
    this.enforceMemoryCacheLimit();
  }, 'cache_load_time', 'OptimizedAICache.saveResponse');
  
  /**
   * Enforce the memory cache size limit using LRU strategy
   */
  private enforceMemoryCacheLimit(): void {
    if (this.memoryCache.size <= CONFIG.MEMORY_CACHE_SIZE) {
      return;
    }
    
    // Calculate how many items to evict
    const itemsToEvict = this.memoryCache.size - CONFIG.MEMORY_CACHE_SIZE;
    
    // Evict oldest accessed items first
    const oldestKeys = this.recentKeys.slice(0, itemsToEvict);
    for (const key of oldestKeys) {
      const entry = this.memoryCache.get(key);
      if (entry) {
        // Save to disk before evicting
        this.saveToDisk(entry);
        this.memoryCache.delete(key);
      }
    }
    
    // Update recent keys list
    this.recentKeys = this.recentKeys.slice(itemsToEvict);
  }
  
  /**
   * Preload default/common responses
   */
  private preloadDefaults = instrument(async (): Promise<void> => {
    // Preload common queries
    const commonQueries = [
      {
        query: "How can I reduce my carbon footprint?",
        response: "You can reduce your carbon footprint by choosing eco-friendly products in the EcoCart app, recycling your waste properly, and being mindful of your energy and water consumption. The app will show you the environmental impact of your purchases and suggest alternatives with lower impact.",
        metadata: {
          tags: ['common', 'popular', 'carbon']
        }
      },
      {
        query: "What is EcoCart?",
        response: "EcoCart is an app that helps you make more sustainable shopping choices. It shows you the environmental impact of products, offers eco-friendly alternatives, and helps you track your personal environmental impact over time.",
        metadata: {
          tags: ['common', 'popular', 'info']
        }
      },
      {
        query: "How does the recycling program work?",
        response: "EcoCart's recycling program allows you to schedule pickups for recyclable materials directly from the app. You can earn eco-points for recycling, which can be redeemed for discounts on future purchases or donated to environmental causes.",
        metadata: {
          tags: ['common', 'recycling']
        }
      }
    ];
    
    // Preload FAQs
    await this.cacheAllFAQs();
    
    // Preload common queries
    for (const item of commonQueries) {
      await this.saveResponse(item.query, item.response, item.metadata);
    }
  }, 'cache_load_time', 'OptimizedAICache.preloadDefaults');
  
  /**
   * Cache all FAQs
   */
  private cacheAllFAQs = instrument(async (): Promise<void> => {
    for (const faq of faqData) {
      await this.saveResponse(faq.question, faq.answer, {
        isFAQ: true,
        faqId: faq.id,
        faqCategory: faq.category,
        source: 'EcoCart FAQ',
        tags: ['faq', faq.category.toLowerCase()]
      });
    }
  }, 'cache_load_time', 'OptimizedAICache.cacheAllFAQs');
  
  /**
   * Perform a full scan of the cache to find the best match
   * This is a fallback for when indexed lookups fail
   */
  private fullScanForMatch = instrument(async (normalizedQuery: string): Promise<CacheMatch | null> => {
    const similarityContext = createInstrumentationContext('similarity_calc', 'OptimizedAICache.fullScan');
    
    // Load all entries from disk (this could be slow, but is a fallback)
    // In the future, we can optimize this to load in chunks
    const diskEntries = await this.loadEntriesFromDisk();
    
    return similarityContext.measure(() => {
      // Calculate similarity for all entries
      const matches = diskEntries
        .map(entry => ({
          entry,
          similarity: this.calculateQuerySimilarity(normalizedQuery, this.normalizeQuery(entry.query))
        }))
        .filter(item => {
          // Use different thresholds for FAQ vs regular entries
          return (item.entry.metadata?.isFAQ && item.similarity > CONFIG.SIMILARITY_THRESHOLD) || 
                 (item.similarity > CONFIG.RESPONSE_THRESHOLD);
        })
        .sort((a, b) => b.similarity - a.similarity);
      
      // Return the best match if there is one
      if (matches.length > 0) {
        const bestMatch = matches[0];
        
        // Add this entry to memory cache for faster future access
        const key = this.getKeyFromQuery(this.normalizeQuery(bestMatch.entry.query));
        this.memoryCache.set(key, bestMatch.entry);
        
        // Track access
        this.trackAccess(bestMatch.entry, key);
        
        return this.entryToMatch(bestMatch.entry, bestMatch.similarity);
      }
      
      return null;
    });
  }, 'cache_lookup', 'OptimizedAICache.fullScanForMatch');
  
  /**
   * Load high-priority entries into memory
   */
  private preloadHighPriorityEntries = instrument(async (): Promise<void> => {
    try {
      // Load entries from disk
      const diskEntries = await this.loadEntriesFromDisk();
      
      // Sort by priority (FAQ, access count, last accessed)
      diskEntries.sort((a, b) => {
        // FAQs come first
        if (a.metadata?.isFAQ && !b.metadata?.isFAQ) return -1;
        if (!a.metadata?.isFAQ && b.metadata?.isFAQ) return 1;
        
        // Then by access count
        if (a.accessCount !== b.accessCount) {
          return b.accessCount - a.accessCount;
        }
        
        // Then by recency
        return b.lastAccessed - a.lastAccessed;
      });
      
      // Load top N entries into memory cache
      const highPriorityEntries = diskEntries.slice(0, CONFIG.MEMORY_CACHE_SIZE);
      
      for (const entry of highPriorityEntries) {
        const key = this.getKeyFromQuery(this.normalizeQuery(entry.query));
        this.memoryCache.set(key, entry);
        
        // Add to recent keys for LRU tracking
        this.recentKeys.push(key);
      }
      
    } catch (error) {
      console.error('Error preloading high-priority entries:', error);
    }
  }, 'cache_load_time', 'OptimizedAICache.preloadHighPriorityEntries');
  
  /**
   * Build indexes for faster lookup
   */
  private buildIndexes = instrument(async (): Promise<void> => {
    try {
      // Clear existing indexes
      this.queryIndex.clear();
      this.faqIndex.clear();
      this.categoryIndex.clear();
      
      // Get all entries from memory and disk
      const memoryEntries: CacheEntry[] = Array.from(this.memoryCache.values());
      const diskEntries = await this.loadEntriesFromDisk();
      
      // Combine and deduplicate
      const allEntries = [...memoryEntries];
      const memoryKeys = new Set(memoryEntries.map(e => this.getKeyFromQuery(this.normalizeQuery(e.query))));
      
      for (const entry of diskEntries) {
        const key = this.getKeyFromQuery(this.normalizeQuery(entry.query));
        if (!memoryKeys.has(key)) {
          allEntries.push(entry);
        }
      }
      
      // Build indexes
      for (const entry of allEntries) {
        const normalizedQuery = this.normalizeQuery(entry.query);
        const key = this.getKeyFromQuery(normalizedQuery);
        
        // Add to query index
        this.addToQueryIndex(normalizedQuery, key);
        
        // Add to FAQ index if applicable
        if (entry.metadata?.isFAQ && entry.metadata.faqId) {
          this.faqIndex.set(entry.metadata.faqId, entry);
          
          // Add to category index if applicable
          if (entry.metadata.faqCategory) {
            this.addToCategoryIndex(entry.metadata.faqCategory.toLowerCase(), key);
          }
        }
      }
    } catch (error) {
      console.error('Error building indexes:', error);
    }
  }, 'cache_load_time', 'OptimizedAICache.buildIndexes');
  
  /**
   * Find similar keys from the query index
   */
  private findSimilarKeysFromIndex(normalizedQuery: string): string[] {
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
    const candidateKeys = new Set<string>();
    
    // For each word in the query, find keys that contain that word
    for (const word of queryWords) {
      for (const [indexedQuery, keys] of this.queryIndex.entries()) {
        if (indexedQuery.includes(word)) {
          keys.forEach(key => candidateKeys.add(key));
        }
      }
    }
    
    return Array.from(candidateKeys);
  }
  
  /**
   * Add a query to the query index
   */
  private addToQueryIndex(normalizedQuery: string, key: string): void {
    if (!this.queryIndex.has(normalizedQuery)) {
      this.queryIndex.set(normalizedQuery, []);
    }
    
    const keys = this.queryIndex.get(normalizedQuery)!;
    if (!keys.includes(key)) {
      keys.push(key);
    }
  }
  
  /**
   * Add a key to the category index
   */
  private addToCategoryIndex(category: string, key: string): void {
    if (!this.categoryIndex.has(category)) {
      this.categoryIndex.set(category, []);
    }
    
    const keys = this.categoryIndex.get(category)!;
    if (!keys.includes(key)) {
      keys.push(key);
    }
  }
  
  /**
   * Track access to a cache entry (LRU implementation)
   */
  private trackAccess(entry: CacheEntry, key: string): void {
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    // Update LRU list: remove the key if it exists and add it to the end (most recently used)
    const keyIndex = this.recentKeys.indexOf(key);
    if (keyIndex >= 0) {
      this.recentKeys.splice(keyIndex, 1);
    }
    this.recentKeys.push(key);
    
    // We'll periodically save access stats to disk
    this.debounceDiskSave();
  }
  
  /**
   * Update metadata
   */
  private updateMetadata(entry: CacheEntry): void {
    this.metadata.lastUpdated = Date.now();
    
    if (entry.metadata?.isFAQ) {
      this.metadata.faqEntries++;
    } else {
      this.metadata.regularEntries++;
    }
    
    this.metadata.totalEntries = this.metadata.faqEntries + this.metadata.regularEntries;
  }
  
  /**
   * Convert a cache entry to a match result
   */
  private entryToMatch(entry: CacheEntry, similarity: number): CacheMatch {
    return {
      query: entry.query,
      response: entry.response,
      similarity,
      isFAQ: entry.metadata?.isFAQ,
      faqId: entry.metadata?.faqId,
      faqCategory: entry.metadata?.faqCategory,
      source: entry.metadata?.source
    };
  }
  
  /**
   * Get a unique key from a query
   */
  private getKeyFromQuery(normalizedQuery: string): string {
    return `q:${normalizedQuery}`;
  }
  
  /**
   * Normalize a query for consistency
   */
  private normalizeQuery(query: string): string {
    return query.trim().toLowerCase();
  }
  
  /**
   * Calculate similarity between two queries
   */
  private calculateQuerySimilarity(query1: string, query2: string): number {
    // For short queries, Levenshtein works better
    if (query1.length < 10 || query2.length < 10) {
      return calculateLevenshteinSimilarity(query1, query2);
    }
    
    // For longer queries, Jaccard works better
    return calculateJaccardSimilarity(query1, query2);
  }
  
  // Disk operations
  
  /**
   * Save an entry to disk
   */
  private async saveToDisk(entry: CacheEntry): Promise<void> {
    try {
      // Get existing entries
      const entries = await this.loadEntriesFromDisk();
      
      // Find if this entry already exists
      const index = entries.findIndex(e => 
        this.normalizeQuery(e.query) === this.normalizeQuery(entry.query));
      
      if (index >= 0) {
        // Update existing entry
        entries[index] = entry;
      } else {
        // Add new entry
        entries.push(entry);
      }
      
      // Enforce size limit
      if (entries.length > CONFIG.DISK_CACHE_SIZE) {
        // Sort by priority (access count and recency)
        entries.sort((a, b) => {
          if (a.accessCount !== b.accessCount) {
            return b.accessCount - a.accessCount;
          }
          return b.lastAccessed - a.lastAccessed;
        });
        
        // Keep only the top N entries
        entries.splice(CONFIG.DISK_CACHE_SIZE);
      }
      
      // Save to disk
      await AsyncStorage.setItem(KEYS.DISK_CACHE, JSON.stringify(entries));
      
    } catch (error) {
      console.error('Error saving to disk:', error);
    }
  }
  
  /**
   * Load entries from disk
   */
  private async loadEntriesFromDisk(): Promise<CacheEntry[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.DISK_CACHE);
      if (!data) return [];
      
      const parsed = JSON.parse(data) as CacheEntry[];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error loading from disk:', error);
      return [];
    }
  }
  
  /**
   * Load metadata from storage
   */
  private async loadMetadata(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(KEYS.META_INFO);
      if (data) {
        this.metadata = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading metadata:', error);
    }
  }
  
  /**
   * Save metadata to storage
   */
  private async saveMetadata(): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.META_INFO, JSON.stringify(this.metadata));
    } catch (error) {
      console.error('Error saving metadata:', error);
    }
  }
  
  // Debounced operations to prevent excessive disk writes
  
  private metadataSaveTimeout: NodeJS.Timeout | null = null;
  private diskSaveTimeout: NodeJS.Timeout | null = null;
  
  private debounceMetadataSave(): void {
    if (this.metadataSaveTimeout) {
      clearTimeout(this.metadataSaveTimeout);
    }
    
    this.metadataSaveTimeout = setTimeout(() => {
      this.saveMetadata();
    }, 5000);
  }
  
  private debounceDiskSave(): void {
    if (this.diskSaveTimeout) {
      clearTimeout(this.diskSaveTimeout);
    }
    
    this.diskSaveTimeout = setTimeout(() => {
      // Get all entries from memory cache and save them to disk
      const entries = Array.from(this.memoryCache.values());
      for (const entry of entries) {
        this.saveToDisk(entry);
      }
    }, 10000);
  }
  
  // Public API for cache management
  
  /**
   * Clear the cache
   */
  public async clearCache(): Promise<void> {
    try {
      // Clear memory cache
      this.memoryCache.clear();
      this.recentKeys = [];
      
      // Clear indexes
      this.queryIndex.clear();
      this.faqIndex.clear();
      this.categoryIndex.clear();
      
      // Clear disk cache
      await AsyncStorage.removeItem(KEYS.DISK_CACHE);
      
      // Reset metadata
      this.metadata = {
        lastUpdated: Date.now(),
        totalEntries: 0,
        faqEntries: 0,
        regularEntries: 0
      };
      
      await this.saveMetadata();
      
      this.isInitialized = false;
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
  
  /**
   * Refresh the cache (reload from disk and rebuild indexes)
   */
  public async refreshCache(): Promise<void> {
    this.isInitialized = false;
    await this.initialize();
  }
  
  /**
   * Get cache statistics
   */
  public getCacheStats(): any {
    return {
      initialized: this.isInitialized,
      fullyLoaded: this.isFullyLoaded,
      memoryEntries: this.memoryCache.size,
      recentKeys: this.recentKeys.length,
      totalEntries: this.metadata.totalEntries,
      faqEntries: this.metadata.faqEntries,
      lastUpdated: this.metadata.lastUpdated,
      indexes: {
        queries: this.queryIndex.size,
        faqs: this.faqIndex.size,
        categories: this.categoryIndex.size
      }
    };
  }
  
  /**
   * Compress a string using gzip
   */
  private compressString(input: string): { 
    compressed: string, 
    compressionRatio: number 
  } {
    try {
      // Convert string to Buffer/Uint8Array
      const data = new TextEncoder().encode(input);
      
      // Compress data
      const compressed = gzip(data);
      
      // Convert back to string using base64 encoding
      const compressedString = Buffer.from(compressed).toString('base64');
      
      // Calculate compression ratio (compressed size / original size)
      const compressionRatio = compressedString.length / input.length;
      
      return {
        compressed: compressedString,
        compressionRatio
      };
    } catch (error) {
      console.error('Error compressing string:', error);
      return {
        compressed: input,
        compressionRatio: 1.0
      };
    }
  }
  
  /**
   * Decompress an entry with compressed response
   */
  private decompressEntry(entry: CacheEntry): CacheEntry {
    if (!entry.metadata?.compressed) return entry;
    
    try {
      // Get compressed data
      const compressedData = Buffer.from(entry.response, 'base64');
      
      // Decompress
      const decompressedBuffer = ungzip(compressedData);
      
      // Convert back to string
      const decompressedString = new TextDecoder().decode(decompressedBuffer);
      
      // Return copy of entry with decompressed response
      return {
        ...entry,
        response: decompressedString,
        metadata: {
          ...entry.metadata,
          compressed: false
        }
      };
    } catch (error) {
      console.error('Error decompressing entry:', error);
      return entry;
    }
  }
}

export const optimizedAICache = OptimizedAICache.getInstance();
export default optimizedAICache; 