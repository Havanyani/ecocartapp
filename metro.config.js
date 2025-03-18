// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add SVG support
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
const { assetExts, sourceExts } = config.resolver;
config.resolver.assetExts = assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...sourceExts, 'svg', 'js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'];

// Enable symlinks
config.resolver.unstable_enableSymlinks = true;

// Support platform-specific extensions
config.resolver.platforms = ['ios', 'android', 'web'];

// Add support for importing from the src and app directories
config.watchFolders = [
  path.resolve(__dirname, 'app'),
  path.resolve(__dirname, 'src'),
];

// Resolve nanoid/non-secure to our custom implementation
config.resolver.extraNodeModules = {
  'nanoid/non-secure': path.resolve(__dirname, './src/utils/nanoid-non-secure.js')
};

// Add network configuration for better connectivity
config.server = {
  port: 8081,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Add CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      return middleware(req, res, next);
    };
  },
};

module.exports = config; 