module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      ['babel-plugin-react-native-web', { commonjs: true }],
      [
        'module-resolver',
        {
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json', '.web.js', '.web.tsx'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@utils': './src/utils',
            '@hooks': './src/hooks',
            '@contexts': './src/contexts',
            '@types': './src/types'
          },
          platforms: {
            web: {
              alias: {
                'react-native-maps': './src/mocks/react-native-maps.js',
                'victory-native': './src/components/ui/Victory.web.tsx',
                '@shopify/react-native-skia': './src/mocks/react-native-skia.js',
                'react-native-svg': './src/mocks/react-native-svg.js',
              },
            },
          },
        },
      ],
    ]
  };
}; 