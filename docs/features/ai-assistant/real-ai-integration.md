# Real AI Integration

This document outlines the implementation details for integrating real AI services into the EcoCart AI Assistant.

## Overview

The EcoCart AI Assistant can now connect to external AI services to provide more accurate, contextual, and helpful responses to user queries. The integration uses an adapter pattern that allows for easy addition of different AI service providers while maintaining a consistent interface for the rest of the application.

## Architecture

The AI integration uses a layered architecture with the following components:

1. **AIServiceAdapter Interface**: Defines the standard contract for all AI service providers.
2. **Service-Specific Adapters**: Concrete implementations for specific AI services (currently OpenAI).
3. **AIAssistantService**: Core service that mediates between the UI and AI adapter.
4. **Configuration UI**: User interface for setting up API keys and preferences.

![Architecture Diagram](../../assets/diagrams/ai-integration-architecture.png)

## Components

### AIServiceAdapter Interface

The `AIServiceAdapter` interface defines the contract that all AI service implementations must follow:

```typescript
export interface AIServiceAdapter {
  initialize(): Promise<boolean>;
  generateResponse(message: string, conversationHistory: Array<{role: string, content: string}>): Promise<string>;
  isConfigured(): Promise<boolean>;
  setApiKey(apiKey: string): Promise<void>;
  getServiceName(): string;
}
```

This interface ensures that any AI service can be easily plugged into the system.

### OpenAI Implementation

The current implementation includes an adapter for OpenAI's GPT services:

```typescript
export class OpenAIAdapter implements AIServiceAdapter {
  // Implementation details
}
```

The OpenAI adapter supports:
- Secure API key storage
- Conversation history formatting
- Error handling and fallback mechanisms
- Rate limiting to prevent excessive costs

### AIAssistantService Integration

The `AIAssistantService` has been enhanced to work with real AI services when available, while maintaining offline capabilities:

1. **Service Selection**: Uses the configured AI service when available
2. **Graceful Degradation**: Falls back to offline responses when the AI service is unavailable
3. **Context Management**: Properly formats conversation history for the AI service
4. **Response Caching**: Caches AI responses for offline use

### Configuration Management

API keys and configuration options are managed through:

1. **Secure Storage**: API keys are stored securely using AsyncStorage
2. **Configuration Screen**: A dedicated screen for users to manage their AI service settings
3. **Status Indicators**: UI components that show the current AI service status

## Usage

### Setting Up AI Services

Users can configure AI services through the AI Configuration screen:

1. Navigate to the AI Assistant
2. Tap the configuration icon
3. Enter the API key for the desired service
4. Save the configuration

### Developer Usage

Developers can interact with the AI integration through the AIAssistantProvider:

```typescript
const { 
  isAIConfigured, 
  aiServiceName, 
  sendMessage, 
  configureAI 
} = useAIAssistant();

// Check if AI is configured
if (isAIConfigured) {
  console.log(`Using ${aiServiceName} for AI responses`);
}

// Send a message (will use real AI if configured)
const response = await sendMessage("How do I recycle plastic bottles?");

// Configure AI service
await configureAI("your-api-key");
```

## Security Considerations

The AI integration includes several security features:

1. **Local Storage Only**: API keys are stored locally and never transmitted to EcoCart servers
2. **Rate Limiting**: Client-side rate limiting prevents excessive API usage
3. **Error Handling**: Robust error handling prevents exposing sensitive information
4. **Privacy Notice**: Users are informed about data usage practices

## Fallback Mechanism

When the AI service is unavailable (due to network issues, rate limiting, or API errors), the system falls back to:

1. **Offline Cache**: Previously cached AI responses for common questions
2. **Pattern Matching**: Simple pattern-based responses for basic queries
3. **Failure Messages**: Clear error messages when a response cannot be generated

## Future Enhancements

Planned enhancements for the AI integration include:

1. **Additional Providers**: Support for additional AI services (Anthropic, Azure OpenAI, etc.)
2. **Streaming Responses**: Real-time streaming of AI responses for a more interactive experience
3. **Advanced Context Management**: Better context management for more personalized responses
4. **Analytics Integration**: Tracking AI response quality and user satisfaction

## Troubleshooting

Common issues and solutions:

### API Key Issues
- **Invalid Key**: Ensure the API key is correctly entered without extra spaces
- **Expired Key**: Check that the API key has not expired
- **Permissions**: Verify that the API key has the necessary permissions

### Rate Limiting
- **Too Many Requests**: The application limits requests to prevent excessive costs
- **Service Limits**: The AI service may have its own rate limits

### Network Issues
- **Offline Mode**: The application will automatically switch to offline mode when network is unavailable
- **Timeout**: Long-running requests may time out - try again later 