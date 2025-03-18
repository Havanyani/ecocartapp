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