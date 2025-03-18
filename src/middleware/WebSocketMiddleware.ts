import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { ErrorHandler } from '@/utils/ErrorHandler';
import {  MessageCompression  } from '@/utils/MessageHandling';
import {  MessageEncryption  } from '@/utils/MessageHandling';
import {  MessageValidation  } from '@/utils/MessageHandling';

interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface WebSocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  reconnectAttempts: number;
  lastMessageTime: number;
}

interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: number;
  userId?: string;
}

interface WebSocketSendAction extends AnyAction {
  type: 'websocket/send';
  payload: unknown;
}

interface WebSocketConnectAction extends AnyAction {
  type: 'websocket/connect';
}

type WebSocketAction = WebSocketSendAction | WebSocketConnectAction;

/**
 * Middleware for handling WebSocket communication with validation and processing
 */
export const createWebSocketMiddleware = (config: WebSocketConfig): Middleware => {
  let state: WebSocketState = {
    socket: null,
    isConnected: false,
    reconnectAttempts: 0,
    lastMessageTime: 0
  };

  const connect = (store: any) => {
    try {
      state.socket = new WebSocket(config.url);

      state.socket.onopen = () => {
        state.isConnected = true;
        state.reconnectAttempts = 0;
        store.dispatch({ type: 'websocket/connected' });
      };

      state.socket.onclose = () => {
        state.isConnected = false;
        store.dispatch({ type: 'websocket/disconnected' });
        handleReconnect(store);
      };

      state.socket.onmessage = async (event) => {
        try {
          const message = await processIncomingMessage(event.data);
          if (message) {
            store.dispatch({
              type: `websocket/message/${message.type}`,
              payload: message.payload
            });
          }
        } catch (error) {
          ErrorHandler.handleError(error instanceof Error ? error : new Error('Message processing failed'));
        }
      };

      state.socket.onerror = (event) => {
        const error = event instanceof Error ? event : new Error('WebSocket error');
        ErrorHandler.handleError(error);
        store.dispatch({ type: 'websocket/error', payload: error });
      };
    } catch (error) {
      const wsError = error instanceof Error ? error : new Error('WebSocket connection failed');
      ErrorHandler.handleError(wsError);
      handleReconnect(store);
    }
  };

  const handleReconnect = (store: any) => {
    const maxAttempts = config.maxReconnectAttempts ?? 5;
    const interval = config.reconnectInterval ?? 5000;

    if (state.reconnectAttempts < maxAttempts) {
      state.reconnectAttempts++;
      setTimeout(() => connect(store), interval);
    } else {
      store.dispatch({ type: 'websocket/reconnectFailed' });
    }
  };

  const processOutgoingMessage = async (message: unknown): Promise<string> => {
    try {
      // Validate message structure and content
      await MessageValidation.validateOutgoing(message);

      // Add timestamp if not present
      const timestampedMessage = {
        ...message as object,
        timestamp: Date.now()
      };

      // Convert to string
      const stringMessage = JSON.stringify(timestampedMessage);

      // Compress if needed
      const compressedMessage = await MessageCompression.compress(stringMessage);
      const compressedString = typeof compressedMessage === 'string' 
        ? compressedMessage 
        : compressedMessage.data;

      // Encrypt the message
      return MessageEncryption.encrypt(compressedString);
    } catch (error) {
      const processError = error instanceof Error ? error : new Error('Message processing failed');
      ErrorHandler.handleError(processError);
      throw processError;
    }
  };

  const processIncomingMessage = async (data: string): Promise<WebSocketMessage | null> => {
    try {
      // Decrypt the message
      const decrypted = await MessageEncryption.decrypt(data);

      // Decompress if needed
      const decompressed = await MessageCompression.decompress(decrypted);

      // Parse the message
      const message = JSON.parse(decompressed) as WebSocketMessage;

      // Validate the message
      await MessageValidation.validateIncoming(message);

      // Update last message time
      state.lastMessageTime = Date.now();

      return message;
    } catch (error) {
      const processError = error instanceof Error ? error : new Error('Message processing failed');
      ErrorHandler.handleError(processError);
      return null;
    }
  };

  return (store: MiddlewareAPI) => 
    (next: Dispatch) => 
    async (action: WebSocketAction) => {
      if (action.type === 'websocket/connect') {
        connect(store);
        return next(action);
      }

      if (action.type === 'websocket/send' && state.isConnected && state.socket) {
        try {
          const processedMessage = await processOutgoingMessage(action.payload);
          state.socket.send(processedMessage);
        } catch (error) {
          const sendError = error instanceof Error ? error : new Error('Message send failed');
          ErrorHandler.handleError(sendError);
        }
      }

      return next(action);
    };
}; 