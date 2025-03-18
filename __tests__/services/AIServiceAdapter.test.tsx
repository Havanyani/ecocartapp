import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createAIServiceAdapter, OpenAIAdapter } from '../../src/services/ai/AIServiceAdapter';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock fetch
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      choices: [{ message: { content: 'This is a test response' } }]
    })
  })
) as jest.Mock;

describe('AIServiceAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default network state is connected
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
  });

  describe('OpenAIAdapter', () => {
    let adapter: OpenAIAdapter;

    beforeEach(() => {
      adapter = new OpenAIAdapter();
    });

    it('should initialize and load API key from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test-api-key');
      
      const result = await adapter.initialize();
      
      expect(result).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('openai_api_key');
      expect(await adapter.isConfigured()).toBe(true);
    });

    it('should return false when initialization fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const result = await adapter.initialize();
      
      expect(result).toBe(false);
      expect(await adapter.isConfigured()).toBe(false);
    });

    it('should set API key and store it', async () => {
      await adapter.setApiKey('new-api-key');
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('openai_api_key', 'new-api-key');
    });

    it('should throw error for invalid API key format', async () => {
      await expect(adapter.setApiKey('')).rejects.toThrow('Invalid API key format');
    });

    it('should generate response from API', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test-api-key');
      await adapter.initialize();
      
      const conversationHistory = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' }
      ];
      
      const response = await adapter.generateResponse('How to recycle plastic?', conversationHistory);
      
      expect(response).toBe('This is a test response');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key'
          }),
          body: expect.any(String)
        })
      );
    });

    it('should throw error when not configured', async () => {
      await expect(adapter.generateResponse('test', [])).rejects.toThrow('OpenAI API key not configured');
    });

    it('should throw error when offline', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test-api-key');
      await adapter.initialize();
      
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });
      
      await expect(adapter.generateResponse('test', [])).rejects.toThrow('No network connection available');
    });

    it('should handle API errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test-api-key');
      await adapter.initialize();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          error: { message: 'Invalid API key' }
        })
      });
      
      await expect(adapter.generateResponse('test', [])).rejects.toThrow('Invalid API key');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('openai_api_key');
    });

    it('should return the correct service name', () => {
      expect(adapter.getServiceName()).toBe('OpenAI');
    });
  });

  describe('createAIServiceAdapter', () => {
    it('should create an OpenAI adapter by default', () => {
      const adapter = createAIServiceAdapter();
      expect(adapter).toBeInstanceOf(OpenAIAdapter);
    });

    it('should create an OpenAI adapter when specified', () => {
      const adapter = createAIServiceAdapter('openai');
      expect(adapter).toBeInstanceOf(OpenAIAdapter);
    });

    it('should create an OpenAI adapter for unknown service types', () => {
      const adapter = createAIServiceAdapter('unknown');
      expect(adapter).toBeInstanceOf(OpenAIAdapter);
    });
  });
}); 