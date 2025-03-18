# AI Assistant Offline Integration Plan

## Overview

This document outlines the implementation plan for integrating the AI Assistant feature with EcoCart's offline support system. The goal is to enable users to interact with the AI Assistant even when they have limited or no internet connectivity.

## Background

EcoCart's offline support system currently provides:
- Local storage of user data
- Automated synchronization when back online
- Conflict resolution for data changes made offline

The AI Assistant feature currently requires an active internet connection for most functionality, making it unavailable when users are offline.

## Requirements

1. **Essential AI functionality when offline:**
   - Access to previously asked common questions and answers
   - Basic sustainability tips and information
   - Recycling guidelines for common materials

2. **Seamless transition between online and offline modes:**
   - Clear indication of offline status
   - Automatic switching to offline mode when connectivity is lost
   - Persistence of conversation history

3. **Data synchronization:**
   - Sync conversation history when back online
   - Handle any conflicts between online and offline interactions
   - Prioritize server-side responses over cached responses

## Technical Approach

### 1. Offline Response Cache

Implement a caching mechanism for common queries and responses:

```typescript
interface CachedResponse {
  query: string;  // The user's question
  response: string;  // The AI's response
  similarity: number;  // Match confidence score (0-1)
  timestamp: number;  // When the response was cached
  category: string;  // Content category (recycling, eco-tips, etc.)
}

class AIOfflineCache {
  private cache: CachedResponse[] = [];
  private db: IDBDatabase;
  
  // Initialize IndexedDB
  async initialize() {
    // Set up IndexedDB for persistent storage
  }
  
  // Add a response to the cache
  async cacheResponse(query: string, response: string, category: string) {
    const newEntry: CachedResponse = {
      query,
      response,
      similarity: 1.0,  // Exact match
      timestamp: Date.now(),
      category
    };
    
    this.cache.push(newEntry);
    await this.persistToIndexedDB(newEntry);
  }
  
  // Find the best response for a query when offline
  findOfflineResponse(query: string, minSimilarity = 0.7): CachedResponse | null {
    // Use text similarity algorithm to find best match
    // Return null if no match above minSimilarity
  }
}
```

### 2. Integration with AIAssistantService

Modify the existing `AIAssistantService` to support offline mode:

```typescript
// In AIAssistantService.ts

private offlineCache: AIOfflineCache;
private networkStatus: 'online' | 'offline' = 'online';

constructor(config: AIAssistantConfig) {
  // Existing initialization
  
  // Initialize offline cache
  this.offlineCache = new AIOfflineCache();
  this.offlineCache.initialize();
  
  // Listen for network status changes
  window.addEventListener('online', this.handleNetworkChange);
  window.addEventListener('offline', this.handleNetworkChange);
}

private handleNetworkChange = () => {
  this.networkStatus = navigator.onLine ? 'online' : 'offline';
  // Notify listeners of status change
  this.notifyNetworkStatusChange();
}

public async sendMessage(content: string): Promise<AIMessage> {
  // Add user message to history
  const userMessage = this.addUserMessage(content);
  
  try {
    this.state.isProcessing = true;
    
    let response: string;
    
    if (this.networkStatus === 'online') {
      // Online mode - use real AI service
      response = await this.getAIResponse(content);
      
      // Cache the response for offline use
      this.offlineCache.cacheResponse(content, response, this.detectCategory(content));
    } else {
      // Offline mode - use cached responses
      const cachedResponse = this.offlineCache.findOfflineResponse(content);
      
      if (cachedResponse) {
        response = cachedResponse.response;
      } else {
        response = "I'm sorry, I don't have an answer for that question while offline. Please try again when you're back online.";
      }
    }
    
    // Add AI response to history
    const aiMessage = this.addSystemMessage(response);
    
    this.state.isProcessing = false;
    return aiMessage;
  } catch (error) {
    this.state.isProcessing = false;
    this.state.error = error instanceof Error ? error : new Error(String(error));
    throw error;
  }
}
```

### 3. Pre-caching Common Responses

Implement a system to pre-cache common sustainability questions and answers:

```typescript
// Initial data seeding for offline cache
async function seedOfflineCache(cache: AIOfflineCache) {
  const commonQuestions = [
    {
      query: "How do I recycle plastic bottles?",
      response: "Rinse plastic bottles, remove caps, and place them in your recycling bin. Check the recycling number on the bottom to ensure it's accepted in your local program.",
      category: "recycling"
    },
    {
      query: "What are some tips to reduce waste?",
      response: "Use reusable bags, bottles, and containers. Buy in bulk to reduce packaging. Compost food scraps. Repair items instead of replacing them.",
      category: "eco-tips"
    },
    // Add more common questions and answers
  ];
  
  for (const item of commonQuestions) {
    await cache.cacheResponse(item.query, item.response, item.category);
  }
}
```

### 4. UI Modifications

Update the AI Assistant UI to indicate offline status:

```tsx
// In AIAssistantChat.tsx

// Add offline status indicator
const renderOfflineIndicator = () => {
  if (networkStatus === 'offline') {
    return (
      <View style={styles.offlineIndicator}>
        <Ionicons name="cloud-offline" size={16} color="#FFFFFF" />
        <Text style={styles.offlineText}>Offline Mode</Text>
      </View>
    );
  }
  return null;
};

// Modify input placeholder based on network status
const getInputPlaceholder = () => {
  return networkStatus === 'online' 
    ? "Ask something about sustainability..." 
    : "Offline mode - limited responses available";
};
```

### 5. Integration with OfflineStorageProvider

Connect with the existing OfflineStorageProvider:

```typescript
// In AIAssistantProvider.tsx

import { useOfflineStorage } from '@/providers/OfflineStorageProvider';

export function AIAssistantProvider({ children, config }: AIAssistantProviderProps) {
  const [service] = useState(() => AIAssistantService.getInstance(config));
  const [state, setState] = useState<AIAssistantState>(service.getState());
  const { isOnline, registerSync } = useOfflineStorage();
  
  // Register for offline sync events
  useEffect(() => {
    registerSync('ai-assistant-history', async () => {
      // Sync logic for conversation history
      return true; // Sync successful
    });
  }, [registerSync]);
  
  // Update service with network status
  useEffect(() => {
    service.updateNetworkStatus(isOnline ? 'online' : 'offline');
  }, [isOnline, service]);
  
  // Rest of provider implementation
}
```

## Implementation Phases

### Phase 1: Offline Cache System (Week 1-2)
- Implement the `AIOfflineCache` class
- Set up IndexedDB for persistent storage
- Create text similarity algorithm for matching queries

### Phase 2: AIAssistantService Integration (Week 3)
- Modify `AIAssistantService` to support offline mode
- Implement network status detection and handling
- Add category detection for queries

### Phase 3: UI Updates (Week 4)
- Add offline status indicators to the AI Assistant UI
- Update input placeholder and messaging
- Implement visual cues for cached vs. real-time responses

### Phase 4: Data Seeding and Testing (Week 5)
- Create initial dataset of common questions and answers
- Implement seed function for offline cache
- Test offline functionality across devices
- Verify synchronization when returning online

### Phase 5: OfflineStorageProvider Integration (Week 6)
- Connect with the existing OfflineStorageProvider
- Implement conversation history synchronization
- Test conflict resolution for offline interactions

## Metrics for Success

1. **Offline Response Rate:**
   - Target: >80% of common sustainability questions answerable offline
   - Measurement: Track percentage of offline queries that receive meaningful responses

2. **Response Accuracy:**
   - Target: >90% accuracy for cached responses
   - Measurement: User feedback on response quality

3. **Cache Size:**
   - Target: <5MB for pre-cached responses
   - Measurement: Monitor storage usage across devices

4. **Sync Performance:**
   - Target: <500ms to synchronize conversation history when back online
   - Measurement: Time tracking during sync operations

## Testing Strategy

1. **Unit Tests:**
   - Test offline cache matching algorithm
   - Test network status detection
   - Test IndexedDB persistence

2. **Integration Tests:**
   - Test AIAssistantService with offline cache
   - Test synchronization with OfflineStorageProvider
   - Test conflict resolution

3. **End-to-End Tests:**
   - Simulate offline scenarios with network disconnection
   - Test transition between online and offline states
   - Verify conversation persistence across sessions

## Rollout Plan

1. **Internal Testing:**
   - Release to development team for initial testing
   - Gather feedback on offline response quality

2. **Beta Testing:**
   - Release to select users for beta testing
   - Monitor offline usage patterns
   - Gather feedback on offline experience

3. **Phased Rollout:**
   - 10% of users in first week
   - 50% of users in second week
   - Full release in third week

4. **Monitoring and Iteration:**
   - Track offline usage metrics
   - Improve response cache based on user queries
   - Optimize synchronization based on performance data

## Conclusion

By implementing this plan, we will extend the AI Assistant feature to work effectively in offline scenarios, ensuring that users have access to sustainability information and assistance regardless of their connectivity status. The integration with EcoCart's existing offline support system will provide a seamless experience and maintain data consistency across online and offline modes. 