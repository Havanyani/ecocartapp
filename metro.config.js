const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');
const { resolver: { sourceExts, assetExts } } = getDefaultConfig(__dirname);

// Get the default Expo config
const defaultConfig = getDefaultConfig(__dirname);

// Customize for web support
const config = {
  ...defaultConfig,
  
  // Configure server options
  server: {
    ...defaultConfig.server,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // Serve static files
        if (req.url.startsWith('/static')) {
          const staticPath = path.join(__dirname, 'web-build', req.url);
          res.sendFile(staticPath);
          return;
        }
        
        return middleware(req, res, next);
      };
    },
  },
  
  // Configure resolver
  resolver: {
    ...defaultConfig.resolver,
    assetExts: [...assetExts],
    sourceExts: [...sourceExts, 'web.ts', 'web.tsx', 'web.js', 'web.jsx'],
    platforms: ['ios', 'android', 'web'],
    extraNodeModules: {
      ...defaultConfig.resolver.extraNodeModules,
      'missing-asset-registry-path': require.resolve('./src/mocks/asset-registry.js')
    }
  },
  
  // Configure transformer
  transformer: {
    ...defaultConfig.transformer,
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  },
  
  // Support for web platform
  serializer: {
    ...defaultConfig.serializer,
    processModuleFilter: (module) => {
      if (module.path.includes('node_modules/react-native-web')) {
        return true;
      }
      return !module.path.includes('node_modules') || 
        module.path.includes('node_modules/react-native') || 
        module.path.includes('node_modules/react') || 
        module.path.includes('node_modules/expo') || 
        module.path.includes('node_modules/@react') || 
        module.path.includes('node_modules/@expo');
    },
  }
};

module.exports = config; 
