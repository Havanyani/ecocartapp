module.exports = {
  extends: ['./.eslintrc.js'],
  rules: {
    // Android-specific rules
    'react-native/android-only-rules': 'error',
  },
  settings: {
    'react-native/android-version': '33',
  },
  overrides: [
    {
      files: ['**/*.android.js', '**/*.android.jsx', '**/*.android.ts', '**/*.android.tsx'],
      rules: {
        'react-native/platform-specific-components': 'off',
      },
    },
  ],
}; 