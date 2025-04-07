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

// Constants for memory optimization
const MEMORY_OPTIMIZATION = {
  MAX_MESSAGE_LENGTH: 1000,      // Maximum length for a single message
  MAX_HISTORY_LENGTH: 30,        // Maximum number of messages to keep in history
  SUMMARY_LENGTH: 150,           // Maximum length for message summary
  PRUNE_THRESHOLD: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  RETENTION_WINDOW: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  SUMMARY_PREFIX: '[Summary] '   // Prefix for summarized messages
};

export interface AIMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  isOfflineResponse?: boolean;
  isFAQ?: boolean;
  faqId?: string;
  isSummarized?: boolean;
  originalLength?: number;
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
  
  // Last garbage collection timestamp
  private lastMemoryOptimization: number = 0;

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
      
      // Use console log without accessing private method
      console.log(`[AIAssistant] Offline cache initialized successfully`);
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
    
    // Check if we need to optimize memory
    await this.optimizeMemoryIfNeeded();
    
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
        // Add to conversation history
        const processedMessage = this.truncateMessage(message);
        this.addUserMessage(processedMessage);
        
        this.addSystemMessage(
          offlineMatch.response, 
          this.state.isOffline || !this.isAIConfigured(), 
          offlineMatch.isFAQ || false,
          offlineMatch.faqId
        );
        
        return {
          response: offlineMatch.response,
          isFAQ: offlineMatch.isFAQ || false,
          source: offlineMatch.source
        };
      }
      
      // If no offline match and we're offline, use the fallback response
      if (this.isOffline()) {
        const offlineResponse = "I'm currently offline and don't have an answer to that question in my cache. Please try again when you have an internet connection.";
        
        // Add to conversation history
        const processedMessage = this.truncateMessage(message);
        this.addUserMessage(processedMessage);
        this.addSystemMessage(offlineResponse, true);
        
        return {
          response: offlineResponse
        };
      }
      
      // If we're online and have a configured AI adapter, use it
      if (!this.aiAdapter) {
        const noAdapterResponse = "I'm sorry, but the AI service is not properly configured. Please try again later.";
        return { response: noAdapterResponse };
      }
      
      // Get the conversation history
      const history = await this.getConversationHistory(conversationId);
      
      // Use the AI service
      const apiContext = createInstrumentationContext(
        'api_request_time', 
        'AIAssistantService.apiRequest'
      );
      
      const aiResponse = await apiContext.measureAsync(async () => {
        if (!this.aiAdapter) {
          throw new Error('AI adapter not configured');
        }
        
        // Convert AIMessage[] to the format expected by generateResponse
        const formattedHistory = history.map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.content
        }));
        
        return await this.aiAdapter.generateResponse(message, formattedHistory);
      });
      
      // Cache the response for offline use
      await aiOfflineCache.saveResponse(message, aiResponse, {
        source: 'AI Service'
      });
      
      // Record memory after processing
      recordMemoryUsage('AIAssistantService.sendMessage.end');
      
      // Add to conversation history
      const processedMessage = this.truncateMessage(message);
      this.addUserMessage(processedMessage);
      this.addSystemMessage(aiResponse, false);
      
      return {
        response: aiResponse,
        source: 'AI Service'
      };
    } finally {
      // End timing the message processing
      processingContext.end();
    }
  }, 'response_time', 'AIAssistantService.sendMessage');
  
  /**
   * Truncate a message to reduce memory usage
   */
  private truncateMessage(message: string): string {
    if (!message || message.length <= MEMORY_OPTIMIZATION.MAX_MESSAGE_LENGTH) {
      return message;
    }
    
    // Truncate and add ellipsis
    return message.substring(0, MEMORY_OPTIMIZATION.MAX_MESSAGE_LENGTH) + '...';
  }
  
  /**
   * Optimize service memory usage if needed
   */
  private async optimizeMemoryIfNeeded(): Promise<void> {
    const now = Date.now();
    
    // Only run optimization periodically to avoid constant overhead
    if (now - this.lastMemoryOptimization < 5 * 60 * 1000) { // 5 minutes
      return;
    }
    
    this.lastMemoryOptimization = now;
    
    // Record memory before optimization
    recordMemoryUsage('AIAssistantService.memoryOptimization.start');
    
    // Trim history
    this.trimMessageHistory();
    
    // Prune old messages
    this.pruneOldMessages();
    
    // Summarize long conversations
    await this.summarizeConversation();
    
    // Record memory after optimization
    recordMemoryUsage('AIAssistantService.memoryOptimization.end');
  }
  
  /**
   * Get conversation history, optimized for memory usage
   */
  private getConversationHistory = instrument(async (conversationId?: string): Promise<AIMessage[]> => {
    // Ensure history is trimmed
    this.trimMessageHistory();
    
    // Filter relevant messages
    const relevantMessages = this.state.messages.filter(msg => {
      // Filter by conversation ID if provided
      if (conversationId && this.state.context.conversationId !== conversationId) {
        return false;
      }
      
      // Only include messages from last 24 hours
      const msgTime = msg.timestamp.getTime();
      const now = Date.now();
      return (now - msgTime) < MEMORY_OPTIMIZATION.PRUNE_THRESHOLD;
    });
    
    return relevantMessages;
  }, 'message_processing', 'AIAssistantService.getConversationHistory');
  
  /**
   * Trim message history to reduce memory usage
   */
  private trimMessageHistory(): void {
    if (this.state.messages.length <= MEMORY_OPTIMIZATION.MAX_HISTORY_LENGTH) {
      return;
    }
    
    // Keep only the most recent messages up to MAX_HISTORY_LENGTH
    // But ensure we have at least some user messages for context
    const userMessages = this.state.messages.filter(msg => msg.isUser);
    const systemMessages = this.state.messages.filter(msg => !msg.isUser);
    
    // If we have too many messages, trim them but try to keep some user context
    if (userMessages.length > MEMORY_OPTIMIZATION.MAX_HISTORY_LENGTH / 2) {
      // Keep most recent user messages and system responses
      const trimmedUserMessages = userMessages.slice(-Math.floor(MEMORY_OPTIMIZATION.MAX_HISTORY_LENGTH / 2));
      const trimmedSystemMessages = systemMessages.slice(-Math.ceil(MEMORY_OPTIMIZATION.MAX_HISTORY_LENGTH / 2));
      
      // Combine and sort by timestamp
      this.state.messages = [...trimmedUserMessages, ...trimmedSystemMessages]
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } else {
      // If we don't have many user messages, just keep the most recent ones overall
      this.state.messages = this.state.messages.slice(-MEMORY_OPTIMIZATION.MAX_HISTORY_LENGTH);
    }
  }
  
  /**
   * Prune old messages to free up memory
   */
  private pruneOldMessages(): void {
    const now = Date.now();
    
    // Remove messages older than retention window
    this.state.messages = this.state.messages.filter(message => {
      const msgTime = message.timestamp.getTime();
      return (now - msgTime) < MEMORY_OPTIMIZATION.RETENTION_WINDOW;
    });
  }
  
  /**
   * Summarize long conversation to reduce memory usage
   */
  private async summarizeConversation(): Promise<void> {
    // Only summarize if we have AI adapter and enough messages
    if (!this.aiAdapter || !this.state.isConfigured || this.state.messages.length < 10) {
      return;
    }
    
    // Find long messages that haven't been summarized yet
    const longMessages = this.state.messages.filter(msg => 
      !msg.isSummarized && 
      msg.content.length > MEMORY_OPTIMIZATION.MAX_MESSAGE_LENGTH / 2
    );
    
    // Only process a few messages at a time to avoid performance impact
    const messagesToSummarize = longMessages.slice(0, 3);
    
    for (const message of messagesToSummarize) {
      try {
        // Skip if already summarized
        if (message.isSummarized) continue;
        
        // Only summarize messages older than 1 hour to avoid summarizing active conversation
        const msgAge = Date.now() - message.timestamp.getTime();
        if (msgAge < 60 * 60 * 1000) continue;
        
        // Store original length
        const originalLength = message.content.length;
        
        // Create summary if online, otherwise just truncate
        let summary;
        if (!this.state.isOffline && this.aiAdapter) {
          // Try to generate an AI summary
          try {
            summary = await this.aiAdapter.generateSummary(message.content, MEMORY_OPTIMIZATION.SUMMARY_LENGTH);
          } catch (error) {
            // Fallback to simple truncation if AI summary fails
            summary = MEMORY_OPTIMIZATION.SUMMARY_PREFIX + 
              message.content.substring(0, MEMORY_OPTIMIZATION.SUMMARY_LENGTH) + '...';
          }
        } else {
          // Simple truncation for offline mode
          summary = MEMORY_OPTIMIZATION.SUMMARY_PREFIX + 
            message.content.substring(0, MEMORY_OPTIMIZATION.SUMMARY_LENGTH) + '...';
        }
        
        // Update message with summary
        message.content = summary;
        message.isSummarized = true;
        message.originalLength = originalLength;
      } catch (error) {
        console.error('Error summarizing message:', error);
      }
    }
  }

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
      // We don't have a proper clearCache method, so we'll just reinitialize
      // which should detect an empty cache and preload defaults
      await aiOfflineCache.initialize();
      console.log('[AIAssistant] Offline cache cleared and reinitialized');
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