# AI Assistant

## Overview

The AI Assistant is a core feature of EcoCart that provides users with instant, personalized assistance on sustainability topics. It offers information about recycling, sustainable practices, eco-friendly product recommendations, and answers questions about using the EcoCart app.

## Features

- **Real-time AI Responses**: Get intelligent responses powered by AI services when online
- **Offline Support**: Access common sustainability information even without internet connection
- **FAQ Integration**: Accurate answers to common questions about EcoCart's features and services
- **Personalized Recommendations**: Receive tailored advice based on your usage patterns and preferences
- **Context-Aware**: Maintains conversation context for more natural interactions
- **Secure**: Private by design with local processing of sensitive information
- **Configurable**: Choose your AI service provider and settings

## Architecture

The AI Assistant is built using a modular architecture with the following key components:

- **AIAssistantService**: Core service for handling message sending and receiving
- **AIServiceAdapter**: Interface for connecting to real AI services like OpenAI
- **AIOfflineCache**: System for caching common responses and FAQs for offline use
- **AIAssistantProvider**: React context provider for app-wide AI access
- **AIAssistantChat**: UI component for the chat interface
- **AIConfigScreen**: Screen for configuring AI service settings

## Usage

### For Users

To use the AI Assistant:

1. Tap the AI Assistant icon in the app
2. Type your sustainability question or select from suggested topics
3. View the AI's response and any related recommendations
4. (Optional) Configure your preferred AI service in the settings

To set up a real AI service:

1. Obtain an API key from a supported service (e.g., OpenAI)
2. In the AI Assistant, tap the configuration icon
3. Enter your API key and save

### For Developers

The AI Assistant is designed to be easily extended and integrated into other parts of the app.

```typescript
// Access the AI Assistant from any component
import { useAIAssistant } from '@/providers/AIAssistantProvider';

const MyComponent = () => {
  const { 
    sendMessage, 
    messages, 
    isLoading, 
    isAIConfigured,
    aiServiceName 
  } = useAIAssistant();

  const handleSendMessage = async () => {
    const response = await sendMessage('How do I recycle batteries?');
    console.log(response);
  };

  return (
    <View>
      {isAIConfigured ? (
        <Text>Using {aiServiceName}</Text>
      ) : (
        <Text>Using offline mode</Text>
      )}
      
      <Button 
        title="Ask about batteries" 
        onPress={handleSendMessage} 
      />
    </View>
  );
};
```

## Offline Support

The AI Assistant maintains full functionality even when offline:

1. **Response Caching**: Frequently asked questions and responses are cached
2. **Pattern Matching**: Simple queries are handled using pattern matching
3. **FAQ Database**: All official EcoCart FAQs are available offline
4. **Synchronization**: New responses are cached when online for future offline use

## FAQ Integration

The AI Assistant integrates with EcoCart's FAQ database to provide accurate information about the app's features and services:

1. **Automatic Matching**: Questions are automatically matched with official FAQ content
2. **Visual Indicators**: FAQ responses are clearly marked with an icon and source attribution
3. **Knowledge Enhancement**: Both real AI and offline responses benefit from FAQ knowledge
4. **Category-Based Suggestions**: The assistant suggests questions from popular FAQ categories

For more details, see the [FAQ Integration documentation](./faq-integration.md).

## Security and Privacy

The AI Assistant is designed with security and privacy in mind:

1. **Local Processing**: Sensitive information is processed locally when possible
2. **Secure Storage**: API keys are stored securely on the device
3. **Rate Limiting**: Prevents excessive API usage
4. **Minimal Data Collection**: Only sends essential information to AI services

## Related Documentation

- [Real AI Integration](./real-ai-integration.md)
- [Offline Support](./offline-support.md)
- [FAQ Integration](./faq-integration.md)
- [Developer API](./developer-api.md)

## Future Development

Planned enhancements for the AI Assistant include:

1. Additional AI service providers
2. Streaming responses for a more interactive experience
3. Voice input and output
4. Enhanced personalization based on user history
5. Multi-language support 