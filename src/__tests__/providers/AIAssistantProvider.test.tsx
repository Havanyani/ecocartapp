import { AIAssistantProvider, useAIAssistant } from '@/providers/AIAssistantProvider';
import { act, render, screen } from '@testing-library/react';
import React from 'react';

// Mock the AIAssistantService
jest.mock('@/services/ai/AIAssistantService', () => {
  const mockAddUserMessage = jest.fn((content) => ({
    id: `user-${Date.now()}`,
    content,
    timestamp: new Date(),
    isUser: true
  }));
  
  const mockAddSystemMessage = jest.fn((content) => ({
    id: `system-${Date.now()}`,
    content,
    timestamp: new Date(),
    isUser: false
  }));
  
  const mockSendMessage = jest.fn(async (content) => {
    mockAddUserMessage(content);
    return mockAddSystemMessage('Mock response to: ' + content);
  });
  
  const mockClearHistory = jest.fn();
  
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        getState: jest.fn(() => ({
          messages: [
            {
              id: 'initial',
              content: 'Initial greeting',
              timestamp: new Date(),
              isUser: false
            }
          ],
          isProcessing: false,
          error: null,
          context: {
            recentTopics: [],
            userPreferences: {}
          }
        })),
        sendMessage: mockSendMessage,
        addUserMessage: mockAddUserMessage,
        addSystemMessage: mockAddSystemMessage,
        clearHistory: mockClearHistory,
        getSuggestedQuestions: jest.fn(() => ['Question 1', 'Question 2'])
      }))
    },
    mockSendMessage,
    mockClearHistory,
    mockAddUserMessage,
    mockAddSystemMessage
  };
});

// Test component that uses the AIAssistant context
const TestComponent = () => {
  const { messages, isProcessing, sendMessage, clearHistory, suggestedQuestions } = useAIAssistant();
  
  return (
    <div>
      <div data-testid="message-count">{messages.length}</div>
      <div data-testid="processing-state">{isProcessing ? 'true' : 'false'}</div>
      <div data-testid="suggestions">{suggestedQuestions.join(',')}</div>
      <button 
        data-testid="send-button" 
        onClick={() => sendMessage('Test message')}
      >
        Send Message
      </button>
      <button 
        data-testid="clear-button" 
        onClick={clearHistory}
      >
        Clear History
      </button>
    </div>
  );
};

describe('AIAssistantProvider', () => {
  test('provides the AI assistant context to children', () => {
    render(
      <AIAssistantProvider>
        <TestComponent />
      </AIAssistantProvider>
    );
    
    expect(screen.getByTestId('message-count')).toHaveTextContent('1');
    expect(screen.getByTestId('processing-state')).toHaveTextContent('false');
    expect(screen.getByTestId('suggestions')).toHaveTextContent('Question 1,Question 2');
  });
  
  test('sends messages and updates context', async () => {
    const { mockSendMessage } = require('@/services/ai/AIAssistantService');
    
    render(
      <AIAssistantProvider>
        <TestComponent />
      </AIAssistantProvider>
    );
    
    // Click the send button to trigger sendMessage
    act(() => {
      screen.getByTestId('send-button').click();
    });
    
    // Verify sendMessage was called
    expect(mockSendMessage).toHaveBeenCalledWith('Test message');
  });
  
  test('clears message history', () => {
    const { mockClearHistory } = require('@/services/ai/AIAssistantService');
    
    render(
      <AIAssistantProvider>
        <TestComponent />
      </AIAssistantProvider>
    );
    
    // Click the clear button to trigger clearHistory
    act(() => {
      screen.getByTestId('clear-button').click();
    });
    
    // Verify clearHistory was called
    expect(mockClearHistory).toHaveBeenCalled();
  });
  
  test('throws an error when useAIAssistant is used outside of AIAssistantProvider', () => {
    // Mock console.error to avoid React error logging
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAIAssistant must be used within an AIAssistantProvider');
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  test('allows configuration of the AI assistant service', () => {
    const { default: AIAssistantServiceMock } = require('@/services/ai/AIAssistantService');
    
    const config = {
      apiEndpoint: 'custom-endpoint',
      useLocalProcessing: true
    };
    
    render(
      <AIAssistantProvider config={config}>
        <TestComponent />
      </AIAssistantProvider>
    );
    
    // Verify getInstance was called with the config
    expect(AIAssistantServiceMock.getInstance).toHaveBeenCalledWith(config);
  });
}); 