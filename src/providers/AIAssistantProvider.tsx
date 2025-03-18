import AIAssistantService, {
    AIAssistantConfig,
    AIAssistantState,
    AIMessage
} from '@/services/ai/AIAssistantService';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AIAssistantContextValue {
  messages: AIMessage[];
  isProcessing: boolean;
  error: Error | null;
  isOffline: boolean;
  isAIConfigured: boolean;
  aiServiceName: string | null;
  sendMessage: (content: string) => Promise<AIMessage>;
  clearHistory: () => void;
  suggestedQuestions: string[];
  refreshOfflineCache: () => Promise<void>;
  configureAI: (apiKey: string) => Promise<boolean>;
}

const AIAssistantContext = createContext<AIAssistantContextValue | null>(null);

interface AIAssistantProviderProps {
  children: ReactNode;
  config?: AIAssistantConfig;
}

export function AIAssistantProvider({ children, config }: AIAssistantProviderProps) {
  const [service] = useState(() => AIAssistantService.getInstance(config));
  const [state, setState] = useState<AIAssistantState>(service.getState());
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [aiServiceName, setAiServiceName] = useState<string | null>(service.getAIServiceName());

  // Poll for state updates to catch network changes
  useEffect(() => {
    const interval = setInterval(() => {
      setState(service.getState());
      setAiServiceName(service.getAIServiceName());
    }, 5000);

    return () => clearInterval(interval);
  }, [service]);

  // Update suggestions when messages or network status changes
  useEffect(() => {
    setSuggestedQuestions(service.getSuggestedQuestions());
  }, [state.messages, state.isOffline, service]);

  const sendMessage = async (content: string): Promise<AIMessage> => {
    try {
      const response = await service.sendMessage(content);
      setState(service.getState());
      return response;
    } catch (error) {
      setState(service.getState());
      throw error;
    }
  };

  const clearHistory = () => {
    service.clearHistory();
    setState(service.getState());
    setSuggestedQuestions(service.getSuggestedQuestions());
  };
  
  const refreshOfflineCache = async () => {
    await service.refreshOfflineCache();
    setState(service.getState());
    setSuggestedQuestions(service.getSuggestedQuestions());
  };
  
  const configureAI = async (apiKey: string): Promise<boolean> => {
    const result = await service.configureAI(apiKey);
    setState(service.getState());
    setAiServiceName(service.getAIServiceName());
    return result;
  };

  const value: AIAssistantContextValue = {
    messages: state.messages,
    isProcessing: state.isProcessing,
    error: state.error,
    isOffline: state.isOffline,
    isAIConfigured: state.isConfigured,
    aiServiceName,
    sendMessage,
    clearHistory,
    suggestedQuestions,
    refreshOfflineCache,
    configureAI
  };

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
}

export default AIAssistantProvider; 