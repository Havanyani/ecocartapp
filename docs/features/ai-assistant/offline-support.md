# AI Assistant Offline Support

The AI Assistant in EcoCart now includes comprehensive offline support, allowing users to continue interacting with the assistant even when they have no internet connection.

## Overview

Offline support for the AI Assistant ensures that users have uninterrupted access to common sustainability guidance, recycling instructions, and eco-tips, regardless of their network connectivity. This feature enhances the app's utility in areas with poor connectivity and reduces data usage.

## Features

- **Response Caching**: Frequently asked questions and responses are stored locally for offline access
- **Smart Matching**: Uses similarity-based matching to find the most relevant answers to user questions
- **Automatic Cache Population**: Preloaded with common sustainability questions and answers
- **Visual Indicators**: Clear UI indicators show when in offline mode and when responses come from offline cache
- **Seamless Transitions**: Automatically transitions between online and offline modes based on network availability
- **Manual Cache Refresh**: Users can manually refresh the offline cache when online

## Technical Implementation

### Components

1. **AIOfflineCache Service**: Manages the storage and retrieval of cached responses
   - Located at: `src/services/ai/AIOfflineCache.ts`
   - Implements similarity matching algorithm for finding relevant responses
   - Manages caching strategy including TTL (Time-To-Live) and pruning

2. **AIAssistantService Integration**: Extended to support both online and offline operations
   - Located at: `src/services/ai/AIAssistantService.ts` 
   - Detects network state and switches modes accordingly
   - Adds offline message indicators

3. **AIAssistantProvider Updates**: Context provider exposing offline state to components
   - Located at: `src/providers/AIAssistantProvider.tsx`
   - Makes offline status available to consuming components
   - Provides cache refresh functionality

4. **AIAssistantChat UI**: Updated with offline indicators and adaptive UI
   - Located at: `src/components/ai/AIAssistantChat.tsx`
   - Shows offline status in header
   - Marks offline responses with icon indicators
   - Offers a refresh button for cache updates

### Storage and Sync Strategy

- Uses AsyncStorage through the OfflineStorageService for persistent storage
- Caches are automatically pruned based on usage frequency and age
- Less frequently used responses are removed first when cache size limits are reached
- Cache is initialized with common sustainability and recycling questions

## Usage Guidelines

### Offline Response Prioritization

Questions about the following topics have been prioritized for offline support:

1. Basic recycling instructions (paper, plastic, glass, metal)
2. Waste reduction tips
3. Sustainable product information
4. Composting guidance
5. Environmental impact information

### Limitations in Offline Mode

When offline, the assistant cannot:
- Provide personalized user information
- Calculate carbon footprint from purchases
- Access the latest recycling guidelines
- Provide map-based recycling location information
- Upload or analyze images of products

### Handling Network Transitions

- When transitioning to offline mode, a notification message is automatically sent
- Questions that can't be answered offline will receive a message indicating the limitation
- When returning to online mode, full functionality is automatically restored

## Future Enhancements

- [ ] Increase coverage of cached responses
- [ ] Add personalized response caching based on user interaction history
- [ ] Implement more sophisticated query parsing for better matching
- [ ] Add support for offline media (images, diagrams)
- [ ] Optimize cache size management 