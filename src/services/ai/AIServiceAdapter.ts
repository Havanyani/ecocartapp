/**
 * AIServiceAdapter.ts
 * 
 * Adapter interface and implementation for AI service providers.
 * This file contains the interface for all AI service adapters
 * and a concrete implementation for OpenAI.
 */

import { faqData } from '@/data/faq-data';
import { isConnected } from '@/utils/network';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  
  constructor() {
    // Initialize rate limiting
    this.resetRateLimit();
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
    
    if (!await isConnected()) {
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
      
      // Make API request
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          max_tokens: 500,
          temperature: 0.7
        })
      });
      
      // Handle API response
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
      
    } catch (error) {
      console.error('Error generating response from OpenAI:', error);
      throw error;
    }
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
   * Check if the API key is configured
   */
  async isConfigured(): Promise<boolean> {
    if (this.apiKey) {
      return true;
    }
    
    try {
      const storedKey = await AsyncStorage.getItem(this.storageKey);
      this.apiKey = storedKey;
      return !!storedKey;
    } catch (error) {
      console.error('Error checking OpenAI configuration:', error);
      return false;
    }
  }
  
  /**
   * Set the API key and store it securely
   */
  async setApiKey(apiKey: string): Promise<void> {
    if (!apiKey || apiKey.trim().length < 10) {
      throw new Error('Invalid API key format');
    }
    
    try {
      await AsyncStorage.setItem(this.storageKey, apiKey);
      this.apiKey = apiKey;
    } catch (error) {
      console.error('Error storing OpenAI API key:', error);
      throw new Error('Failed to store API key securely');
    }
  }
  
  /**
   * Clear the API key from storage
   */
  private async clearApiKey(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      this.apiKey = null;
    } catch (error) {
      console.error('Error clearing OpenAI API key:', error);
    }
  }
  
  /**
   * Get the service name
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