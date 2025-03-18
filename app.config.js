export default {
  name: "EcoCart",
  slug: "ecocart",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./src/assets/images/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./src/assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.ecocart.app"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./src/assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.ecocart.app"
  },
  web: {
    favicon: "./src/assets/images/favicon.png",
    bundler: "metro"
  },
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true
  },
  scheme: "ecocart"
}; 