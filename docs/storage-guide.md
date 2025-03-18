# EcoCart Hybrid Storage Guide

This guide explains how to use the hybrid storage implementation in EcoCart, which combines MMKV for fast key-value storage and SQLite for complex relational data.

## Overview

The hybrid approach leverages the strengths of both storage systems:

- **MMKV**: Ultra-fast key-value storage for simple data and preferences
- **SQLite**: Powerful relational database for complex data structures and queries

## Setup and Installation

1. **Install Dependencies**

```bash
npm install react-native-mmkv react-native-sqlite-storage @types/react-native-sqlite-storage
```

2. **Import the Storage Service**

```typescript
import { Storage } from './services/StorageService';
```

## Using MMKV Storage

MMKV is best for preferences, session data, and simple objects.

### Storing Primitive Values

```typescript
// Store string values
Storage.setString('username', 'ecouser');

// Store boolean values
Storage.setBoolean('darkMode', true);

// Store number values
Storage.setNumber('lastVisitTimestamp', Date.now());
```

### Retrieving Primitive Values

```typescript
// Get string with optional default
const username = Storage.getString('username') || 'Guest';

// Get boolean
const isDarkMode = Storage.getBoolean('darkMode');

// Get number
const lastVisit = Storage.getNumber('lastVisitTimestamp');
```

### Storing Objects

```typescript
// Store user preferences
Storage.setObject('userPreferences', {
  theme: 'dark',
  notificationsEnabled: true,
  language: 'en',
  syncFrequency: 'daily'
});

// Store app state
Storage.setObject('appState', {
  currentScreen: 'Home',
  lastUpdated: Date.now(),
  unseenNotifications: 5
});
```

### Retrieving Objects

```typescript
// Get object with typings
const prefs = Storage.getObject<{
  theme: string;
  notificationsEnabled: boolean;
  language: string;
}>('userPreferences');

// Access properties safely
if (prefs?.notificationsEnabled) {
  // Show notifications
}
```

### Deleting and Clearing Data

```typescript
// Delete specific key
Storage.delete('tempAuthToken');

// Clear all MMKV storage
Storage.clearMMKV();
```

## Using SQLite Storage

SQLite is best for complex data structures, large datasets, and relational data.

### Initializing Database

Always initialize SQLite before using it:

```typescript
// In your app initialization
useEffect(() => {
  const initStorage = async () => {
    try {
      await Storage.initSQLite();
      console.log('SQLite initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SQLite:', error);
    }
  };
  
  initStorage();
  
  // Clean up on unmount
  return () => {
    Storage.close();
  };
}, []);
```

### Working with Recycling Entries

```typescript
// Add a recycling entry
await Storage.addRecyclingEntry({
  id: 'entry-123',
  materialId: 'plastic-pet',
  weight: 2.5,
  date: new Date().toISOString(),
  status: 'completed',
  userId: 'user-456',
  credits: 25,
  plasticSaved: 2.5,
  co2Reduced: 5.2,
  treesEquivalent: 0.3
});

// Get user recycling entries
const entries = await Storage.getRecyclingEntriesByUser('user-456', 20, 0);

// Get user recycling stats
const stats = await Storage.getUserRecyclingStats('user-456');
console.log(`Total recycled: ${stats.totalWeight.toFixed(2)} kg`);
```

### Working with Materials

```typescript
// Add a material
await Storage.addMaterial({
  id: 'aluminum-can',
  name: 'Aluminum Can',
  category: 'Metal',
  pointsPerKg: 15,
  description: 'Recyclable aluminum beverage containers',
  imageUrl: 'https://example.com/aluminum.jpg',
  recyclingTips: 'Rinse before recycling'
});

// Get all materials
const materials = await Storage.getAllMaterials();
```

## Hybrid Usage Patterns

### Caching SQLite Data in MMKV

Improve performance by caching frequently accessed data:

```typescript
// Get materials with caching
const getMaterials = async () => {
  // Try to get from MMKV cache first
  const cached = Storage.getObject<any[]>('cached_materials');
  const cacheTimestamp = Storage.getNumber('materials_cache_timestamp') || 0;
  const now = Date.now();
  
  // Use cache if it's fresh (less than 1 hour old)
  if (cached && now - cacheTimestamp < 3600000) {
    return cached;
  }
  
  // Otherwise fetch from SQLite
  const materials = await Storage.getAllMaterials();
  
  // Update cache
  Storage.setObject('cached_materials', materials);
  Storage.setNumber('materials_cache_timestamp', now);
  
  return materials;
};
```

### Using Both Storage Systems Together

```typescript
// Example: User profile with preferences and history
const getUserProfile = async (userId: string) => {
  // Get basic info and preferences from MMKV (fast)
  const basicInfo = Storage.getObject<{
    id: string;
    name: string;
    email: string;
  }>('user_profile') || { id: userId, name: '', email: '' };
  
  const preferences = Storage.getObject<Record<string, any>>('user_preferences') || {};
  
  // Get recycling history from SQLite (relational)
  const recyclingHistory = await Storage.getRecyclingEntriesByUser(userId, 5, 0);
  const recyclingStats = await Storage.getUserRecyclingStats(userId);
  
  // Combine the data
  return {
    ...basicInfo,
    preferences,
    recyclingHistory,
    stats: recyclingStats
  };
};
```

## Performance Considerations

1. **MMKV is extremely fast** - use it for data you need to access frequently
2. **SQLite operations are asynchronous** - always use `await` when calling SQLite methods
3. **Avoid unnecessary SQLite queries** - use caching for repeated read operations
4. **Use transactions for bulk updates** to SQLite
5. **Be mindful of data duplication** between MMKV and SQLite

## Error Handling

Always wrap storage operations in try/catch blocks:

```typescript
try {
  await Storage.addRecyclingEntry({
    // entry details
  });
} catch (error) {
  console.error('Failed to add recycling entry:', error);
  // Show error to user or retry logic
}
```

## Debugging

To debug storage issues:

1. **For MMKV issues**: Check the stored values by logging them:

```typescript
const allPrefs = Storage.getObject<Record<string, any>>('user_preferences');
console.log('Current preferences:', allPrefs);
```

2. **For SQLite issues**: SQLite errors are descriptive and will be logged in the catch blocks.

## Migration from AsyncStorage

To migrate existing AsyncStorage data:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const migrateFromAsyncStorage = async () => {
  try {
    // Get keys from AsyncStorage
    const keys = await AsyncStorage.getAllKeys();
    
    // Filter keys that should be migrated
    const keysToMigrate = keys.filter(key => 
      key.startsWith('user_') || 
      key.startsWith('settings_') || 
      key.startsWith('app_')
    );
    
    // Migrate each key
    for (const key of keysToMigrate) {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        try {
          // Try to parse as JSON
          const parsedValue = JSON.parse(value);
          Storage.setObject(key, parsedValue);
        } catch {
          // If not JSON, store as string
          Storage.setString(key, value);
        }
        
        // Remove from AsyncStorage after migration
        await AsyncStorage.removeItem(key);
      }
    }
    
    console.log(`Migrated ${keysToMigrate.length} keys from AsyncStorage`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
};
```

## Best Practices

1. **Keep MMKV data small** - large objects hurt performance
2. **Use SQLite for data relationships** - joins are powerful
3. **Prefer MMKV for app settings and session state**
4. **Prefer SQLite for historical and analytics data**
5. **Create clear boundaries** between what goes in each storage type
6. **Consider encryption** for sensitive data in both systems
7. **Document your storage schemas** for team consistency 