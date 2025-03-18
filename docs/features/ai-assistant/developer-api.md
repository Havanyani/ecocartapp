# AI Assistant Developer API

This document provides detailed information for developers who want to integrate with or extend the AI Assistant functionality in their components.

## Core Hooks and Components

### useAIAssistant Hook

The primary way to access AI Assistant functionality is through the `useAIAssistant` hook.

```typescript
import { useAIAssistant } from '@/providers/AIAssistantProvider';

// In your component
const {
  // State
  messages,
  isLoading,
  isOffline,
  isAIConfigured,
  aiServiceName,
  
  // Methods
  sendMessage,
  clearMessages,
  configureAI,
  refreshNetworkStatus,
} = useAIAssistant();
```

#### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `messages` | `AIMessage[]` | Array of conversation messages |
| `isLoading` | `boolean` | Whether a message is currently being processed |
| `isOffline` | `boolean` | Whether the app is currently offline |
| `isAIConfigured` | `boolean` | Whether a real AI service is configured |
| `aiServiceName` | `string \| null` | Name of the configured AI service (e.g., "OpenAI") |

#### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `sendMessage` | `(message: string) => Promise<string>` | Send a message to the AI Assistant and get a response |
| `clearMessages` | `() => void` | Clear the conversation history |
| `configureAI` | `(apiKey: string) => Promise<boolean>` | Configure the AI service with an API key |
| `refreshNetworkStatus` | `() => Promise<boolean>` | Check and update network connectivity status |

### AIAssistantChat Component

The main UI component for displaying the chat interface:

```typescript
import { AIAssistantChat } from '@/components/ai/AIAssistantChat';

// In your component render method
<AIAssistantChat
  initialMessage="How can I help you with sustainability today?"
  placeholder="Ask a question about recycling..."
  showHeader={true}
  onClose={() => {/* handle close */}}
/>
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `initialMessage` | `string` | No | - | Initial greeting message from the assistant |
| `placeholder` | `string` | No | "Type a message..." | Placeholder text for input field |
| `showHeader` | `boolean` | No | `true` | Whether to show the header with title and close button |
| `onClose` | `() => void` | No | - | Callback when close button is pressed |
| `style` | `ViewStyle` | No | - | Additional styles for the container |
| `suggestionCategories` | `string[]` | No | - | Categories for suggested questions |

## Data Models

### AIMessage

```typescript
interface AIMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  isOfflineResponse?: boolean;
}
```

### AIServiceAdapter

Interface for AI service adapters:

```typescript
interface AIServiceAdapter {
  initialize(): Promise<boolean>;
  generateResponse(
    message: string, 
    conversationHistory: Array<{role: string, content: string}>
  ): Promise<string>;
  isConfigured(): Promise<boolean>;
  setApiKey(apiKey: string): Promise<void>;
  getServiceName(): string;
}
```

## Extension Points

### Custom AI Service Adapter

To add support for a new AI service, implement the `AIServiceAdapter` interface and register it in the factory:

```typescript
import { AIServiceAdapter } from '@/services/ai/AIServiceAdapter';

export class CustomAIAdapter implements AIServiceAdapter {
  // Implement required methods
  
  async initialize(): Promise<boolean> {
    // Initialize your custom adapter
  }
  
  async generateResponse(
    message: string, 
    conversationHistory: Array<{role: string, content: string}>
  ): Promise<string> {
    // Generate response using your custom service
  }
  
  async isConfigured(): Promise<boolean> {
    // Check if your adapter is configured
  }
  
  async setApiKey(apiKey: string): Promise<void> {
    // Set API key for your service
  }
  
  getServiceName(): string {
    return 'CustomAI';
  }
}

// Then in AIServiceAdapter.ts, update the factory function:
export function createAIServiceAdapter(service: string = 'openai'): AIServiceAdapter {
  switch (service.toLowerCase()) {
    case 'openai':
      return new OpenAIAdapter();
    case 'customai':
      return new CustomAIAdapter();
    default:
      return new OpenAIAdapter();
  }
}
```

### Custom UI Presentation

To create a custom presentation of the AI Assistant:

```typescript
import { useAIAssistant } from '@/providers/AIAssistantProvider';
import { View, TextInput, FlatList, Text, Button } from 'react-native';

const CustomAIInterface = () => {
  const { messages, sendMessage, isLoading } = useAIAssistant();
  const [input, setInput] = useState('');
  
  const handleSend = async () => {
    if (input.trim()) {
      await sendMessage(input);
      setInput('');
    }
  };
  
  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={item.role === 'user' ? styles.userMessage : styles.aiMessage}>
            <Text>{item.content}</Text>
          </View>
        )}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          style={styles.input}
        />
        <Button 
          title="Send" 
          onPress={handleSend}
          disabled={isLoading || !input.trim()} 
        />
      </View>
    </View>
  );
};

const styles = {/* styles here */};
```

## Integration Examples

### Adding AI Assistant to a Product Detail Screen

```typescript
import { useAIAssistant } from '@/providers/AIAssistantProvider';
import { View, Text, Button, Modal } from 'react-native';
import { AIAssistantChat } from '@/components/ai/AIAssistantChat';

const ProductDetailScreen = ({ product }) => {
  const [showAI, setShowAI] = useState(false);
  const { sendMessage } = useAIAssistant();
  
  const askAboutRecycling = async () => {
    setShowAI(true);
    // Pre-populate with a question about this product
    await sendMessage(`How do I recycle ${product.name}?`);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.productName}>{product.name}</Text>
      {/* Other product details */}
      
      <Button 
        title="How to Recycle This?" 
        onPress={askAboutRecycling}
      />
      
      <Modal
        visible={showAI}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAI(false)}
      >
        <View style={styles.modalContainer}>
          <AIAssistantChat
            onClose={() => setShowAI(false)}
          />
        </View>
      </Modal>
    </View>
  );
};
```

## Best Practices

1. **Context Management**: When sending messages programmatically, consider adding context about the current screen or action to help the AI provide better responses.

2. **Error Handling**: Always handle potential errors from AI responses, especially when using real AI services that might fail due to network issues.

3. **Offline Awareness**: Check the `isOffline` state before performing operations that require network connectivity.

4. **UI Feedback**: Always show loading states and error messages to provide feedback to users.

5. **Rate Limiting**: Be mindful of how frequently you send requests to avoid rate limiting issues.

6. **State Persistence**: The AIAssistantProvider maintains conversation state during the app session, but if you need to persist conversations across sessions, you'll need to implement additional storage.

7. **Security**: Never hardcode API keys in your components. Always use the secure key storage provided by the AI service.

## Troubleshooting

### Common Issues

1. **AI Response Timeout**: If responses are taking too long, check network connectivity and consider implementing a timeout mechanism.

2. **Configuration Issues**: If `isAIConfigured` is false even after setting an API key, check for syntax errors in the key format.

3. **Offline Mode Not Working**: Ensure the offline cache has been properly initialized and populated.

4. **Memory Leaks**: When implementing custom components that use the AI Assistant, make sure to clean up event listeners and subscriptions.

For further assistance, refer to the source code or contact the AI Assistant feature owner. 