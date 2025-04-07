/**
 * AIPerformanceBenchmark.ts
 * 
 * Benchmark utilities for testing and measuring performance of 
 * AI-related components, particularly cache and service performance.
 */

import { faqData } from '@/data/faq-data';
import AIAssistantService from '@/services/ai/AIAssistantService';
import { CacheMatch, OptimizedAICache } from '@/services/ai/OptimizedAICache';
import aiPerformanceMonitor from './AIPerformanceMonitor';

/**
 * Interface for benchmark results
 */
interface BenchmarkResult {
  name: string;
  avgTime: number;
  minTime: number;
  maxTime: number;
  totalRuns: number;
  successRate: number;
  memoryUsage?: number;
  details?: any;
}

/**
 * Class for running performance benchmarks on AI Assistant components
 */
export class AIPerformanceBenchmark {
  private monitor: aiPerformanceMonitor;
  private cache: OptimizedAICache;
  private service: AIAssistantService;
  
  constructor() {
    this.monitor = aiPerformanceMonitor.getInstance();
    this.cache = OptimizedAICache.getInstance();
    this.service = AIAssistantService.getInstance();
  }
  
  /**
   * Run all benchmark tests
   */
  public async runAllBenchmarks(): Promise<BenchmarkResult[]> {
    // Clear existing performance metrics to ensure clean results
    this.monitor.clearMetrics();
    
    // Run all benchmarks
    const results: BenchmarkResult[] = [];
    
    // Cache benchmarks
    results.push(await this.benchmarkCacheInitialization());
    results.push(await this.benchmarkCacheLookup());
    results.push(await this.benchmarkSimilarityCalculation());
    
    // Service benchmarks
    results.push(await this.benchmarkMessageProcessing());
    results.push(await this.benchmarkOfflineResponses());
    
    // UI benchmarks
    results.push(await this.benchmarkRenderTime());
    
    // Memory optimization benchmark
    results.push(await this.benchmarkMemoryOptimization());
    
    return results;
  }
  
  /**
   * Benchmark cache initialization
   */
  public async benchmarkCacheInitialization(): Promise<BenchmarkResult> {
    const startTime = Date.now();
    
    // Clear the cache first to ensure we're testing a full initialization
    await this.cache.clearCache();
    
    // Initialize the cache
    await this.cache.initialize();
    
    // Get all cache load time metrics
    const metrics = this.monitor.getMetricsByType('cache_load_time');
    
    // Calculate results
    const times = metrics.map(m => m.duration);
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    // Get cache stats for details
    const cacheStats = this.cache.getCacheStats();
    
    return {
      name: 'Cache Initialization',
      avgTime,
      minTime,
      maxTime,
      totalRuns: times.length,
      successRate: 1.0, // Initialization should always succeed
      details: {
        cacheStats,
        operations: metrics.map(m => m.operation)
      }
    };
  }
  
  /**
   * Benchmark cache lookup performance
   */
  public async benchmarkCacheLookup(): Promise<BenchmarkResult> {
    // Ensure cache is initialized
    if (!this.cache.getCacheStats().initialized) {
      await this.cache.initialize();
    }
    
    // Prepare test queries - mix of exact matches, similar matches, and misses
    const testQueries = [
      // Exact matches (should be fast)
      'What is EcoCart?',
      'How does the recycling program work?',
      
      // Similar matches (should be reasonably fast)
      'Tell me about EcoCart',
      'Explain the recycling program',
      'How to recycle in the app?',
      
      // FAQ variations
      ...this.getRandomFAQVariations(5),
      
      // Likely misses (should fall back to full scan)
      'What is the airspeed velocity of an unladen swallow?',
      'Tell me about quantum computing',
      'How to make chocolate chip cookies'
    ];
    
    // Clear previous metrics
    this.monitor.clearMetricsByType('cache_lookup');
    
    // Run the benchmark
    const results: Array<{ query: string, match: CacheMatch | null, time: number }> = [];
    
    for (const query of testQueries) {
      const startTime = Date.now();
      const match = await this.cache.findMatch(query);
      const time = Date.now() - startTime;
      
      results.push({ query, match, time });
    }
    
    // Get metrics
    const metrics = this.monitor.getMetricsByType('cache_lookup');
    
    // Calculate statistics
    const times = metrics.map(m => m.duration);
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const successCount = results.filter(r => r.match !== null).length;
    
    return {
      name: 'Cache Lookup',
      avgTime,
      minTime,
      maxTime,
      totalRuns: testQueries.length,
      successRate: successCount / testQueries.length,
      details: {
        hitsVsMisses: {
          hits: successCount,
          misses: testQueries.length - successCount
        },
        sampleResults: results.slice(0, 3) // Include a few sample results
      }
    };
  }
  
  /**
   * Benchmark similarity calculation performance
   */
  public async benchmarkSimilarityCalculation(): Promise<BenchmarkResult> {
    // Clear previous metrics
    this.monitor.clearMetricsByType('similarity_calc');
    
    // We'll rely on the cache lookup to trigger similarity calculations
    await this.benchmarkCacheLookup();
    
    // Get similarity calculation metrics
    const metrics = this.monitor.getMetricsByType('similarity_calc');
    
    // Calculate statistics
    const times = metrics.map(m => m.duration);
    
    if (times.length === 0) {
      return {
        name: 'Similarity Calculation',
        avgTime: 0,
        minTime: 0,
        maxTime: 0,
        totalRuns: 0,
        successRate: 0,
        details: { error: 'No similarity calculations were performed' }
      };
    }
    
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    return {
      name: 'Similarity Calculation',
      avgTime,
      minTime,
      maxTime,
      totalRuns: times.length,
      successRate: 1.0, // Calculations should always complete
      details: {
        calculationsPerLookup: times.length / (metrics.length > 0 ? metrics.length : 1)
      }
    };
  }
  
  /**
   * Benchmark message processing
   */
  public async benchmarkMessageProcessing(): Promise<BenchmarkResult> {
    // Clear previous metrics
    this.monitor.clearMetricsByType('message_processing');
    
    // Test queries
    const testQueries = [
      'What is EcoCart?',
      'How can I reduce my carbon footprint?',
      'Tell me about sustainable shopping',
      'How does the points system work?',
      'What are eco-friendly products?'
    ];
    
    // Process messages
    const results: Array<{ query: string, success: boolean, time: number }> = [];
    
    for (const query of testQueries) {
      try {
        const startTime = Date.now();
        await this.service.sendMessage(query);
        const time = Date.now() - startTime;
        results.push({ query, success: true, time });
      } catch (error) {
        results.push({ query, success: false, time: 0 });
      }
    }
    
    // Get metrics
    const metrics = this.monitor.getMetricsByType('message_processing');
    
    // Calculate statistics
    const times = metrics.map(m => m.duration);
    
    if (times.length === 0) {
      return {
        name: 'Message Processing',
        avgTime: 0,
        minTime: 0,
        maxTime: 0,
        totalRuns: testQueries.length,
        successRate: 0,
        details: { error: 'No message processing metrics were recorded' }
      };
    }
    
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const successCount = results.filter(r => r.success).length;
    
    return {
      name: 'Message Processing',
      avgTime,
      minTime,
      maxTime,
      totalRuns: testQueries.length,
      successRate: successCount / testQueries.length
    };
  }
  
  /**
   * Benchmark offline response generation
   */
  public async benchmarkOfflineResponses(): Promise<BenchmarkResult> {
    // Force the service into offline mode
    const wasOnline = await this.service.isOnline();
    await this.service.setOfflineMode(true);
    
    // Clear previous metrics
    this.monitor.clearMetricsByType('message_processing');
    
    // Test queries - mix of cached and uncached
    const testQueries = [
      // Likely cached
      'What is EcoCart?',
      'How can I reduce my carbon footprint?',
      
      // Likely not exact matches
      'Tell me about eco-friendly products',
      'How do I earn points?',
      'What sustainable brands do you recommend?'
    ];
    
    // Process messages in offline mode
    const results: Array<{ query: string, success: boolean, time: number }> = [];
    
    for (const query of testQueries) {
      try {
        const startTime = Date.now();
        const response = await this.service.sendMessage(query);
        const time = Date.now() - startTime;
        results.push({ 
          query, 
          success: response !== 'I cannot answer this question while offline.',
          time 
        });
      } catch (error) {
        results.push({ query, success: false, time: 0 });
      }
    }
    
    // Restore online status
    await this.service.setOfflineMode(!wasOnline);
    
    // Get metrics
    const metrics = this.monitor.getMetricsByType('message_processing');
    
    // Calculate statistics
    const times = metrics.map(m => m.duration);
    
    if (times.length === 0) {
      return {
        name: 'Offline Responses',
        avgTime: 0,
        minTime: 0,
        maxTime: 0,
        totalRuns: testQueries.length,
        successRate: 0,
        details: { error: 'No offline response metrics were recorded' }
      };
    }
    
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const successCount = results.filter(r => r.success).length;
    
    return {
      name: 'Offline Responses',
      avgTime,
      minTime,
      maxTime,
      totalRuns: testQueries.length,
      successRate: successCount / testQueries.length
    };
  }
  
  /**
   * Benchmark render time for chat interface
   */
  public async benchmarkRenderTime(): Promise<BenchmarkResult> {
    // Get render time metrics
    const metrics = this.monitor.getMetricsByType('render_time');
    
    // If there are no metrics, we can't benchmark render time
    if (metrics.length === 0) {
      return {
        name: 'UI Render Time',
        avgTime: 0,
        minTime: 0,
        maxTime: 0,
        totalRuns: 0,
        successRate: 0,
        details: { error: 'No render time metrics have been collected' }
      };
    }
    
    // Calculate statistics
    const times = metrics.map(m => m.duration);
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    return {
      name: 'UI Render Time',
      avgTime,
      minTime,
      maxTime,
      totalRuns: times.length,
      successRate: 1.0,
      details: {
        components: metrics.map(m => m.operation).filter((v, i, a) => a.indexOf(v) === i)
      }
    };
  }
  
  /**
   * Benchmark memory optimization features like compression and lazy loading
   */
  public async benchmarkMemoryOptimization(): Promise<BenchmarkResult> {
    // Ensure cache is initialized
    if (!this.cache.getCacheStats().initialized) {
      await this.cache.initialize();
    }
    
    // Generate a set of very large responses for testing compression
    const largeTestData = [];
    for (let i = 0; i < 10; i++) {
      // Generate a long query and response
      const query = `Long query about sustainability topic ${i} with additional context to make it longer for testing compression algorithms in our memory optimization benchmark. We need to make sure this is sufficiently long to trigger compression.`;
      
      // Create a long response that will definitely trigger compression
      let longResponse = `This is a very long response about eco-sustainability topic ${i}. `;
      // Repeat to make it longer (approximately 2KB)
      for (let j = 0; j < 20; j++) {
        longResponse += `Paragraph ${j} with details about sustainability, recycling, and eco-friendly practices. `;
        longResponse += `It contains information about carbon footprints, renewable energy, waste reduction, and sustainable living. `;
        longResponse += `This helps test our compression algorithms by providing a sufficiently large text corpus. `;
      }
      
      largeTestData.push({
        query,
        response: longResponse
      });
    }
    
    // Test saving with compression
    const saveStartTime = Date.now();
    for (const item of largeTestData) {
      await this.cache.saveResponse(item.query, item.response, {
        source: 'Benchmark',
        tags: ['test', 'compression']
      });
    }
    const saveEndTime = Date.now();
    
    // Get cache stats after saving
    const cacheStatsAfterSave = this.cache.getCacheStats();
    
    // Test retrieving and decompressing
    const retrieveStartTime = Date.now();
    const retrieveResults = [];
    for (const item of largeTestData) {
      const match = await this.cache.findMatch(item.query);
      retrieveResults.push({
        query: item.query,
        originalLength: item.response.length,
        retrievedLength: match?.response.length || 0,
        retrieveSuccess: match !== null,
        isExactMatch: match && match.similarity === 1.0
      });
    }
    const retrieveEndTime = Date.now();
    
    // Calculate metrics
    const saveTime = saveEndTime - saveStartTime;
    const retrieveTime = retrieveEndTime - retrieveStartTime;
    const avgSaveTime = saveTime / largeTestData.length;
    const avgRetrieveTime = retrieveTime / largeTestData.length;
    
    // Memory usage
    const memoryUsage = process.memoryUsage?.() || { heapUsed: 0 };
    const memoryUsageMB = memoryUsage.heapUsed / (1024 * 1024);
    
    // Calculate compression stats
    const successfulRetrievals = retrieveResults.filter(r => r.retrieveSuccess);
    const retrieveSuccessRate = successfulRetrievals.length / retrieveResults.length;
    
    return {
      name: 'Memory Optimization',
      avgTime: (avgSaveTime + avgRetrieveTime) / 2,
      minTime: Math.min(avgSaveTime, avgRetrieveTime),
      maxTime: Math.max(avgSaveTime, avgRetrieveTime),
      totalRuns: largeTestData.length * 2, // Save + retrieve
      successRate: retrieveSuccessRate,
      memoryUsage: memoryUsageMB,
      details: {
        compressionStats: {
          averageSaveTime: avgSaveTime,
          averageRetrieveTime: avgRetrieveTime,
          totalResponseSize: largeTestData.reduce((sum, item) => sum + item.response.length, 0),
          cacheStatsAfterSave
        },
        retrieveResults: retrieveResults.slice(0, 3) // Include a few sample results
      }
    };
  }
  
  /**
   * Generate variations of FAQ questions for testing
   */
  private getRandomFAQVariations(count: number): string[] {
    const variations: string[] = [];
    const selectedFAQs = [...faqData].sort(() => 0.5 - Math.random()).slice(0, count);
    
    for (const faq of selectedFAQs) {
      // Generate a variation on the question
      const question = faq.question;
      const words = question.split(' ');
      
      if (words.length > 3) {
        // Randomly modify the question by:
        // 1. Changing word order
        // 2. Adding/removing words
        // 3. Misspelling words
        
        const modificationTypes = ['reorder', 'add', 'remove', 'misspell'];
        const modificationType = modificationTypes[Math.floor(Math.random() * modificationTypes.length)];
        
        let variation = question;
        
        switch (modificationType) {
          case 'reorder':
            // Swap two words
            if (words.length > 3) {
              const idx1 = 1 + Math.floor(Math.random() * (words.length - 2));
              const idx2 = 1 + Math.floor(Math.random() * (words.length - 2));
              const newWords = [...words];
              [newWords[idx1], newWords[idx2]] = [newWords[idx2], newWords[idx1]];
              variation = newWords.join(' ');
            }
            break;
            
          case 'add':
            // Add a word
            {
              const fillerWords = ['really', 'actually', 'basically', 'literally', 'seriously'];
              const wordToAdd = fillerWords[Math.floor(Math.random() * fillerWords.length)];
              const position = 1 + Math.floor(Math.random() * (words.length - 1));
              const newWords = [...words];
              newWords.splice(position, 0, wordToAdd);
              variation = newWords.join(' ');
            }
            break;
            
          case 'remove':
            // Remove a non-essential word
            if (words.length > 4) {
              const position = 1 + Math.floor(Math.random() * (words.length - 2));
              const newWords = [...words];
              newWords.splice(position, 1);
              variation = newWords.join(' ');
            }
            break;
            
          case 'misspell':
            // Misspell a word
            {
              const position = 1 + Math.floor(Math.random() * (words.length - 2));
              const word = words[position];
              if (word.length > 3) {
                const chars = word.split('');
                const idx1 = Math.floor(Math.random() * (chars.length - 1));
                const idx2 = idx1 + 1;
                [chars[idx1], chars[idx2]] = [chars[idx2], chars[idx1]];
                const misspelled = chars.join('');
                const newWords = [...words];
                newWords[position] = misspelled;
                variation = newWords.join(' ');
              }
            }
            break;
        }
        
        variations.push(variation);
      } else {
        // For short questions, just add a prefix
        const prefixes = ['Tell me ', 'I want to know ', 'Can you explain ', 'Help me understand '];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        variations.push(prefix + question.toLowerCase());
      }
    }
    
    return variations;
  }
  
  /**
   * Format benchmark results as a markdown table
   */
  public formatResultsAsMarkdown(results: BenchmarkResult[]): string {
    let markdown = '# AI Performance Benchmark Results\n\n';
    
    // Summary table
    markdown += '## Summary\n\n';
    markdown += '| Test | Avg Time (ms) | Min Time (ms) | Max Time (ms) | Success Rate |\n';
    markdown += '|------|--------------|--------------|--------------|-------------|\n';
    
    for (const result of results) {
      markdown += `| ${result.name} | ${result.avgTime.toFixed(2)} | ${result.minTime.toFixed(2)} | ${result.maxTime.toFixed(2)} | ${(result.successRate * 100).toFixed(0)}% |\n`;
    }
    
    // Details for each test
    markdown += '\n## Details\n\n';
    
    for (const result of results) {
      markdown += `### ${result.name}\n\n`;
      markdown += `- **Average Time**: ${result.avgTime.toFixed(2)} ms\n`;
      markdown += `- **Min Time**: ${result.minTime.toFixed(2)} ms\n`;
      markdown += `- **Max Time**: ${result.maxTime.toFixed(2)} ms\n`;
      markdown += `- **Total Runs**: ${result.totalRuns}\n`;
      markdown += `- **Success Rate**: ${(result.successRate * 100).toFixed(0)}%\n`;
      
      if (result.details) {
        markdown += `- **Additional Details**: ${JSON.stringify(result.details, null, 2)}\n`;
      }
      
      markdown += '\n';
    }
    
    return markdown;
  }
} 