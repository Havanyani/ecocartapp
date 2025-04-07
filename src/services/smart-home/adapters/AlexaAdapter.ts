/**
 * AlexaAdapter.ts
 * 
 * Adapter for Amazon Alexa integration.
 * Provides methods for linking accounts, handling voice commands,
 * and managing Alexa devices.
 */

import { Linking } from 'react-native';
import { PlatformLinkResult, VoicePlatform } from '../SmartHomeService';

/**
 * Adapter for Amazon Alexa integration
 */
export class AlexaAdapter {
  private isLinked: boolean = false;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;
  
  // Constants for OAuth and API endpoints
  private static OAUTH_ENDPOINT = 'https://oauth.ecocart.com/alexa'; // Placeholder
  private static API_ENDPOINT = 'https://api.ecocart.com/alexa';     // Placeholder
  
  constructor() {
    // Initialization logic
  }
  
  /**
   * Start the linking process with Alexa
   */
  public async startLinking(): Promise<PlatformLinkResult> {
    try {
      // Create OAuth URL with state parameter for security
      const state = this.generateRandomState();
      const redirectUri = 'ecocart://oauth/alexa/callback';
      
      const oauthUrl = `${AlexaAdapter.OAUTH_ENDPOINT}?` +
        `client_id=${encodeURIComponent('ecocart-app')}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('alexa:smart_home')}` +
        `&state=${encodeURIComponent(state)}`;
      
      // Store state for validation on callback
      await this.storeState(state);
      
      // Check if we can open URLs
      const canOpen = await Linking.canOpenURL(oauthUrl);
      if (!canOpen) {
        return {
          success: false,
          platform: VoicePlatform.ALEXA,
          error: 'Cannot open OAuth URL'
        };
      }
      
      // Open OAuth URL
      await Linking.openURL(oauthUrl);
      
      return {
        success: true,
        platform: VoicePlatform.ALEXA,
        redirectUrl: oauthUrl
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[AlexaAdapter] Start linking error:', errorMessage);
      
      return {
        success: false,
        platform: VoicePlatform.ALEXA,
        error: errorMessage
      };
    }
  }
  
  /**
   * Handle the OAuth callback
   */
  public async handleOAuthCallback(url: string): Promise<boolean> {
    try {
      // Parse URL to get authorization code and state
      const parsedUrl = new URL(url);
      const code = parsedUrl.searchParams.get('code');
      const state = parsedUrl.searchParams.get('state');
      
      if (!code) {
        console.error('[AlexaAdapter] No authorization code in callback URL');
        return false;
      }
      
      // Validate state parameter
      const storedState = await this.getStoredState();
      if (state !== storedState) {
        console.error('[AlexaAdapter] State mismatch in callback URL');
        return false;
      }
      
      // Exchange code for tokens
      const tokenResponse = await this.exchangeCodeForTokens(code);
      
      // Store tokens
      this.accessToken = tokenResponse.access_token;
      this.refreshToken = tokenResponse.refresh_token;
      this.tokenExpiry = Date.now() + (tokenResponse.expires_in * 1000);
      this.isLinked = true;
      
      // Clear stored state
      await this.clearStoredState();
      
      return true;
    } catch (error) {
      console.error('[AlexaAdapter] OAuth callback error:', error);
      return false;
    }
  }
  
  /**
   * Unlink from Alexa
   */
  public async unlink(): Promise<boolean> {
    try {
      if (!this.isLinked || !this.accessToken) {
        return true; // Already unlinked
      }
      
      // Call Alexa API to revoke token
      const response = await fetch(`${AlexaAdapter.API_ENDPOINT}/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      if (!response.ok) {
        console.error('[AlexaAdapter] Failed to revoke token:', await response.text());
        // Continue anyway to clear local tokens
      }
      
      // Clear tokens
      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiry = null;
      this.isLinked = false;
      
      return true;
    } catch (error) {
      console.error('[AlexaAdapter] Unlink error:', error);
      
      // Even if API call fails, clear local tokens
      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiry = null;
      this.isLinked = false;
      
      return false;
    }
  }
  
  /**
   * Check if the adapter is linked
   */
  public isAdapterLinked(): boolean {
    return this.isLinked && !!this.accessToken;
  }
  
  /**
   * Process a voice command
   * This would be called from a webhook handler for Alexa Skills
   */
  public async processVoiceCommand(command: any): Promise<any> {
    try {
      // Extract intent and slots from Alexa request
      const intentName = command.request?.intent?.name;
      const slots = command.request?.intent?.slots || {};
      
      // Map to common format for processing
      const intentRequest = {
        intent: {
          name: intentName
        },
        parameters: this.extractSlotValues(slots)
      };
      
      // Process based on intent
      let response;
      switch (intentName) {
        case 'GetRecyclingScheduleIntent':
          response = await this.handleGetRecyclingScheduleIntent(intentRequest);
          break;
        case 'AddRecyclableItemIntent':
          response = await this.handleAddRecyclableItemIntent(intentRequest);
          break;
        case 'GetEcoPointsIntent':
          response = await this.handleGetEcoPointsIntent(intentRequest);
          break;
        default:
          response = {
            speech: "I'm sorry, I don't understand that command yet."
          };
      }
      
      // Format for Alexa response
      return this.formatAlexaResponse(response.speech);
    } catch (error) {
      console.error('[AlexaAdapter] Process voice command error:', error);
      
      return this.formatAlexaResponse(
        "I'm sorry, I encountered an error while processing your request."
      );
    }
  }
  
  /**
   * Extract slot values from Alexa intent slots
   */
  private extractSlotValues(slots: Record<string, any>): Record<string, any> {
    const parameters: Record<string, any> = {};
    
    for (const [key, slot] of Object.entries(slots)) {
      if (slot && typeof slot === 'object' && 'value' in slot) {
        parameters[key.toLowerCase()] = slot.value;
      }
    }
    
    return parameters;
  }
  
  /**
   * Format response for Alexa
   */
  private formatAlexaResponse(speechText: string): any {
    return {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: speechText
        },
        shouldEndSession: true
      }
    };
  }
  
  /**
   * Handle the GetRecyclingSchedule intent
   */
  private async handleGetRecyclingScheduleIntent(intentRequest: any): Promise<any> {
    // Placeholder implementation
    return {
      speech: "Your next recycling pickup is scheduled for this Friday at 9 AM."
    };
  }
  
  /**
   * Handle the AddRecyclableItem intent
   */
  private async handleAddRecyclableItemIntent(intentRequest: any): Promise<any> {
    const item = intentRequest.parameters?.item;
    
    if (!item) {
      return {
        speech: "What item would you like to add to your recycling list?"
      };
    }
    
    // Placeholder implementation
    return {
      speech: `I've added ${item} to your recycling list.`
    };
  }
  
  /**
   * Handle the GetEcoPoints intent
   */
  private async handleGetEcoPointsIntent(intentRequest: any): Promise<any> {
    // Placeholder implementation
    return {
      speech: "You have earned 250 EcoPoints this month. Great job!"
    };
  }
  
  /**
   * Generate a random state parameter for OAuth security
   */
  private generateRandomState(): string {
    const array = new Uint8Array(16);
    globalThis.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Store state parameter for OAuth security
   */
  private async storeState(state: string): Promise<void> {
    // Placeholder implementation
    // In a real app, this would securely store the state, possibly using AsyncStorage
    (this as any).storedState = state;
  }
  
  /**
   * Get stored state parameter
   */
  private async getStoredState(): Promise<string | null> {
    // Placeholder implementation
    return (this as any).storedState || null;
  }
  
  /**
   * Clear stored state parameter
   */
  private async clearStoredState(): Promise<void> {
    // Placeholder implementation
    delete (this as any).storedState;
  }
  
  /**
   * Exchange authorization code for access and refresh tokens
   */
  private async exchangeCodeForTokens(code: string): Promise<any> {
    // Placeholder implementation
    // In a real app, this would make an API call to exchange the code for tokens
    
    return {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      expires_in: 3600 // 1 hour
    };
  }
  
  /**
   * Refresh the access token
   */
  private async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.refreshToken) {
        return false;
      }
      
      // Placeholder implementation
      // In a real app, this would make an API call to refresh the token
      
      this.accessToken = 'new_mock_access_token';
      this.tokenExpiry = Date.now() + (3600 * 1000); // 1 hour
      
      return true;
    } catch (error) {
      console.error('[AlexaAdapter] Refresh token error:', error);
      return false;
    }
  }
  
  /**
   * Get a valid access token, refreshing if necessary
   */
  private async getValidAccessToken(): Promise<string | null> {
    if (!this.isLinked || !this.accessToken) {
      return null;
    }
    
    // Check if token is expired or about to expire (within 5 minutes)
    const tokenExpiresSoon = this.tokenExpiry !== null && 
      this.tokenExpiry < (Date.now() + (5 * 60 * 1000));
    
    if (tokenExpiresSoon) {
      const refreshSuccess = await this.refreshAccessToken();
      if (!refreshSuccess) {
        return null;
      }
    }
    
    return this.accessToken;
  }
} 