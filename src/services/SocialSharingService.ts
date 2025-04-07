/**
 * SocialSharingService.ts
 * 
 * Service for handling social media sharing functionality.
 */

import { Challenge } from '@/types/Challenge';
import * as Linking from 'expo-linking';
import { Share, ShareAction, ShareContent, ShareOptions } from 'react-native';
import { EnvironmentalImpactService } from './EnvironmentalImpactService';

/**
 * Service for social media sharing
 */
export class SocialSharingService {
  /**
   * Share content using the native share dialog
   */
  static async shareContent(
    content: ShareContent,
    options?: ShareOptions
  ): Promise<ShareAction> {
    try {
      return await Share.share(content, options);
    } catch (error) {
      console.error('Error sharing content:', error);
      throw error;
    }
  }
  
  /**
   * Share a challenge with default message
   */
  static async shareChallenge(challenge: Challenge): Promise<ShareAction> {
    const challengeUrl = this.generateDeepLink('challenge', challenge.id);
    
    const content: ShareContent = {
      title: `Join me in the "${challenge.title}" challenge on EcoCart!`,
      message: `Join me in the "${challenge.title}" challenge on EcoCart!\n\n${challenge.description}\n\nLet's make a difference together!\n\n${challengeUrl}`,
    };
    
    return this.shareContent(content);
  }
  
  /**
   * Share environmental impact metrics
   */
  static async shareEnvironmentalImpact(
    metrics: {
      plasticSaved: number;
      co2Reduced: number;
      waterSaved: number;
    },
    timeframe: string = 'all-time'
  ): Promise<ShareAction> {
    const impactUrl = this.generateDeepLink('impact', timeframe);
    
    const content: ShareContent = {
      title: 'My Environmental Impact with EcoCart',
      message: `Check out my environmental impact with EcoCart!\n\n🌍 ${metrics.plasticSaved.toFixed(1)}kg of plastic saved\n🌱 ${metrics.co2Reduced.toFixed(1)}kg of CO2 reduced\n💧 ${metrics.waterSaved.toFixed(1)}L of water saved\n\nJoin me in making a difference!\n\n${impactUrl}`,
    };
    
    return this.shareContent(content);
  }
  
  /**
   * Share a collection achievement
   */
  static async shareCollection(
    materialType: string,
    weight: number,
    date: string
  ): Promise<ShareAction> {
    const metrics = EnvironmentalImpactService.calculateImpact(weight, materialType);
    const collectionUrl = this.generateDeepLink('collection', date);
    
    const content: ShareContent = {
      title: 'I Just Recycled with EcoCart!',
      message: `I just recycled ${weight.toFixed(1)}kg of ${materialType} with EcoCart!\n\nThis small action saved:\n🌍 ${metrics.co2Reduced.toFixed(1)}kg of CO2\n💧 ${metrics.waterConserved.toFixed(1)}L of water\n⚡ ${metrics.energySaved.toFixed(1)}kWh of energy\n\nSmall changes add up to big impact! Join me on EcoCart.\n\n${collectionUrl}`,
    };
    
    return this.shareContent(content);
  }
  
  /**
   * Share a badge or achievement
   */
  static async shareBadge(
    badgeName: string,
    badgeDescription: string
  ): Promise<ShareAction> {
    const badgeUrl = this.generateDeepLink('badge', badgeName);
    
    const content: ShareContent = {
      title: `I Earned the ${badgeName} Badge on EcoCart!`,
      message: `I just earned the ${badgeName} badge on EcoCart!\n\n${badgeDescription}\n\nJoin me in making sustainable choices!\n\n${badgeUrl}`,
    };
    
    return this.shareContent(content);
  }
  
  /**
   * Generate a deep link for the EcoCart app
   */
  private static generateDeepLink(
    type: 'challenge' | 'impact' | 'collection' | 'badge',
    id: string
  ): string {
    // Generate a deep link URL that can be used to open the app
    return Linking.createURL(`/${type}/${id}`);
  }
} 