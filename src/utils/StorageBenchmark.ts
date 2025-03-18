import AsyncStorage from '@react-native-async-storage/async-storage';
import { Storage } from '../services/StorageService';

/**
 * Utility for benchmarking storage performance between AsyncStorage and our hybrid solution
 */
export class StorageBenchmark {
  // Test data sizes
  private static readonly SMALL_DATA = { id: 'test', value: 'simple value' };
  private static readonly MEDIUM_DATA = {
    id: 'test',
    user: {
      name: 'Test User',
      email: 'test@example.com',
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'en',
      }
    },
    stats: {
      lastVisit: new Date().toISOString(),
      visitCount: 42,
      features: ['home', 'recycling', 'analytics', 'rewards']
    }
  };
  private static readonly LARGE_DATA = (() => {
    const largeObj: Record<string, any> = {
      id: 'test',
      timestamp: Date.now(),
      items: []
    };
    
    // Generate 1000 items
    for (let i = 0; i < 1000; i++) {
      largeObj.items.push({
        id: `item-${i}`,
        value: `Value for item ${i}`,
        timestamp: Date.now() - i * 1000,
        metadata: {
          type: i % 3 === 0 ? 'type1' : i % 3 === 1 ? 'type2' : 'type3',
          priority: i % 5,
          tags: [`tag${i % 10}`, `tag${(i + 1) % 10}`, `tag${(i + 2) % 10}`]
        }
      });
    }
    
    return largeObj;
  })();
  
  /**
   * Run a benchmark comparing AsyncStorage and MMKV for read/write operations
   */
  public static async runKVStorageBenchmark(): Promise<{
    asyncStorage: {
      writeSmall: number;
      writeMedium: number;
      writeLarge: number;
      readSmall: number;
      readMedium: number;
      readLarge: number;
      delete: number;
    };
    mmkv: {
      writeSmall: number;
      writeMedium: number;
      writeLarge: number;
      readSmall: number;
      readMedium: number;
      readLarge: number;
      delete: number;
    };
  }> {
    const results = {
      asyncStorage: {
        writeSmall: 0,
        writeMedium: 0,
        writeLarge: 0,
        readSmall: 0,
        readMedium: 0,
        readLarge: 0,
        delete: 0
      },
      mmkv: {
        writeSmall: 0,
        writeMedium: 0,
        writeLarge: 0,
        readSmall: 0,
        readMedium: 0,
        readLarge: 0,
        delete: 0
      }
    };
    
    // Prepare data
    const smallStr = JSON.stringify(this.SMALL_DATA);
    const mediumStr = JSON.stringify(this.MEDIUM_DATA);
    const largeStr = JSON.stringify(this.LARGE_DATA);
    
    // --- AsyncStorage Benchmarks ---
    
    // Write small
    let start = performance.now();
    await AsyncStorage.setItem('benchmark-small', smallStr);
    results.asyncStorage.writeSmall = performance.now() - start;
    
    // Write medium
    start = performance.now();
    await AsyncStorage.setItem('benchmark-medium', mediumStr);
    results.asyncStorage.writeMedium = performance.now() - start;
    
    // Write large
    start = performance.now();
    await AsyncStorage.setItem('benchmark-large', largeStr);
    results.asyncStorage.writeLarge = performance.now() - start;
    
    // Read small
    start = performance.now();
    await AsyncStorage.getItem('benchmark-small');
    results.asyncStorage.readSmall = performance.now() - start;
    
    // Read medium
    start = performance.now();
    await AsyncStorage.getItem('benchmark-medium');
    results.asyncStorage.readMedium = performance.now() - start;
    
    // Read large
    start = performance.now();
    await AsyncStorage.getItem('benchmark-large');
    results.asyncStorage.readLarge = performance.now() - start;
    
    // Delete
    start = performance.now();
    await AsyncStorage.multiRemove(['benchmark-small', 'benchmark-medium', 'benchmark-large']);
    results.asyncStorage.delete = performance.now() - start;
    
    // --- MMKV Benchmarks ---
    
    // Write small
    start = performance.now();
    Storage.setString('benchmark-small', smallStr);
    results.mmkv.writeSmall = performance.now() - start;
    
    // Write medium
    start = performance.now();
    Storage.setString('benchmark-medium', mediumStr);
    results.mmkv.writeMedium = performance.now() - start;
    
    // Write large
    start = performance.now();
    Storage.setString('benchmark-large', largeStr);
    results.mmkv.writeLarge = performance.now() - start;
    
    // Read small
    start = performance.now();
    Storage.getString('benchmark-small');
    results.mmkv.readSmall = performance.now() - start;
    
    // Read medium
    start = performance.now();
    Storage.getString('benchmark-medium');
    results.mmkv.readMedium = performance.now() - start;
    
    // Read large
    start = performance.now();
    Storage.getString('benchmark-large');
    results.mmkv.readLarge = performance.now() - start;
    
    // Delete
    start = performance.now();
    Storage.delete('benchmark-small');
    Storage.delete('benchmark-medium');
    Storage.delete('benchmark-large');
    results.mmkv.delete = performance.now() - start;
    
    return results;
  }
  
  /**
   * Run a benchmark for SQLite operations
   */
  public static async runSQLiteBenchmark(): Promise<{
    insert: number;
    query: number;
    complexQuery: number;
    update: number;
    delete: number;
  }> {
    // Initialize SQLite
    await Storage.initSQLite();
    
    const results = {
      insert: 0,
      query: 0,
      complexQuery: 0,
      update: 0,
      delete: 0
    };
    
    // Generate test data - 100 recycling entries
    const testEntries = [];
    const userId = 'benchmark-user';
    const materials = ['plastic-pet', 'aluminum', 'paper', 'glass', 'organic'];
    
    for (let i = 0; i < 100; i++) {
      testEntries.push({
        id: `benchmark-entry-${i}`,
        materialId: materials[i % materials.length],
        weight: Math.random() * 10 + 0.5, // 0.5 to 10.5 kg
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(), // Past days
        status: 'completed',
        userId,
        credits: Math.floor(Math.random() * 50),
        plasticSaved: Math.random() * 5,
        co2Reduced: Math.random() * 15,
        treesEquivalent: Math.random() * 2
      });
    }
    
    // Insert benchmark
    let start = performance.now();
    for (const entry of testEntries) {
      await Storage.addRecyclingEntry(entry);
    }
    results.insert = performance.now() - start;
    
    // Query benchmark
    start = performance.now();
    await Storage.getRecyclingEntriesByUser(userId, 100, 0);
    results.query = performance.now() - start;
    
    // Complex query (stats calculation)
    start = performance.now();
    await Storage.getUserRecyclingStats(userId);
    results.complexQuery = performance.now() - start;
    
    // Update benchmark (not directly available in our API, would require extension)
    results.update = 0; // Placeholder
    
    // Delete benchmark (would require extending the API)
    results.delete = 0; // Placeholder
    
    return results;
  }
  
  /**
   * Format benchmark results as a readable report
   */
  public static formatResults(kvResults: Awaited<ReturnType<typeof this.runKVStorageBenchmark>>, 
                             sqliteResults: Awaited<ReturnType<typeof this.runSQLiteBenchmark>>): string {
    let report = '# EcoCart Storage Benchmark Results\n\n';
    
    // Key-Value Storage Comparison
    report += '## Key-Value Storage (AsyncStorage vs MMKV)\n\n';
    report += '| Operation | AsyncStorage (ms) | MMKV (ms) | Improvement |\n';
    report += '|-----------|------------------|-----------|-------------|\n';
    
    const addKVRow = (operation: string, asyncTime: number, mmkvTime: number) => {
      const improvement = asyncTime > 0 ? `${((asyncTime - mmkvTime) / asyncTime * 100).toFixed(2)}%` : 'N/A';
      report += `| ${operation} | ${asyncTime.toFixed(2)} | ${mmkvTime.toFixed(2)} | ${improvement} |\n`;
    };
    
    addKVRow('Small Write', kvResults.asyncStorage.writeSmall, kvResults.mmkv.writeSmall);
    addKVRow('Medium Write', kvResults.asyncStorage.writeMedium, kvResults.mmkv.writeMedium);
    addKVRow('Large Write', kvResults.asyncStorage.writeLarge, kvResults.mmkv.writeLarge);
    addKVRow('Small Read', kvResults.asyncStorage.readSmall, kvResults.mmkv.readSmall);
    addKVRow('Medium Read', kvResults.asyncStorage.readMedium, kvResults.mmkv.readMedium);
    addKVRow('Large Read', kvResults.asyncStorage.readLarge, kvResults.mmkv.readLarge);
    addKVRow('Delete', kvResults.asyncStorage.delete, kvResults.mmkv.delete);
    
    // SQLite Performance
    report += '\n## SQLite Operations\n\n';
    report += '| Operation | Time (ms) |\n';
    report += '|-----------|----------|\n';
    report += `| Insert 100 Entries | ${sqliteResults.insert.toFixed(2)} |\n`;
    report += `| Query 100 Entries | ${sqliteResults.query.toFixed(2)} |\n`;
    report += `| Complex Stats Query | ${sqliteResults.complexQuery.toFixed(2)} |\n`;
    
    if (sqliteResults.update > 0) {
      report += `| Update | ${sqliteResults.update.toFixed(2)} |\n`;
    }
    
    if (sqliteResults.delete > 0) {
      report += `| Delete | ${sqliteResults.delete.toFixed(2)} |\n`;
    }
    
    // Summary and recommendations
    report += '\n## Summary\n\n';
    
    const avgAsyncTime = (
      kvResults.asyncStorage.writeSmall + 
      kvResults.asyncStorage.writeMedium + 
      kvResults.asyncStorage.writeLarge +
      kvResults.asyncStorage.readSmall +
      kvResults.asyncStorage.readMedium +
      kvResults.asyncStorage.readLarge
    ) / 6;
    
    const avgMMKVTime = (
      kvResults.mmkv.writeSmall + 
      kvResults.mmkv.writeMedium + 
      kvResults.mmkv.writeLarge +
      kvResults.mmkv.readSmall +
      kvResults.mmkv.readMedium +
      kvResults.mmkv.readLarge
    ) / 6;
    
    const overallImprovement = ((avgAsyncTime - avgMMKVTime) / avgAsyncTime * 100).toFixed(2);
    
    report += `- MMKV is on average **${overallImprovement}%** faster than AsyncStorage\n`;
    report += `- Largest improvement seen in ${
      Object.entries(kvResults.asyncStorage)
        .map(([key, value], index) => ({ 
          key, 
          improvement: (value - Object.values(kvResults.mmkv)[index]) / value * 100 
        }))
        .sort((a, b) => b.improvement - a.improvement)[0].key
    } operations\n`;
    
    report += `- SQLite complex queries took ${sqliteResults.complexQuery.toFixed(2)}ms on average\n`;
    
    report += '\n## Recommendations\n\n';
    report += '- Use MMKV for all frequently accessed data\n';
    report += '- Implement caching strategies for complex SQLite queries\n';
    report += '- Consider bulk operations for SQLite where possible\n';
    
    return report;
  }
}

export default StorageBenchmark; 