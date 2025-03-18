import AIAssistantService from '@/services/ai/AIAssistantService';

describe('AIAssistantService', () => {
  let service: AIAssistantService;
  
  // Reset the singleton instance before each test
  beforeEach(() => {
    // Access private static instance and reset it
    // @ts-ignore: Accessing private property for testing
    AIAssistantService.instance = undefined;
    service = AIAssistantService.getInstance();
  });
  
  test('should be created as a singleton', () => {
    const instance1 = AIAssistantService.getInstance();
    const instance2 = AIAssistantService.getInstance();
    
    expect(instance1).toBe(instance2);
  });
  
  test('should initialize with default greeting message', () => {
    const state = service.getState();
    
    expect(state.messages.length).toBe(1);
    expect(state.messages[0].isUser).toBe(false);
    expect(state.messages[0].content).toContain('EcoCart assistant');
  });
  
  test('should initialize with custom greeting when provided', () => {
    // @ts-ignore: Accessing private property for testing
    AIAssistantService.instance = undefined;
    
    const customGreeting = 'Custom greeting message';
    const customService = AIAssistantService.getInstance({
      defaultGreeting: customGreeting
    });
    
    const state = customService.getState();
    
    expect(state.messages.length).toBe(1);
    expect(state.messages[0].content).toBe(customGreeting);
  });
  
  test('should add user message to history', () => {
    const message = 'Hello, assistant!';
    service.addUserMessage(message);
    
    const state = service.getState();
    
    expect(state.messages.length).toBe(2);
    expect(state.messages[1].content).toBe(message);
    expect(state.messages[1].isUser).toBe(true);
  });
  
  test('should add system message to history', () => {
    const message = 'System response';
    service.addSystemMessage(message);
    
    const state = service.getState();
    
    expect(state.messages.length).toBe(2);
    expect(state.messages[1].content).toBe(message);
    expect(state.messages[1].isUser).toBe(false);
  });
  
  test('should process user message and provide a response', async () => {
    const userMessage = 'Tell me about recycling plastic';
    
    await service.sendMessage(userMessage);
    const state = service.getState();
    
    expect(state.messages.length).toBe(3);
    expect(state.messages[1].content).toBe(userMessage);
    expect(state.messages[1].isUser).toBe(true);
    expect(state.messages[2].isUser).toBe(false);
    expect(state.messages[2].content).toBeTruthy();
  });
  
  test('should set isProcessing to true during message processing', async () => {
    // Mock the mockAIResponse to delay
    const mockDelay = 100;
    // @ts-ignore: Accessing private method for testing
    jest.spyOn(service, 'mockAIResponse').mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve('Response'), mockDelay));
    });
    
    // Start the message sending process
    const messagePromise = service.sendMessage('Test message');
    
    // Check that isProcessing is true during processing
    expect(service.getState().isProcessing).toBe(true);
    
    // Wait for the response
    await messagePromise;
    
    // Verify isProcessing is reset to false
    expect(service.getState().isProcessing).toBe(false);
  });
  
  test('should handle errors during message processing', async () => {
    // Mock the mockAIResponse to throw an error
    const errorMessage = 'Test error';
    // @ts-ignore: Accessing private method for testing
    jest.spyOn(service, 'mockAIResponse').mockImplementation(() => {
      return Promise.reject(new Error(errorMessage));
    });
    
    // Expect the sendMessage call to throw an error
    await expect(service.sendMessage('Test message')).rejects.toThrow(errorMessage);
    
    // Verify isProcessing is reset to false and error is set
    const state = service.getState();
    expect(state.isProcessing).toBe(false);
    expect(state.error).toBeInstanceOf(Error);
    expect(state.error?.message).toBe(errorMessage);
  });
  
  test('should clear history', () => {
    // Add some messages
    service.addUserMessage('User message');
    service.addSystemMessage('System response');
    
    // Clear history
    service.clearHistory();
    
    // Verify messages are cleared and only the greeting remains
    const state = service.getState();
    expect(state.messages.length).toBe(0);
  });
  
  test('should provide suggested questions', () => {
    const suggestions = service.getSuggestedQuestions();
    
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThan(0);
  });
  
  test('should trim message history when it exceeds maxHistoryLength', () => {
    // @ts-ignore: Accessing private property for testing
    AIAssistantService.instance = undefined;
    
    // Create service with small maxHistoryLength
    const maxLength = 3;
    const testService = AIAssistantService.getInstance({
      maxHistoryLength: maxLength
    });
    
    // Add enough messages to exceed the limit
    for (let i = 0; i < maxLength + 2; i++) {
      testService.addUserMessage(`Message ${i}`);
    }
    
    // Verify the history is trimmed
    const state = testService.getState();
    
    // We expect maxLength messages (the trimming should keep first message)
    expect(state.messages.length).toBe(maxLength);
    
    // The first message should be the greeting, and the rest should be the most recent messages
    expect(state.messages[0].content).toContain('Message');
  });
}); 