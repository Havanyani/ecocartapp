/**
 * WebSocketService
 * 
 * Manages WebSocket connections for real-time notifications and updates
 */

import NetInfo from '@react-native-community/netinfo';
import Constants from 'expo-constants';
import { ApiService } from './ApiService';

// Type definitions
type MessageListener = (data: any) => void;
type ConnectionListener = () => void;

interface WebSocketMessage {
  type: string;
  event: string;
  data: any;
}

class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private messageListeners: Map<string, Set<MessageListener>> = new Map();
  private connectionListeners: {
    onConnect: Set<ConnectionListener>;
    onDisconnect: Set<ConnectionListener>;
    onError: Set<(error: Event) => void>;
  } = {
    onConnect: new Set(),
    onDisconnect: new Set(),
    onError: new Set(),
  };
  
  // Get the WebSocket URL from constants or use default
  private wsUrl: string = Constants.expoConfig?.extra?.wsUrl || 'wss://api.ecocart.com/ws';
  
  private constructor() {}
  
  /**
   * Get the singleton instance of WebSocketService
   */
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }
  
  /**
   * Connect to the WebSocket server
   */
  public async connect(): Promise<boolean> {
    if (this.isConnected || this.isConnecting) {
      return this.isConnected;
    }
    
    this.isConnecting = true;
    
    // Check for network connectivity first
    const netState = await NetInfo.fetch();
    if (!netState.isConnected || !netState.isInternetReachable) {
      console.log('No internet connection available for WebSocket');
      this.isConnecting = false;
      return false;
    }
    
    try {
      // Get authentication token
      const token = await this.getAuthToken();
      
      // Connect to WebSocket with authentication
      const url = token ? `${this.wsUrl}?token=${token}` : this.wsUrl;
      this.socket = new WebSocket(url);
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      
      return true;
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.isConnecting = false;
      return false;
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    if (!this.socket) return;
    
    this.clearTimers();
    
    try {
      this.socket.close();
    } catch (error) {
      console.error('Error closing WebSocket:', error);
    }
    
    this.socket = null;
    this.isConnected = false;
    this.isConnecting = false;
  }
  
  /**
   * Send a message to the WebSocket server
   */
  public send(type: string, event: string, data: any): boolean {
    if (!this.isConnected || !this.socket) {
      return false;
    }
    
    try {
      const message: WebSocketMessage = { type, event, data };
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }
  
  /**
   * Subscribe to WebSocket events
   */
  public subscribe(event: string, listener: MessageListener): () => void {
    if (!this.messageListeners.has(event)) {
      this.messageListeners.set(event, new Set());
    }
    
    this.messageListeners.get(event)?.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.messageListeners.get(event)?.delete(listener);
      if (this.messageListeners.get(event)?.size === 0) {
        this.messageListeners.delete(event);
      }
    };
  }
  
  /**
   * Add a connection listener
   */
  public addConnectionListener(
    event: 'connect' | 'disconnect' | 'error',
    listener: ConnectionListener | ((error: Event) => void)
  ): () => void {
    switch (event) {
      case 'connect':
        this.connectionListeners.onConnect.add(listener as ConnectionListener);
        return () => this.connectionListeners.onConnect.delete(listener as ConnectionListener);
      case 'disconnect':
        this.connectionListeners.onDisconnect.add(listener as ConnectionListener);
        return () => this.connectionListeners.onDisconnect.delete(listener as ConnectionListener);
      case 'error':
        this.connectionListeners.onError.add(listener as (error: Event) => void);
        return () => this.connectionListeners.onError.delete(listener as (error: Event) => void);
      default:
        return () => {};
    }
  }
  
  /**
   * Check if connected to WebSocket server
   */
  public isSocketConnected(): boolean {
    return this.isConnected;
  }
  
  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    console.log('WebSocket connected');
    this.isConnected = true;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    
    // Set up ping interval to keep connection alive
    this.pingInterval = setInterval(() => {
      this.send('ping', 'heartbeat', { timestamp: Date.now() });
    }, 30000); // Send ping every 30 seconds
    
    // Notify all connection listeners
    this.connectionListeners.onConnect.forEach((listener) => listener());
  }
  
  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: WebSocketMessageEvent): void {
    try {
      const payload = JSON.parse(event.data);
      
      // Handle ping response
      if (payload.type === 'pong') {
        return;
      }
      
      // Handle normal messages
      if (payload.event && this.messageListeners.has(payload.event)) {
        this.messageListeners.get(payload.event)?.forEach((listener) => {
          listener(payload.data);
        });
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }
  
  /**
   * Handle WebSocket close event
   */
  private handleClose(event: WebSocketCloseEvent): void {
    console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
    this.isConnected = false;
    this.isConnecting = false;
    this.clearTimers();
    
    // Notify all disconnect listeners
    this.connectionListeners.onDisconnect.forEach((listener) => listener());
    
    // Attempt to reconnect if appropriate
    this.attemptReconnect();
  }
  
  /**
   * Handle WebSocket error event
   */
  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    
    // Notify all error listeners
    this.connectionListeners.onError.forEach((listener) => listener(error));
  }
  
  /**
   * Attempt to reconnect to WebSocket server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Maximum reconnect attempts reached');
      return;
    }
    
    // Exponential backoff for reconnect
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }
  
  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
  
  /**
   * Get the authentication token for WebSocket connection
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      const apiService = ApiService.getInstance();
      const response = await apiService.get('/auth/token');
      return response.token;
    } catch (error) {
      console.error('Error getting auth token for WebSocket:', error);
      return null;
    }
  }
}

export { WebSocketService };
