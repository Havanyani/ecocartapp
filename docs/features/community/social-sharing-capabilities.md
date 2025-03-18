# Social Sharing Capabilities

## Overview
The Social Sharing Capabilities feature enables users to share their recycling activities, achievements, and environmental impact across various social media platforms. This integration promotes community engagement, raises environmental awareness, and encourages sustainable behaviors through social influence and positive reinforcement.

## User-Facing Functionality
- **Multi-Platform Sharing**: Direct integration with Facebook, Twitter, Instagram, WhatsApp, and other social platforms
- **Custom Share Content**: User-customizable messages, images, and metrics to include in shared content
- **Share Triggers**: Strategic sharing opportunities throughout the app (achievements, milestones, collections)
- **Share Preview**: Preview of content before sharing with ability to edit and customize
- **Social Feed Integration**: Display of shared content from friends and community within the app
- **Share Analytics**: Tracking of shares, engagement, and resulting app referrals
- **Privacy Controls**: User settings to control what information is shared and with whom

## Technical Implementation

### Architecture
- **Design Pattern(s)**: Adapter Pattern for platform-specific integrations, Factory Pattern for content generation
- **Key Components**: 
  - `SocialSharingService`: Core service handling share requests across platforms
  - `PlatformAdapter`: Platform-specific implementations for sharing functionality
  - `ShareContentGenerator`: Creates and formats content for sharing
- **Dependencies**: 
  - React Native Share API
  - Expo Sharing
  - Platform-specific SDKs (Facebook SDK, Twitter Kit, etc.)
  - ViewShot for content capture

### Code Structure
```typescript
// Platform types supported for sharing
type SocialPlatform = 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'email' | 'generic';

// Configuration for share content
interface ShareOptions {
  title?: string;
  message: string;
  url?: string;
  imageUrl?: string;
  hashtags?: string[];
  platformSpecific?: {
    [key in SocialPlatform]?: any;
  };
}

// Share result interface
interface ShareResult {
  platform: SocialPlatform;
  success: boolean;
  error?: string;
  metrics?: {
    impressions?: number;
    engagements?: number;
  };
}

// Example of the social sharing service implementation
class SocialSharingService {
  private static instance: SocialSharingService;
  private adapters: Map<SocialPlatform, PlatformAdapter> = new Map();
  
  private constructor() {
    // Initialize adapters for each platform
    this.adapters.set('facebook', new FacebookAdapter());
    this.adapters.set('twitter', new TwitterAdapter());
    this.adapters.set('instagram', new InstagramAdapter());
    this.adapters.set('whatsapp', new WhatsAppAdapter());
    this.adapters.set('email', new EmailAdapter());
    this.adapters.set('generic', new GenericShareAdapter());
  }
  
  static getInstance(): SocialSharingService {
    if (!SocialSharingService.instance) {
      SocialSharingService.instance = new SocialSharingService();
    }
    return SocialSharingService.instance;
  }
  
  async share(content: ShareOptions, platform?: SocialPlatform): Promise<ShareResult> {
    try {
      // If platform is specified, use that specific adapter
      if (platform && this.adapters.has(platform)) {
        const adapter = this.adapters.get(platform)!;
        const result = await adapter.share(content);
        
        // Log sharing activity
        await this.logShareActivity(platform, content, result);
        
        return result;
      }
      
      // Otherwise, use generic share sheet
      const genericAdapter = this.adapters.get('generic')!;
      const result = await genericAdapter.share(content);
      
      // Log sharing activity
      await this.logShareActivity('generic', content, result);
      
      return result;
    } catch (error) {
      console.error('Error sharing content:', error);
      return {
        platform: platform || 'generic',
        success: false,
        error: error.message
      };
    }
  }
  
  private async logShareActivity(
    platform: SocialPlatform, 
    content: ShareOptions, 
    result: ShareResult
  ): Promise<void> {
    try {
      await AnalyticsService.logEvent('content_shared', {
        platform,
        success: result.success,
        contentType: content.imageUrl ? 'image_with_text' : 'text_only',
        hasUrl: !!content.url,
        hashtags: content.hashtags?.join(',')
      });
    } catch (error) {
      console.warn('Failed to log share activity', error);
    }
  }
}

// Usage example
async function shareAchievement(achievement: Achievement): Promise<void> {
  const sharingService = SocialSharingService.getInstance();
  
  // Generate share content based on achievement
  const content = ShareContentGenerator.forAchievement(achievement);
  
  // Generate image from a component
  const imageUri = await ViewShot.captureRef(achievementCardRef, {
    format: 'jpg',
    quality: 0.9
  });
  
  // Add image to content
  content.imageUrl = imageUri;
  
  // Show platform selection or share directly
  const selectedPlatform = await PlatformSelectorModal.show();
  if (selectedPlatform) {
    await sharingService.share(content, selectedPlatform);
  }
}
```

### Key Files
- `src/services/SocialSharingService.ts`: Main service handling sharing across platforms
- `src/adapters/PlatformAdapters.ts`: Platform-specific sharing implementations
- `src/components/sharing/ShareContentGenerator.tsx`: Utility for generating share content
- `src/components/sharing/PlatformSelector.tsx`: UI for selecting sharing platform
- `src/hooks/useSocialSharing.ts`: Custom hook for sharing functionality

## Integration Points
- **Related Features**: 
  - Environmental impact sharing
  - User profiles and achievements
  - Community challenges
- **API Endpoints**: 
  - `POST /api/analytics/shares`: Logs sharing activity for analytics
  - `GET /api/social/content/{user_id}`: Retrieves shareable content for a user
- **State Management**: 
  - Redux slice for share history and analytics
  - Context API for platform-specific settings

## Performance Considerations
- **Optimization Techniques**: 
  - Lazy loading of platform SDKs
  - Image compression before sharing
  - Content pre-generation for common share scenarios
- **Potential Bottlenecks**: 
  - Complex image generation for share cards
  - Platform API throttling and rate limits
  - Large image handling on low-end devices
- **Battery/Resource Impact**: 
  - Minimal since sharing is an infrequent, user-initiated action
  - Platform SDKs only loaded when needed

## Testing Strategy
- **Unit Tests**: 
  - Service methods and adapter functionality
  - Content generation utilities
  - Image capture performance
- **Integration Tests**: 
  - End-to-end sharing flow with mock adapters
  - Platform SDK integration verification
  - Analytics logging validation
- **Mock Data**: 
  - Sample achievements and content for testing
  - Simulated platform responses
  - Error scenarios and edge cases

## Accessibility
- **Keyboard Navigation**: 
  - Tab focus for all sharing controls
  - Platform selector accessible via keyboard
  - Keyboard shortcuts for common sharing actions
- **Screen Reader Compatibility**: 
  - ARIA labels for sharing buttons and controls
  - Descriptive text for share content
  - Announcement of sharing process steps
- **Color Contrast**: 
  - Platform icons with high contrast
  - Text overlay on share images with sufficient contrast
  - Alternative text-only sharing options

## Future Improvements
- Implement deep linking for better cross-app integration
- Add scheduling capabilities for optimal sharing times
- Develop AI-generated share captions based on content
- Create share-to-earn rewards for active social promoters
- Implement cross-platform analytics for engagement tracking

## Related Documentation
- [Environmental Impact Sharing](./environmental-impact-sharing.md)
- [Community Challenges](./community-challenges.md)
- [User Profiles and Achievements](./user-profiles-achievements.md) 