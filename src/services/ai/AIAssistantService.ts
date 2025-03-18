/**
 * AIAssistantService.ts
 * 
 * Core service for handling AI assistant interactions.
 * This service supports both online and offline operations.
 */

import { getFAQsByCategory, searchFAQs } from '@/data/faq-data';
import { createInstrumentationContext, instrument, recordMemoryUsage } from '@/utils/performance/Instrumentation';
import NetInfo from '@react-native-community/netinfo';
import aiOfflineCache from './AIOfflineCache';
import { AIServiceAdapter, createAIServiceAdapter } from './AIServiceAdapter';

export interface AIMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  isOfflineResponse?: boolean;
  isFAQ?: boolean;
  faqId?: string;
  attachments?: {
    type: 'image' | 'location' | 'product';
    url?: string;
    data?: any;
  }[];
}

export interface AIAssistantState {
  messages: AIMessage[];
  isProcessing: boolean;
  error: Error | null;
  isOffline: boolean;
  isConfigured: boolean;
  context: {
    recentTopics: string[];
    userPreferences: Record<string, any>;
    conversationId?: string;
  };
}

export interface AIAssistantConfig {
  apiEndpoint?: string;
  apiKey?: string;
  useLocalProcessing?: boolean;
  maxHistoryLength?: number;
  defaultGreeting?: string;
  suggestionCategories?: string[];
  enableOfflineSupport?: boolean;
  offlineMessage?: string;
  aiService?: 'openai';
  aiServiceConfig?: any;
  prioritizeFAQs?: boolean;
}

class AIAssistantService {
  private state: AIAssistantState;
  private config: AIAssistantConfig;
  private static instance: AIAssistantService;
  private offlineGreeting: string = 'I\'m currently in offline mode. I can answer common questions about recycling and sustainability, but some features will be limited until you\'re back online.';
  private aiAdapter: AIServiceAdapter | null = null;

  private constructor(config: AIAssistantConfig = {}) {
    this.config = {
      apiEndpoint: 'https://api.ecocart.ai/assistant',
      useLocalProcessing: false,
      maxHistoryLength: 50,
      defaultGreeting: 'Hi! I\'m your EcoCart assistant. How can I help you with recycling or sustainability today?',
      suggestionCategories: ['recycling', 'eco-tips', 'product-info', 'waste-reduction'],
      enableOfflineSupport: true,
      offlineMessage: this.offlineGreeting,
      aiService: 'openai',
      prioritizeFAQs: true,
      ...config
    };

    this.state = {
      messages: [],
      isProcessing: false,
      error: null,
      isOffline: false,
      isConfigured: false,
      context: {
        recentTopics: [],
        userPreferences: {}
      }
    };

    // Initialize service
    this.init();
  }

  private async init() {
    // Check network status
    this.checkNetworkStatus();
    
    // Setup network state listener
    NetInfo.addEventListener(this.handleNetworkChange);
    
    // Initialize with default greeting
    this.addSystemMessage(this.config.defaultGreeting || '');
    
    // Initialize offline cache if enabled
    if (this.config.enableOfflineSupport) {
      await this.initializeOfflineSupport();
    }
    
    // Initialize AI service adapter
    await this.initializeAIService();
  }
  
  private async initializeAIService() {
    try {
      if (this.config.aiService) {
        this.aiAdapter = createAIServiceAdapter(this.config.aiService);
        
        const isInitialized = await this.aiAdapter.initialize();
        this.state.isConfigured = isInitialized;
        
        console.log(`[AIAssistant] AI service initialized: ${this.aiAdapter.getServiceName()}`);
      }
    } catch (error) {
      console.error('[AIAssistant] Failed to initialize AI service:', error);
      this.state.isConfigured = false;
    }
  }
  
  private async initializeOfflineSupport() {
    try {
      // Initialize the offline cache with common responses and FAQs
      await aiOfflineCache.initialize();
      
      const cache = await aiOfflineCache.getCache();
      console.log(`[AIAssistant] Offline cache initialized with ${cache.length} responses`);
    } catch (error) {
      console.error('[AIAssistant] Failed to initialize offline support:', error);
    }
  }
  
  private handleNetworkChange = async (state: any) => {
    const wasOffline = this.state.isOffline;
    const isOffline = !(state.isConnected && state.isInternetReachable !== false);
    
    // Update state if network status changed
    if (wasOffline !== isOffline) {
      this.state.isOffline = isOffline;
      
      // If transitioning to offline mode, add a notification message
      if (isOffline && this.config.enableOfflineSupport) {
        this.addSystemMessage(this.config.offlineMessage || this.offlineGreeting, true);
      }
    }
  };
  
  private async checkNetworkStatus() {
    try {
      const networkState = await NetInfo.fetch();
      this.state.isOffline = !(networkState.isConnected && networkState.isInternetReachable !== false);
    } catch (error) {
      this.state.isOffline = true;
      console.error('[AIAssistant] Failed to check network status:', error);
    }
  }

  public static getInstance(config?: AIAssistantConfig): AIAssistantService {
    if (!AIAssistantService.instance) {
      AIAssistantService.instance = new AIAssistantService(config);
    }
    return AIAssistantService.instance;
  }

  public getState(): AIAssistantState {
    return { ...this.state };
  }
  
  public isOffline(): boolean {
    return this.state.isOffline;
  }
  
  public isAIConfigured(): boolean {
    return this.state.isConfigured;
  }
  
  public async configureAI(apiKey: string): Promise<boolean> {
    if (!this.aiAdapter) {
      return false;
    }
    
    try {
      await this.aiAdapter.setApiKey(apiKey);
      this.state.isConfigured = await this.aiAdapter.isConfigured();
      return this.state.isConfigured;
    } catch (error) {
      console.error('[AIAssistant] Failed to configure AI service:', error);
      return false;
    }
  }

  /**
   * Submit a user message and get a response
   */
  public sendMessage = instrument(async (
    message: string, 
    conversationId?: string
  ): Promise<{ response: string; isFAQ?: boolean; source?: string }> => {
    // Record memory usage at the start
    recordMemoryUsage('AIAssistantService.sendMessage.start');
    
    const processingContext = createInstrumentationContext(
      'message_processing', 
      'AIAssistantService.messageProcessing'
    );
    
    // Start timing the message processing
    processingContext.start();
    
    try {
      // First, check if we have a match in the offline cache
      const offlineMatch = await processingContext.measureAsync(async () => {
        return await aiOfflineCache.findResponseMatch(message);
      });
      
      if (offlineMatch) {
        return {
          response: offlineMatch.response,
          isFAQ: offlineMatch.isFAQ,
          source: offlineMatch.source
        };
      }
      
      // If no offline match and we're offline, use the fallback response
      if (!await this.networkService.isOnline()) {
        return {
          response: "I'm currently offline and don't have an answer to that question in my cache. Please try again when you have an internet connection."
        };
      }
      
      // If we're online, use the AI service
      const apiContext = createInstrumentationContext(
        'api_request_time', 
        'AIAssistantService.apiRequest'
      );
      
      const aiResponse = await apiContext.measureAsync(async () => {
        return await this.aiAdapter.generateResponse(
          message, 
          await this.getConversationHistory(conversationId)
        );
      });
      
      // Cache the response for offline use
      await aiOfflineCache.cacheResponse(message, aiResponse);
      
      // Record memory after processing
      recordMemoryUsage('AIAssistantService.sendMessage.end');
      
      return { response: aiResponse };
    } finally {
      // End timing the message processing
      processingContext.end();
    }
  }, 'response_time', 'AIAssistantService.sendMessage');
  
  /**
   * Get conversation history
   */
  private getConversationHistory = instrument(async (
    conversationId?: string
  ): Promise<ConversationMessage[]> => {
    if (!conversationId) {
      return [];
    }
    
    try {
      return await this.conversationService.getConversationHistory(conversationId);
    } catch (error) {
      console.error('Error retrieving conversation history:', error);
      return [];
    }
  }, 'message_processing', 'AIAssistantService.getConversationHistory');

  public addUserMessage(content: string): AIMessage {
    const message: AIMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      timestamp: new Date(),
      isUser: true
    };

    this.state.messages = [...this.state.messages, message];
    this.trimMessageHistory();
    
    return message;
  }

  public addSystemMessage(
    content: string, 
    isOfflineResponse: boolean = false,
    isFAQ: boolean = false,
    faqId?: string
  ): AIMessage {
    const message: AIMessage = {
      id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      timestamp: new Date(),
      isUser: false,
      isOfflineResponse,
      isFAQ,
      faqId
    };

    this.state.messages = [...this.state.messages, message];
    this.trimMessageHistory();
    
    return message;
  }

  public clearHistory(): void {
    this.state.messages = [];
    this.state.context.recentTopics = [];
    
    // Re-add greeting message
    if (this.state.isOffline && this.config.enableOfflineSupport) {
      this.addSystemMessage(this.config.offlineMessage || this.offlineGreeting, true);
    } else {
      this.addSystemMessage(this.config.defaultGreeting || '');
    }
  }

  public getSuggestedQuestions(): string[] {
    // Get suggested FAQs first
    const recommendedFAQs = this.getRecommendedFAQs();
    if (recommendedFAQs.length >= 3) {
      return recommendedFAQs.slice(0, 4);
    }
    
    // If offline, return questions we can definitely answer
    if (this.state.isOffline && this.config.enableOfflineSupport) {
      return [
        'How do I recycle plastic bottles?',
        'Is paper recyclable?',
        'What are sustainable products?',
        'How do I compost at home?'
      ];
    }
    
    // Online suggestions
    return [
      'How do I recycle plastic bottles?',
      'What\'s my carbon footprint from my last purchase?',
      'Give me tips to reduce waste in my kitchen',
      'Is this packaging recyclable?'
    ];
  }
  
  /**
   * Get recommended FAQ questions based on popular categories
   */
  private getRecommendedFAQs(): string[] {
    const popularCategories = ['Recycling', 'App Features', 'Shopping', 'Carbon Offsets'];
    const recommendedQuestions: string[] = [];
    
    // Get one question from each popular category
    for (const category of popularCategories) {
      const categoryFAQs = getFAQsByCategory(category);
      if (categoryFAQs.length > 0) {
        // Get a random FAQ from this category
        const randomIndex = Math.floor(Math.random() * categoryFAQs.length);
        recommendedQuestions.push(categoryFAQs[randomIndex].question);
      }
    }
    
    return recommendedQuestions;
  }

  // Helper method to keep message history at a reasonable size
  private trimMessageHistory(): void {
    if (this.state.messages.length > (this.config.maxHistoryLength || 50)) {
      // Remove oldest messages but keep the greeting
      this.state.messages = [
        this.state.messages[0],
        ...this.state.messages.slice(-(this.config.maxHistoryLength || 50) + 1)
      ];
    }
  }

  // Temporary mock method - used as fallback when AI service is not configured
  private async mockAIResponse(userMessage: string): Promise<string> {
    // Check if this matches an FAQ first
    const searchResults = searchFAQs(userMessage);
    if (searchResults.length > 0) {
      // Return the best matching FAQ answer
      return searchResults[0].answer;
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple response logic for demonstration
    if (userMessage.toLowerCase().includes('recycle')) {
      return 'Recycling correctly is important! Make sure to clean containers and check your local recycling guidelines for specific instructions.';
    } else if (userMessage.toLowerCase().includes('plastic')) {
      return 'Plastic pollution is a serious issue. Try to use reusable alternatives when possible and always recycle plastic items according to your local guidelines.';
    } else if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      return 'Hello! How can I help you with sustainability or recycling questions today?';
    } else {
      return 'I understand you\'re asking about sustainability. Could you provide more details so I can give you a more specific answer?';
    }
  }
  
  // Force a sync of the offline cache with the latest common responses and FAQs
  public async refreshOfflineCache(): Promise<void> {
    if (!this.config.enableOfflineSupport) return;
    
    try {
      await aiOfflineCache.initialize();
    } catch (error) {
      console.error('[AIAssistant] Failed to refresh offline cache:', error);
    }
  }
  
  // Clear all cached responses
  public async clearOfflineCache(): Promise<void> {
    if (!this.config.enableOfflineSupport) return;
    
    try {
      await aiOfflineCache.clearCache();
    } catch (error) {
      console.error('[AIAssistant] Failed to clear offline cache:', error);
    }
  }
  
  // Get the AI service name
  public getAIServiceName(): string | null {
    return this.aiAdapter ? this.aiAdapter.getServiceName() : null;
  }
  
  // Search FAQs directly
  public searchFAQs(query: string): Array<{question: string, answer: string}> {
    const results = searchFAQs(query);
    return results.map(faq => ({
      question: faq.question,
      answer: faq.answer
    }));
  }
}

export default AIAssistantService; 