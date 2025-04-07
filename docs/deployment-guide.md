# EcoCart Deployment Guide

This guide provides a comprehensive overview of the deployment process for the EcoCart app, covering CI/CD, OTA updates, environment configuration, and app store submission.

## Table of Contents

1. [Deployment Architecture](#deployment-architecture)
2. [App Architecture with Expo Router](#app-architecture-with-expo-router)
3. [Environment Setup](#environment-setup)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [OTA Updates](#ota-updates)
6. [App Stores Deployment](#app-stores-deployment)
7. [Monitoring and Rollbacks](#monitoring-and-rollbacks)
8. [Release Checklist](#release-checklist)

## Deployment Architecture

EcoCart uses a multi-environment deployment architecture:

- **Development**: For ongoing development work
- **Staging**: For QA testing and stakeholder reviews
- **Production**: Live environment for end users

Each environment has its own:
- API endpoints
- Configuration values
- Release channels for OTA updates
- Database instances

## App Architecture with Expo Router

EcoCart uses Expo Router for navigation and routing, which affects how the app is structured and deployed:

### File-Based Routing

- Routes are defined by the file structure in the `./app` directory
- Each file in this directory becomes a route in the application
- Dynamic routes are created using files and directories with special naming (e.g., `[id].tsx`)

### Key Files and Their Purpose

- `src/App.tsx`: Simplified entry point that imports 'expo-router/entry'
- `app/_layout.tsx`: Root layout that wraps the entire app and initializes services
- `app/(tabs)/_layout.tsx`: Layout for the tab navigator
- `app/(tabs)/index.tsx`: Home screen - the first screen users see in the tabs
- `app/[...unmatched].tsx`: Catch-all route for handling 404 pages

### Important Note About app.json

While Expo Router uses the `./app` directory for routing, `app.json` is **still required** for:
- Native code configurations
- Expo Go and EAS Build configurations
- OTA update settings
- Plugin configurations
- App metadata for store submissions

### Relationship Between Expo Router and OTA Updates

When using Expo Router with OTA updates:
1. Updates are still configured in `app.json` under the `updates` key
2. Update channels are specified in `eas.json` build profiles
3. The UpdatesService works the same way but is initialized in `app/_layout.tsx`

### Service Initialization

With Expo Router, services like OTA updates are initialized in the root layout:

```typescript
// In app/_layout.tsx
useEffect(() => {
  // Initialize OTA updates
  initializeUpdates();
  
  // Other initializations
}, []);
```

## Environment Setup

### Prerequisites

- Node.js v18 or higher
- Expo CLI: `npm install -g eas-cli`
- GitHub account with access to the EcoCart repository
- Expo account with access to the EcoCart project
- Apple Developer account (for iOS deployment)
- Google Play Developer account (for Android deployment)

### Environment Variables

The app uses environment-specific configuration defined in `src/config/environments.ts`. Each build profile in `eas.json` specifies environment variables that are injected at build time.

To add a new environment variable:

1. Add it to the appropriate build profile in `eas.json`
2. Update the `Environment` type in `src/config/environments.ts`
3. Use it in your code via the `environment` object

Example:
```typescript
// In src/config/environments.ts
type Environment = {
  // existing properties
  newVariable: string;
};

// In your code
import { environment } from '../config/environments';
console.log(environment.newVariable);
```

## CI/CD Pipeline

EcoCart uses GitHub Actions for continuous integration and Expo Application Services (EAS) for continuous deployment.

### Workflow Configuration

The CI/CD pipeline is defined in `.github/workflows/main.yml` and includes:

1. **Lint and Test**: Runs on all pull requests and pushes to main/develop
2. **Build Android**: Builds Android app for the appropriate environment
3. **Build iOS**: Builds iOS app for the appropriate environment
4. **Deploy Updates**: Publishes OTA updates for the appropriate channel

### Manual Deployment

You can trigger a manual deployment from GitHub Actions:

1. Go to the Actions tab in the GitHub repository
2. Select the "EcoCart CI/CD" workflow
3. Click "Run workflow"
4. Select the branch and environment
5. Click "Run workflow"

### Local Builds

To build the app locally for testing:

```bash
# Development build
eas build --profile development --platform all

# Staging build
eas build --profile staging --platform all

# Production build
eas build --profile production --platform all
```

## OTA Updates

EcoCart uses Expo Updates for over-the-air updates, allowing you to update JavaScript and asset bundles without republishing to app stores.

### Publishing Updates

To publish an update:

```bash
# Development update
eas update --channel development

# Staging update
eas update --channel staging

# Production update
eas update --channel production
```

Updates are also automatically published by the CI/CD pipeline when changes are pushed to the develop or main branches.

### Update Service

The app includes an UpdatesService (`src/services/UpdatesService.ts`) that checks for and applies updates. Key features:

- Automatic update checks on app startup
- User-prompted update installation
- Graceful error handling
- Customizable update behavior per environment

### Rolling Back Updates

If an update causes issues, you can roll back to a previous version:

```bash
# List update history
eas update:list

# Roll back to a specific update
eas update:rollback --channel production --id update-id
```

## App Stores Deployment

### iOS App Store

1. **Prepare app for submission**:
   ```bash
   eas build --platform ios --profile production
   ```

2. **Submit to App Store Connect**:
   ```bash
   eas submit --platform ios --profile production
   ```

3. **Complete App Store Connect information**:
   - Log in to [App Store Connect](https://appstoreconnect.apple.com)
   - Navigate to your app
   - Complete all required metadata (using files from `app-store-assets/metadata/`)
   - Add screenshots from `app-store-assets/screenshots/ios/`
   - Set up app pricing and availability
   - Submit for review

### Google Play Store

1. **Prepare app for submission**:
   ```bash
   eas build --platform android --profile production
   ```

2. **Submit to Google Play**:
   ```bash
   eas submit --platform android --profile production
   ```

3. **Complete Google Play Console information**:
   - Log in to [Google Play Console](https://play.google.com/console)
   - Navigate to your app
   - Complete all required metadata (using files from `app-store-assets/metadata/`)
   - Add screenshots from `app-store-assets/screenshots/android/`
   - Set up app pricing and availability
   - Submit for review

### App Store Assets

All assets required for app store submissions are located in the `app-store-assets/` directory. This includes:

- App icons
- Screenshots
- Promotional graphics
- Metadata (descriptions, keywords, etc.)

## Monitoring and Rollbacks

### Performance Monitoring

EcoCart uses Sentry for monitoring app performance and errors. Key metrics to monitor:

- Crash-free session rate
- App load time
- API response times
- OTA update success rate

To access Sentry:
1. Log in to [Sentry](https://sentry.io)
2. Navigate to the EcoCart project
3. View dashboards and alerts

### Error Alerts

Sentry is configured to send alerts for:
- New error types
- Spike in error rates
- Regression in performance
- Crash rate exceeding thresholds

### Emergency Rollbacks

If a critical issue is detected:

1. **Roll back OTA update**:
   ```bash
   eas update:rollback --channel production
   ```

2. **For app store releases**:
   - iOS: Use App Store Connect to halt the rollout or revert to a previous version
   - Android: Use Google Play Console to halt the rollout or revert to a previous version

## Release Checklist

Use this checklist for each production release:

### Pre-Release:

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed
- [ ] Security audit passed
- [ ] Accessibility testing completed
- [ ] Backward compatibility verified
- [ ] Performance benchmarks met

### Release:

- [ ] Version numbers updated (app.json, package.json)
- [ ] Changelog/release notes updated
- [ ] Production build generated and tested
- [ ] App store screenshots updated (if UI changed)
- [ ] App store metadata updated

### Post-Release:

- [ ] Monitor Sentry for new errors
- [ ] Verify OTA update mechanism
- [ ] User feedback analysis
- [ ] Performance metrics review

## Support

For deployment issues or questions, contact:
- DevOps Team: devops@ecocart.com
- Mobile Engineering Lead: mobile-lead@ecocart.com

# App Store Submission and Deployment Guide

This document outlines the required steps to prepare EcoCart for submission to the App Store (iOS) and Google Play Store (Android).

## 1. App Metadata Preparation

All metadata files are stored in the `app-store-assets/metadata` directory:

- **App Name**: "EcoCart - Recycling Rewards"
- **Short Description**: A concise description already prepared in `short-description.txt`
- **Long Description**: A detailed description already prepared in `long-description.txt`
- **Keywords**: SEO-optimized keywords in `keywords.txt`
- **What's New**: Release notes for updates in `whats-new.txt`

## 2. Visual Assets Requirements

### iOS Screenshots
Screenshots should be captured for each supported device size:
- iPhone 13 Pro / 14 Pro (1170 × 2532)
- iPhone 13 Pro Max / 14 Pro Max (1284 × 2778)
- iPhone 8 Plus (1242 × 2208)
- iPad Pro (2048 × 2732)

Store these in `app-store-assets/screenshots/ios` with descriptive filenames.

### Android Screenshots
Screenshots should be captured for these device sizes:
- Phone (1080 × 1920)
- 7-inch tablet (1080 × 1920)
- 10-inch tablet (1920 × 1200)

Store these in `app-store-assets/screenshots/android` with descriptive filenames.

### App Icons
Ensure all required app icons are generated:
- iOS: The App Store requires a 1024×1024 pixel icon
- Android: Google Play requires a 512×512 pixel icon

Our icon source is located at `./assets/icon.png` and should be high resolution.

## 3. Technical Requirements

### iOS Specific Requirements
- **Privacy Policy URL**: Required for App Store
- **App Review Information**: Test account credentials if needed
- **Age Rating**: Select appropriate content ratings
- **App Store Category**: Environment & Recycling

### Android Specific Requirements
- **Content Rating**: Complete the content rating questionnaire
- **Target Audience**: Age range for your app
- **Privacy Policy URL**: Required for all apps

## 4. Building App Bundles

### iOS Build (App Store)
```bash
# Build for iOS distribution
npx expo build:ios --type archive
```

### Android Build (Google Play)
```bash
# Build for Android distribution
npx expo build:android --type app-bundle
```

## 5. Testing Before Submission

- Run the app on multiple physical devices
- Test core functionalities:
  - Collection scheduling
  - User registration/login
  - Push notifications
  - Location tracking
  - Rewards system
  - Community features
- Check for accessibility compliance
- Review analytics integration
- Test offline functionality
- Verify correct API endpoints (prod vs dev)

## 6. App Store Submission Process

### iOS Submission Steps
1. Log in to App Store Connect
2. Create a new app or new version
3. Upload the build via Application Loader or Xcode
4. Complete all metadata sections
5. Submit for review

### Google Play Submission Steps
1. Log in to Google Play Console
2. Create a new app or release
3. Upload the AAB (Android App Bundle)
4. Complete the store listing
5. Set up pricing and distribution
6. Submit for review

## 7. Post-Submission

- Monitor review status
- Be prepared to respond to reviewer questions
- Have a plan for addressing any issues flagged during review

## 8. Next Steps in Release Pipeline

- Set up automated build process with CI/CD
- Implement phased rollout strategy
- Plan for beta testing future releases
- Document analytics tracking for new installs

## Checklist Before Submission

- [ ] App metadata complete and proofread
- [ ] Screenshots captured for all required device sizes
- [ ] App icons generated in all required sizes
- [ ] App successfully builds for both platforms
- [ ] All features tested on physical devices
- [ ] Privacy policy updated and accessible
- [ ] Analytics correctly implemented
- [ ] Crash reporting in place
- [ ] Accessibility features verified
- [ ] App complies with store guidelines

# EcoCart App Store Submission Guide

This guide outlines the steps required to prepare and submit EcoCart to both the Apple App Store and Google Play Store.

## App Metadata Preparation

All metadata files are stored in the `app-store-assets/metadata` directory:

- **App Name**: EcoCart
- **Short Description** (80 characters max): An eco-friendly recycling and waste collection platform that rewards sustainable choices.
- **Long Description**: Complete app description in `app-store-assets/metadata/description.md`
- **Keywords**: recycling, sustainability, eco-friendly, waste management, rewards, green living
- **Release Notes**: Update in `app-store-assets/metadata/release-notes.md` before each submission
- **Privacy Policy**: Available at `app-store-assets/metadata/privacy-policy.md`

## Visual Assets Requirements

### Screenshots

Take screenshots showcasing the core features of the app:

#### iOS Screenshot Requirements
- **iPhone 13/14 Pro** (1170 x 2532 pixels)
- **iPhone 8 Plus/7 Plus** (1242 x 2208 pixels)
- **iPad Pro** (2048 x 2732 pixels)

Store screenshots in: `app-store-assets/screenshots/ios`

#### Android Screenshot Requirements
- **Phone** (1080 x 1920 pixels)
- **7-inch Tablet** (1200 x 1920 pixels)
- **10-inch Tablet** (1920 x 1200 pixels)

Store screenshots in: `app-store-assets/screenshots/android`

### App Icons

Run the icon generator script to create all required icon sizes:

```bash
npm run generate-icons
```

This will create icons in:
- `app-store-assets/images/ios` - iOS app icons
- `app-store-assets/images/android` - Android app icons
- `app-store-assets/images/app-store` - Store listing icons

## Technical Requirements

### iOS Requirements
- **Bundle Identifier**: org.ecocart.app
- **App Category**: Utilities, Lifestyle
- **Minimum iOS Version**: 14.0
- **Device Support**: iPhone, iPad
- **App Review Information**: Provide test account credentials in `app-store-assets/metadata/test-accounts.md`
- **Export Compliance**: No encryption used

### Android Requirements
- **Package Name**: org.ecocart.app
- **Minimum Android Version**: API Level 26 (Android 8.0)
- **Target SDK**: API Level 34 (Android 14)
- **Content Rating**: Fill out the questionnaire in Google Play Console (likely E for Everyone)
- **Privacy Policy URL**: Link to hosted privacy policy document
- **Target Audience**: All ages, but primarily adults

## Building App Bundles

### iOS Build
```bash
npm run prebuild-ios
npm run build-ios
```

### Android Build
```bash
npm run prebuild-android
npm run build-android
```

Alternatively, use the combined script:
```bash
npm run app-store-build
```

## Testing Before Submission

Before submission, test the production build on physical devices:

1. **Functionality Testing**:
   - Test all core features: registration, login, requesting pickups, order tracking
   - Test all forms and inputs
   - Verify push notifications work correctly
   - Test payment functionality if applicable

2. **Performance Testing**:
   - Check app startup time
   - Verify smooth animations
   - Test with slow network conditions

3. **Compatibility Testing**:
   - Test on different iOS/Android versions
   - Test on different device sizes

4. **Accessibility**:
   - Verify VoiceOver/TalkBack compatibility
   - Check contrast ratios and text sizes

5. **Backend Integration**:
   - Verify all API endpoints connect correctly in production mode
   - Check error handling for API failures

## App Store Submission Process

### App Store (iOS)

1. Log in to [App Store Connect](https://appstoreconnect.apple.com/)
2. Navigate to "My Apps" and select "EcoCart" (or create a new app)
3. Complete all required metadata fields
4. Upload screenshots for all required device sizes
5. Upload the build (.ipa file) from EAS
6. Complete the "App Review Information" section
7. Set up pricing and availability
8. Submit for review

### Google Play Console (Android)

1. Log in to [Google Play Console](https://play.google.com/console/)
2. Navigate to "All apps" and select "EcoCart" (or create a new app)
3. Complete the store listing with descriptions, screenshots, and feature graphic
4. Set up content rating by completing the questionnaire
5. Configure pricing and distribution
6. Upload the build (.aab file) from EAS
7. Review and submit app for review

## Post-Submission

After submitting your app:

1. **Monitor Review Status**: Check App Store Connect or Google Play Console daily
2. **Address Reviewer Questions**: Be ready to respond quickly to any questions
3. **Prepare for Quick Updates**: Have a plan to address any issues that come up during review

## Next Steps in Release Pipeline

- **Set Up Automated Builds**: Configure CI/CD for automated builds
- **Phased Rollout**: Consider using phased rollout for Android releases
- **Beta Testing**: Set up TestFlight for iOS and Open Testing for Android for future updates
- **Analytics Integration**: Ensure analytics are capturing key user journeys

## Checklist Before Submission

- [ ] App metadata complete and proofread
- [ ] Screenshots prepared for all required devices
- [ ] App icon generated in all required sizes
- [ ] App passes internal QA testing
- [ ] Privacy policy is complete and accessible
- [ ] Test accounts prepared for reviewers
- [ ] Version numbers and build numbers are correct
- [ ] All app store guidelines reviewed for compliance
- [ ] Backend services configured for production
- [ ] Push notification certificates in place (if applicable)
- [ ] Analytics and crash reporting configured correctly 