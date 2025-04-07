# EcoCart Web Version

This directory contains a specialized web implementation of the EcoCart application.

## Why a Separate Web Implementation?

We've created this separate web project for several important reasons:

1. **Separation of concerns**: The main app focuses on full native mobile functionality while the web version is simplified with appropriate fallbacks.

2. **Technical limitations**: Despite attempts to mock native modules and patch bundling issues, we encountered persistent syntax errors in node_modules files and bundling failures. The main app depends on several native modules like `react-native-maps`, `victory-native`, and `@shopify/react-native-skia` that are challenging to run in web environments.

3. **Development efficiency**: This approach allows us to maintain platform-specific codebases that share core business logic but have optimized UI implementations for each platform.

## Architecture Approach

This web version:
- Uses the same business logic and data models as the native app
- Provides web-specific UI components that replace native-only components
- Maintains feature parity while optimizing for web interfaces
- Shares design language and branding with the native app

## Development Workflow

When developing new features:
1. Implement core business logic in shared utilities that can be imported by both versions
2. Implement UI components for the native app
3. Create web-specific UI components that maintain the same functionality

## Building and Deployment

To run the web version:

```bash
cd web-version
npm start
```

To create a production web build:

```bash
cd web-version
npm run build
```

## Potential Future Integration

This separate implementation is not necessarily a permanent solution, but a pragmatic approach for cross-platform apps with complex native dependencies. Options for the future include:

- Keep it as a permanent separate web implementation
- Eventually merge the solutions once bundling issues are resolved
- Use as a development environment until a more integrated solution is found

This pattern is commonly used in production React Native apps that need web support but have significant native dependencies.

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
