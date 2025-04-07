/**
 * AIServiceAdapter.ts
 * 
 * Adapter interface and implementation for AI service providers.
 * This file contains the interface for all AI service adapters
 * and a concrete implementation for OpenAI.
 */

import { faqData } from '@/data/faq-data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import pako from 'pako';
import { RequestPriority, RequestQueue } from '../network/RequestQueue';

// Key for storing API key in secure storage
const API_KEY_STORAGE_KEY = 'ai_service_api_key';

/**
 * Interface defining the contract for AI service adapters
 */
export interface AIServiceAdapter {
  /**
   * Initialize the AI service adapter
   * @returns Promise resolving to true if initialization was successful
   */
  initialize(): Promise<boolean>;
  
  /**
   * Generate a response from the AI service
   * @param message The user's message
   * @param conversationHistory The conversation history
   * @returns Promise resolving to the AI response
   */
  generateResponse(
    message: string, 
    conversationHistory: Array<{role: string, content: string}>
  ): Promise<string>;
  
  /**
   * Generate a short summary of the given text
   * @param text The text to summarize
   * @param maxLength The maximum length of the summary
   * @returns Promise resolving to the summary
   */
  generateSummary(text: string, maxLength: number): Promise<string>;
  
  /**
   * Check if the AI service is configured with valid credentials
   * @returns Promise resolving to true if configured
   */
  isConfigured(): Promise<boolean>;
  
  /**
   * Set the API key for the AI service
   * @param apiKey The API key
   */
  setApiKey(apiKey: string): Promise<void>;
  
  /**
   * Get the name of the AI service
   * @returns The service name
   */
  getServiceName(): string;
}

/**
 * Configuration for OpenAI service
 */
export interface OpenAIConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  basePrompt?: string;
  enableCompression?: boolean;
  enableStreamingResponse?: boolean;
}

/**
 * Fields to include in payload when compression is enabled
 * Used for selective field inclusion optimization
 */
interface CompressedPayloadFields {
  content: boolean;
  role: boolean;
  model: boolean;
  max_tokens: boolean;
  temperature: boolean;
  // Add other fields as needed
}

/**
 * OpenAI implementation of the AIServiceAdapter interface
 */
export class OpenAIAdapter implements AIServiceAdapter {
  private apiKey: string | null = null;
  private readonly storageKey = 'openai_api_key';
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly modelName = 'gpt-3.5-turbo';
  private rateLimitCounter = 0;
  private lastRequestTime = 0;
  private requestQueue: RequestQueue;
  private readonly compressionThreshold = 1024; // 1KB
  private readonly enableCompression: boolean = true;
  private readonly enableStreamingResponse: boolean = false;
  
  constructor(config?: OpenAIConfig) {
    // Initialize rate limiting
    this.resetRateLimit();
    
    // Initialize configuration
    if (config) {
      if (config.apiKey) this.apiKey = config.apiKey;
      if (config.enableCompression !== undefined) this.enableCompression = config.enableCompression;
      if (config.enableStreamingResponse !== undefined) this.enableStreamingResponse = config.enableStreamingResponse;
    }
    
    // Get the request queue instance
    this.requestQueue = RequestQueue.getInstance();
  }

  /**
   * Reset rate limiting counter every hour
   */
  private resetRateLimit(): void {
    this.rateLimitCounter = 0;
    setTimeout(() => this.resetRateLimit(), 60 * 60 * 1000); // Reset every hour
  }

  /**
   * Check if we should rate limit requests
   */
  private shouldRateLimit(): boolean {
    const now = Date.now();
    // Limit to 30 requests per hour and at least 2 seconds between requests
    if (this.rateLimitCounter >= 30 || (now - this.lastRequestTime) < 2000) {
      return true;
    }
    this.lastRequestTime = now;
    this.rateLimitCounter++;
    return false;
  }
  
  /**
   * Initialize the adapter by loading API key from storage
   */
  async initialize(): Promise<boolean> {
    try {
      const storedKey = await AsyncStorage.getItem(this.storageKey);
      if (storedKey) {
        this.apiKey = storedKey;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error initializing OpenAI adapter:', error);
      return false;
    }
  }
  
  /**
   * Generate a response using OpenAI's API
   */
  async generateResponse(
    message: string, 
    conversationHistory: Array<{role: string, content: string}>
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    if (!await NetInfo.fetch().then(state => state.isConnected)) {
      throw new Error('No network connection available');
    }
    
    if (this.shouldRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    try {
      // Generate system prompt with EcoCart FAQ knowledge
      const systemPrompt = this.generateSystemPrompt();
      
      // Prepare messages for the API
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message }
      ];
      
      // Optimize the payload by selecting only necessary fields
      const optimizedMessages = this.optimizeMessages(messages);
      
      // Prepare the request body
      const requestBody = {
        model: this.modelName,
        messages: optimizedMessages,
        max_tokens: 500,
        temperature: 0.7,
        stream: this.enableStreamingResponse
      };
      
      // Compress the request body if enabled and size is above threshold
      const bodyString = JSON.stringify(requestBody);
      let finalBody: string | Uint8Array = bodyString;
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      };
      
      if (this.enableCompression && bodyString.length > this.compressionThreshold) {
        // Compress using pako
        const compressed = pako.deflate(bodyString);
        finalBody = compressed;
        headers['Content-Encoding'] = 'gzip';
      }
      
      // Use the request queue to manage the request with HIGH priority
      const response = await this.makeAPIRequest(finalBody, headers);
      
      if (this.enableStreamingResponse) {
        // Handle streaming response
        return this.handleStreamingResponse(response);
      } else {
        // Handle regular response
        return this.handleRegularResponse(response);
      }
    } catch (error) {
      console.error('Error generating response from OpenAI:', error);
      throw error;
    }
  }
  
  /**
   * Make an API request with optimized network handling
   */
  private async makeAPIRequest(
    body: string | Uint8Array, 
    headers: Record<string, string>
  ): Promise<Response> {
    // Use the RequestQueue to manage the request with HIGH priority
    return await this.requestQueue.post(
      this.apiUrl,
      body,
      { 
        headers,
        timeout: 30000,  // 30 second timeout
        responseType: this.enableStreamingResponse ? 'stream' : 'json'
      },
      RequestPriority.HIGH
    );
  }
  
  /**
   * Handle a regular (non-streaming) response
   */
  private async handleRegularResponse(response: Response): Promise<string> {
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      
      if (response.status === 401) {
        // Invalid API key
        await this.clearApiKey();
        throw new Error('Invalid API key. Please reconfigure your AI settings.');
      }
      
      throw new Error(`API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
  }
  
  /**
   * Handle a streaming response
   */
  private async handleStreamingResponse(response: Response): Promise<string> {
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      
      if (response.status === 401) {
        // Invalid API key
        await this.clearApiKey();
        throw new Error('Invalid API key. Please reconfigure your AI settings.');
      }
      
      throw new Error(`API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Stream reader not available');
    }
    
    let completeResponse = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        
        // Process the SSE format
        const lines = chunk
          .split('\n')
          .filter(line => line.startsWith('data: ') && !line.includes('[DONE]'));
        
        for (const line of lines) {
          try {
            const jsonStr = line.substring(6); // Remove 'data: '
            const json = JSON.parse(jsonStr);
            const content = json.choices[0]?.delta?.content || '';
            completeResponse += content;
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    
    return completeResponse || 'Sorry, I couldn\'t generate a response.';
  }
  
  /**
   * Clear the API key
   */
  private async clearApiKey(): Promise<void> {
    this.apiKey = null;
    try {
      await AsyncStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing API key:', error);
    }
  }
  
  /**
   * Optimize messages by removing unnecessary fields and content
   */
  private optimizeMessages(messages: Array<{role: string, content: string}>): Array<any> {
    return messages.map(message => {
      const result: any = { role: message.role };
      
      // For system messages, include full content
      if (message.role === 'system') {
        result.content = message.content;
      } else {
        // For user and assistant messages, trim content if very long
        if (message.content.length > 2000) {
          result.content = message.content.substring(0, 2000) + '...';
        } else {
          result.content = message.content;
        }
      }
      
      return result;
    });
  }
  
  /**
   * Generate a comprehensive system prompt with EcoCart knowledge
   */
  private generateSystemPrompt(): string {
    // Base system prompt
    let prompt = `You are EcoCart's sustainability assistant. Provide helpful, concise information about sustainable living, recycling, and eco-friendly practices. Keep responses under 200 words.

You have detailed knowledge about EcoCart's features, including:
- User accounts and authentication
- Sustainable product shopping
- Recycling guidance and waste management
- Carbon footprint tracking and offsetting
- Impact dashboard
- Rewards program
- Payment processing

If asked about EcoCart features, provide accurate information based on the following FAQs:`;

    // Add selected FAQs to the system prompt (limited to avoid token limits)
    const appFeatureFaqs = faqData.filter(faq => 
      ['App Features', 'Account', 'Shopping', 'Recycling', 'Carbon Offsets', 'Rewards'].includes(faq.category)
    ).slice(0, 10);

    // Add FAQ content to the prompt
    appFeatureFaqs.forEach(faq => {
      prompt += `\n\nQ: ${faq.question}\nA: ${faq.answer}`;
    });

    prompt += `\n\nWhen discussing features not covered in the FAQs, stick to general sustainability advice. For specific account questions, suggest the user check their account details in the app.`;

    return prompt;
  }
  
  /**
   * Generate a summary of a text using OpenAI
   */
  async generateSummary(text: string, maxLength: number = 150): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    if (!await NetInfo.fetch().then(state => state.isConnected)) {
      throw new Error('No network connection available');
    }
    
    if (this.shouldRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    try {
      // Prompt for summarization
      const summaryPrompt = `Please summarize the following text in approximately ${maxLength} characters or less:\n\n${text}`;
      
      // Prepare the messages
      const messages = [
        { role: 'system', content: 'You are a helpful assistant that summarizes text concisely.' },
        { role: 'user', content: summaryPrompt }
      ];
      
      // Optimize the messages
      const optimizedMessages = this.optimizeMessages(messages);
      
      // Prepare the request body
      const requestBody = {
        model: this.modelName,
        messages: optimizedMessages,
        max_tokens: 150,
        temperature: 0.3 // Lower temperature for more deterministic summary
      };
      
      // Compress the request body if enabled and size is above threshold
      const bodyString = JSON.stringify(requestBody);
      let finalBody: string | Uint8Array = bodyString;
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      };
      
      if (this.enableCompression && bodyString.length > this.compressionThreshold) {
        // Compress using pako
        const compressed = pako.deflate(bodyString);
        finalBody = compressed;
        headers['Content-Encoding'] = 'gzip';
      }
      
      // Use the request queue with NORMAL priority
      const response = await this.makeAPIRequest(finalBody, headers);
      
      return this.handleRegularResponse(response);
    } catch (error) {
      console.error('Error generating summary from OpenAI:', error);
      throw error;
    }
  }
  
  /**
   * Check if the service is configured with an API key
   */
  async isConfigured(): Promise<boolean> {
    if (this.apiKey) {
      return true;
    }
    
    try {
      const storedKey = await AsyncStorage.getItem(this.storageKey);
      return !!storedKey;
    } catch (error) {
      console.error('Error checking if OpenAI is configured:', error);
      return false;
    }
  }
  
  /**
   * Set the API key for this service
   */
  async setApiKey(apiKey: string): Promise<void> {
    this.apiKey = apiKey;
    
    try {
      await AsyncStorage.setItem(this.storageKey, apiKey);
    } catch (error) {
      console.error('Error saving API key:', error);
      throw error;
    }
  }
  
  /**
   * Get the name of this service
   */
  getServiceName(): string {
    return 'OpenAI';
  }
}

/**
 * Factory function to create the appropriate AI service adapter
 * Currently only supports OpenAI, but can be extended to support other services
 */
export function createAIServiceAdapter(service: string = 'openai'): AIServiceAdapter {
  switch (service.toLowerCase()) {
    case 'openai':
    default:
      return new OpenAIAdapter();
  }
}

export default createAIServiceAdapter; 