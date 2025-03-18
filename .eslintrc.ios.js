module.exports = {
  extends: ['./.eslintrc.js'],
  rules: {
    // iOS-specific rules
    'react-native/ios-only-rules': 'error',
  },
  settings: {
    'react-native/ios-version': '16.0',
  },
  overrides: [
    {
      files: ['**/*.ios.js', '**/*.ios.jsx', '**/*.ios.ts', '**/*.ios.tsx'],
      rules: {
        'react-native/platform-specific-components': 'off',
      },
    },
  ],
}; 