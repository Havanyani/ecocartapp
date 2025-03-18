# FAQ Integration with AI Assistant

## Overview

The EcoCart AI Assistant has been enhanced with FAQ integration, allowing it to provide accurate and consistent answers to common questions about EcoCart's features and services. This integration ensures that users receive official information about the app's functionality while still benefiting from the AI's conversational capabilities.

## Implementation Details

The FAQ integration has been implemented with several key components:

### 1. FAQ Data Source

The FAQ database is stored in `src/data/faq-data.ts` and includes:

- Structured FAQ items with categories, questions, and answers
- Helper functions for searching and filtering FAQs
- Support for 8 different FAQ categories (Account, Shopping, Recycling, Carbon Offsets, App Features, Payments, Sustainability, Rewards)

### 2. Offline Cache Integration

The `AIOfflineCache` service has been enhanced to:

- Cache all FAQs for offline access
- Prioritize FAQ matches over regular cached responses
- Tag responses as coming from the FAQ database for UI indicators
- Use higher similarity thresholds for FAQ matching to ensure accuracy

### 3. AI Service Enhancement

The `AIServiceAdapter` implementations now:

- Include relevant FAQ content in the system prompt for real AI services
- Allow the AI to reference official EcoCart information
- Maintain consistent answers between online and offline modes

### 4. User Interface Enhancements

The chat interface now:

- Displays an FAQ indicator icon for responses sourced from the FAQ database
- Includes a source attribution text for FAQ responses
- Suggests relevant FAQ questions as quick queries
- Prioritizes FAQ categories based on popularity

## How It Works

1. **Prioritized Matching**: When a user sends a message, the system first checks if it matches an FAQ before trying other response methods.

2. **Similarity-Based Matching**: The system uses a Jaccard similarity algorithm to find the closest matching FAQ question.

3. **Visual Indicators**: Responses from the FAQ database are clearly marked with an icon and attribution.

4. **Offline Support**: All FAQs are available offline, ensuring users can get answers to common questions even without internet connectivity.

5. **AI Enhancement**: When online, the AI service is provided with selected FAQs in its system prompt to ensure consistent answers across both sources.

## Usage

### For Users

Users don't need to do anything special to access FAQs - they can simply ask questions naturally:

- "How do I earn reward points?"
- "What payment methods do you accept?"
- "How accurate is the recycling information?"

### For Developers

Developers can access FAQ functionality programmatically:

```typescript
// Search FAQs directly
const results = aiAssistantService.searchFAQs("reward points");

// Get FAQs by category
import { getFAQsByCategory } from '@/data/faq-data';
const accountFAQs = getFAQsByCategory("Account");

// Force reload of FAQ data into the cache
await aiAssistantService.refreshOfflineCache();
```

## Maintenance and Updates

To update the FAQ database:

1. Edit the `faqData` array in `src/data/faq-data.ts`
2. Add new FAQ items following the existing structure:

```typescript
{
  id: 'unique-id',
  question: 'What is the question?',
  answer: 'This is the answer to the question.',
  category: 'Category'
}
```

3. Force a refresh of the offline cache to ensure users get the latest FAQs:
   - This happens automatically on app restart
   - Users can manually refresh via the refresh button in offline mode
   - Developers can call `aiAssistantService.refreshOfflineCache()`

## Benefits

1. **Consistency**: Ensures users receive accurate and approved information about EcoCart features.

2. **Offline Access**: Makes all FAQ content available without internet connectivity.

3. **AI Enhancement**: Improves AI responses by incorporating official information in its knowledge base.

4. **User Experience**: Visual indicators help users distinguish between AI-generated responses and official FAQ content.

5. **Maintainability**: Centralized FAQ database makes updates easy and consistent across the app.

## Future Enhancements

Planned enhancements for the FAQ integration include:

1. FAQ content management system for easier updates
2. Analytics to track popular FAQ queries
3. Automatic suggestion of related FAQs based on conversation context
4. Enhanced visual presentation of structured FAQ content (tables, lists, etc.)
5. Personalized FAQ suggestions based on user behavior and preferences 