# AIAssistantService API Documentation

## Overview

`AIAssistantService` is a singleton service that provides AI assistant functionality to the EcoCart application. It manages conversation state, handles message sending/receiving, and maintains context for personalized interactions.

## Import

```typescript
import AIAssistantService, { 
  AIMessage, 
  AIAssistantState, 
  AIAssistantConfig 
} from '@/services/ai/AIAssistantService';
```

## Core Interfaces

### AIMessage

Represents a single message in the conversation between the user and the AI.

```typescript
export interface AIMessage {
  id: string;              // Unique identifier for the message
  content: string;         // Text content of the message
  timestamp: Date;         // When the message was sent/received
  isUser: boolean;         // Whether the message is from the user (true) or AI (false)
  attachments?: {          // Optional attachments to the message
    type: 'image' | 'location' | 'product';
    url?: string;
    data?: any;
  }[];
}
```

### AIAssistantState

Represents the current state of the AI assistant.

```typescript
export interface AIAssistantState {
  messages: AIMessage[];   // All messages in the conversation history
  isProcessing: boolean;   // Whether the AI is currently processing a message
  error: Error | null;     // Any error that occurred during processing
  context: {               // Context data for the conversation
    recentTopics: string[];
    userPreferences: Record<string, any>;
    conversationId?: string;
  };
}
```

### AIAssistantConfig

Configuration options for the AI assistant.

```typescript
export interface AIAssistantConfig {
  apiEndpoint?: string;          // Endpoint for the AI service
  apiKey?: string;               // API key for the AI service
  useLocalProcessing?: boolean;  // Whether to use on-device processing
  maxHistoryLength?: number;     // Maximum number of messages to keep in history
  defaultGreeting?: string;      // Default greeting message
  suggestionCategories?: string[]; // Categories for suggested questions
}
```

## Methods

### getInstance(config?: AIAssistantConfig): AIAssistantService

Returns the singleton instance of the AI assistant service, optionally with configuration.

```typescript
// Get default instance
const aiService = AIAssistantService.getInstance();

// Get instance with custom configuration
const customAIService = AIAssistantService.getInstance({
  apiEndpoint: 'https://custom-ai-endpoint.com/api',
  maxHistoryLength: 100,
  defaultGreeting: 'Hello! How can I help you with recycling today?'
});
```

### getState(): AIAssistantState

Returns the current state of the AI assistant.

```typescript
const state = aiService.getState();
console.log(`Number of messages: ${state.messages.length}`);
console.log(`Is processing: ${state.isProcessing}`);
```

### sendMessage(content: string): Promise<AIMessage>

Sends a message to the AI assistant and returns a promise that resolves to the AI's response.

```typescript
try {
  const response = await aiService.sendMessage('How do I recycle plastic bottles?');
  console.log(`AI response: ${response.content}`);
} catch (error) {
  console.error('Error sending message:', error);
}
```

### addUserMessage(content: string): AIMessage

Adds a user message to the history without triggering an AI response.

```typescript
const message = aiService.addUserMessage('This is a user message');
console.log(`Added message with ID: ${message.id}`);
```

### addSystemMessage(content: string): AIMessage

Adds a system message to the history.

```typescript
const message = aiService.addSystemMessage('This is a system message');
console.log(`Added system message with ID: ${message.id}`);
```

### clearHistory(): void

Clears the conversation history.

```typescript
aiService.clearHistory();
```

### getSuggestedQuestions(): string[]

Gets suggested questions based on the conversation context.

```typescript
const suggestions = aiService.getSuggestedQuestions();
console.log(`Suggested questions: ${suggestions.join(', ')}`);
```

## Usage Examples

### Basic Usage

```typescript
// Get the service instance
const aiService = AIAssistantService.getInstance();

// Send a message and get a response
async function getEcoTip() {
  try {
    const response = await aiService.sendMessage('Give me a tip for reducing plastic waste');
    return response.content;
  } catch (error) {
    console.error('Error getting eco tip:', error);
    return 'Sorry, I could not provide a tip at this time.';
  }
}
```

### Custom Configuration

```typescript
// Configure the service with custom settings
const aiService = AIAssistantService.getInstance({
  maxHistoryLength: 50,
  defaultGreeting: 'Hi! I\'m your EcoCart sustainability assistant. How can I help you today?',
  useLocalProcessing: true  // Use on-device processing when available
});

// Get the greeting message
const state = aiService.getState();
const greeting = state.messages[0]?.content;
```

### Error Handling

```typescript
async function askAboutRecycling(item: string) {
  try {
    const response = await aiService.sendMessage(`How do I recycle ${item}?`);
    return response.content;
  } catch (error) {
    // Check the error from the state
    const state = aiService.getState();
    if (state.error) {
      console.error('Error from AI assistant:', state.error.message);
    }
    
    // Return a fallback response
    return `I'm sorry, I couldn't get information about recycling ${item}. Please try again later.`;
  }
}
```

## Integration with React Components

The service is typically used with the `AIAssistantProvider` React context provider:

```typescript
import { AIAssistantProvider } from '@/providers/AIAssistantProvider';

function App() {
  return (
    <AIAssistantProvider>
      {/* Your app components */}
    </AIAssistantProvider>
  );
}
```

## Current Limitations

- The service currently uses mock responses instead of actual AI integration
- No persistent storage for conversation history between app sessions
- Limited context tracking capabilities

## Future Enhancements

- Integration with actual AI services (OpenAI, TensorFlow.js)
- Offline support for basic queries
- Persistent conversation storage
- Enhanced context tracking
- Voice input/output support
- Image recognition capabilities 