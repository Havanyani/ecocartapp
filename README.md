# EcoCart - Recycling Rewards App

EcoCart is a sustainability-focused application that helps users schedule plastic waste collection alongside grocery deliveries, track collected materials, earn credits, and redeem rewards. The app is built with cross-platform support for iOS, Android, and Web.

## Project Architecture

EcoCart is built using:
- **React Native** with **TypeScript** for cross-platform mobile and web development
- **Expo** for streamlined development, testing, and deployment
- **Expo Router** for file-based navigation and routing
- **Redux** with hooks for global state management
- **Context API** for theme and feature-specific state
- **MMKV/AsyncStorage** for efficient cross-platform data persistence
- **React Native Reanimated** for smooth animations
- **Zod** for data validation
- **Jest** for comprehensive testing (unit, integration, E2E)
- **Sentry** for error reporting and monitoring

## File Structure

```
ecocartapp/
├── app/                      # Expo Router file-based navigation
│   ├── _layout.tsx           # Root layout and initialization
│   ├── (tabs)/               # Tab-based navigation group
│   │   ├── _layout.tsx       # Tab navigator configuration
│   │   ├── index.tsx         # Home tab screen
│   │   ├── materials/        # Materials section
│   │   │   ├── _layout.tsx   # Materials layout
│   │   │   ├── index.tsx     # Materials list screen
│   │   │   └── [id].tsx      # Material detail screen
│   │   ├── collections/      # Collections section
│   │   ├── storage/          # Storage section
│   │   ├── rewards.tsx       # Rewards tab screen
│   │   └── profile/          # User profile section
│   ├── community/            # Community section
│   │   ├── _layout.tsx       # Community layout
│   │   ├── index.tsx         # Community main screen
│   │   ├── challenge.tsx     # Community challenge screen
│   │   └── events.tsx        # Community events screen
│   ├── profile.tsx           # Main profile screen
│   └── [...unmatched].tsx    # 404 not found page
├── src/                      # Source code
│   ├── components/           # Reusable UI components
│   │   ├── ui/               # UI primitives
│   │   ├── collection/       # Collection-related components
│   │   ├── sustainability/   # Sustainability components
│   │   └── ThemeSwitcher.tsx # Theme switching component
│   ├── services/             # Business logic services
│   │   ├── EnhancedStorageService.ts # Storage service
│   │   ├── SyncService.ts    # Data synchronization
│   │   └── ApiService.ts     # API communication
│   ├── contexts/             # React Context providers
│   ├── hooks/                # Custom React hooks
│   ├── store/                # Redux store and slices
│   ├── utils/                # Utility functions
│   │   └── webPatches.ts     # Web-specific patches
│   └── types/                # TypeScript type definitions
├── assets/                   # Static assets (images, fonts)
├── babel.config.js           # Babel configuration
├── app.json                  # Expo configuration
├── metro.config.js           # Metro bundler configuration
├── index.js                  # Entry point for Expo Router
└── package.json              # Dependencies and scripts
```

## Storage Strategy

EcoCart implements a robust storage strategy for cross-platform compatibility:

1. **EnhancedStorageService** - Core storage service that provides:
   - Asynchronous API for all storage operations
   - Platform-specific optimizations 
   - Type-safe data access
   - Caching for frequently accessed data

2. **Storage Backends**:
   - **MMKV** - Fast, native storage for iOS and Android production builds
   - **AsyncStorage** - Fallback for Expo Go and development
   - **localStorage** - Web platform support

3. **Offline Support**:
   - Robust offline data handling
   - Conflict resolution for data syncing
   - Background sync with retry logic

## Cross-Platform Support

EcoCart is designed to work seamlessly across:
- iOS (iPhone and iPad)
- Android (phones and tablets)
- Web browsers (Chrome, Safari, Firefox, Edge)

Web support includes:
- Responsive layouts
- Platform-specific optimizations
- Web-specific patches for React Native components
- Progressive Web App (PWA) capabilities

## Development

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Yarn or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ecocart.git
cd ecocart

# Install dependencies
npm install

# Start the development server
npm start
```

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run on web browser
- `npm test` - Run Jest tests
- `npm run build:dev` - Build development version
- `npm run build:prod` - Build production version
- `npm run update:prod` - Push OTA update to production

### Development Environment Notes

1. **Expo Go Limitations**:
   - Limited MMKV support
   - Some native modules may not be available
   - Use EAS Build for full native module access

2. **Web Development**:
   - Some React Native components require web-specific patches
   - SVG components have specific web compatibility fixes
   - Test web builds regularly to catch platform-specific issues

## Deployment

EcoCart uses Expo Application Services (EAS) for builds and OTA updates.

### Building for App Stores

```bash
# Production build for all platforms
npm run build:prod

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

### Web Deployment

```bash
# Build for web
npx expo export -p web

# Deploy to hosting provider (example for Netlify)
netlify deploy --dir dist
```

### OTA Updates

```bash
# Push update to production
npm run update:prod
```

## Troubleshooting

### Common Issues

1. **SVG Rendering on Web**:
   - If SVG components don't render properly, ensure `webPatches.ts` is properly imported and applied in `app/_layout.tsx`
   - Use `Platform.select()` for platform-specific SVG alternatives

2. **Navigation Errors**:
   - For "Unmatched Route" errors, check your route structure in the `app/` directory
   - Ensure you don't have both a file and a directory with the same name (e.g., `profile.tsx` and `profile/`)

3. **Storage Errors**:
   - Ensure all storage operations use `await` when accessing data
   - Check for proper error handling in async storage operations
   - Verify storage permissions on Android

4. **Theme System**:
   - If theme changes don't persist, check `ThemeSwitcher` and storage operations
   - Ensure theme context is properly wrapped around your components

## Testing

EcoCart has a comprehensive testing strategy:

- **Unit Tests** - Test components, hooks, and services in isolation
- **Integration Tests** - Test multiple components working together
- **E2E Tests** - Test complete user flows using Detox
- **Web Tests** - Test web-specific functionality
- **Security Audit** - Check for security vulnerabilities

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run web-specific tests
npm run test:web

# Run security audit
npm run security:audit
```

## Documentation

- [Deployment Guide](./docs/deployment-guide.md) - Detailed deployment instructions
- [Performance Guide](./docs/performance-optimization-guide.md) - Performance best practices
- [Testing Strategy](./docs/testing-strategy.md) - Testing approach and examples
- [Storage Guide](./docs/storage-guide.md) - Storage implementation details
- [Cross-Platform Guide](./docs/user-experience-guide.md) - Platform-specific considerations

## Contributing

Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Features

### Core Features
- User Authentication & Profile Management
- Home Dashboard
- Materials Database
- Collection Scheduling
- Rewards & Credits System
- Notification System
- Settings & Preferences

### Map & Navigation Features
- Interactive Maps
- Optimized Routes
- Custom Locations
- Navigation Integration
- Location Tracking
- Geofencing

### Community Features
- News Feed
- Event Management
- Community Challenges
- User Achievements
- Leaderboards
- Social Sharing
- Messaging System

### Offline Support
- Offline data storage
- Background sync
- Conflict resolution 
- Queue management
- Offline-aware UI components
- Network status monitoring

### Additional Features
- Advanced Route Optimization
- Predictive Collection Scheduling
- Gamification Elements
- Advanced Analytics Dashboard

### Grocery Store Integration
- API connections with multiple grocery delivery platforms
- Synchronization of delivery schedules
- Credit redemption system for grocery purchases
- Order status tracking interface
- Store connection management
- Support for eco-friendly delivery options
- Integration with rewards system for seamless credit usage
