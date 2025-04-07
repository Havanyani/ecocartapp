const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');
const webpack = require('webpack');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: [
        // Add modules that need transpilation
        '@react-native',
        'react-native-maps',
        '@shopify/react-native-skia',
        'victory-native',
        'react-native-svg',
        'react-native-zip-archive',
      ]
    },
    // Use our web-specific entry point instead of the default
    entryPoint: './index.web.js'
  }, argv);
  
  // Add resolve aliases for web
  if (!config.resolve.alias) {
    config.resolve.alias = {};
  }

  // Add fallbacks for node modules
  if (!config.resolve.fallback) {
    config.resolve.fallback = {};
  }

  // Use mocks for native modules
  Object.assign(config.resolve.alias, {
    'react-native-maps': path.resolve(__dirname, './src/mocks/react-native-maps.js'),
    '@shopify/react-native-skia': path.resolve(__dirname, './src/mocks/react-native-skia.js'),
    'victory-native': path.resolve(__dirname, './src/components/ui/Victory.web.tsx'),
    'react-native/Libraries/Utilities/codegenNativeCommands': path.resolve(__dirname, './src/mocks/empty.js'),
    'react-native-svg': path.resolve(__dirname, './src/mocks/react-native-svg.js'),
    'react-native-zip-archive': path.resolve(__dirname, './src/mocks/react-native-zip-archive.js'),
    'expo-file-system': path.resolve(__dirname, './src/mocks/expo-file-system.js'),
    'expo-battery': path.resolve(__dirname, './src/mocks/expo-battery.js'),
    '@react-native/js-polyfills/error-guard': path.resolve(__dirname, './src/mocks/error-guard.js'),
  });

  // Path-specific mocks
  config.resolve.alias['./src/constants/materials.ts'] = path.resolve(__dirname, './src/mocks/materials.web.ts');
  config.resolve.alias['./src/hooks/useMaterials.ts'] = path.resolve(__dirname, './src/hooks/useMaterials.web.ts');
  config.resolve.alias['./src/utils/PerformanceDataManager.ts'] = path.resolve(__dirname, './src/utils/PerformanceDataManager.web.ts');
  config.resolve.alias['./src/utils/PerformanceOptimizer.ts'] = path.resolve(__dirname, './src/utils/PerformanceOptimizer.web.ts');
  config.resolve.alias['./src/utils/BatteryOptimizer.ts'] = path.resolve(__dirname, './src/utils/BatteryOptimizer.web.ts');
  config.resolve.alias['./App.js'] = path.resolve(__dirname, './App.web.js');

  // Use empty modules for Node.js builtins
  Object.assign(config.resolve.fallback, {
    fs: false,
    path: false,
    crypto: false,
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer/")
  });

  // Create global constants to control behavior at build time
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.EXPO_PUBLIC_PLATFORM': JSON.stringify('web'),
      'process.env.EXPO_DEBUG_NO_ROUTER': JSON.stringify('true'),
      'process.env.EXPO_DEBUG_WEB_ONLY': JSON.stringify('true'),
    })
  );

  // Use our custom web entry file instead of the default App.js
  config.entry = [
    path.resolve(__dirname, 'web-entry.tsx')
  ];
  
  // Add debugging info to webpack
  console.log('[DEBUG] Using custom webpack config with web-entry.tsx');

  return config;
}; 