module.exports = {
  root: true,
  extends: [
    '@react-native',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import', 'react-native'],
  rules: {
    // Import rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@/**',
            group: 'internal',
            position: 'after',
          },
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    // Enforce absolute imports with @/ alias
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../*', '../../*', '../../../*', '../../../../*'],
            message: 'Use @/ alias imports instead of relative paths',
          },
          {
            group: ['@/ui/*', '@/ui'],
            message: 'Import from @/components/ui/* instead',
          },
          {
            group: ['@/ThemedText', '@/ThemedText.tsx'],
            message: 'Import from @/components/ui/ThemedText instead',
          },
        ],
      },
    ],
    // Enforce using SafeStorage instead of AsyncStorage
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ImportDeclaration[source.value=/AsyncStorage/]',
        message: 'Use SafeStorage instead of importing AsyncStorage directly'
      }
    ],
    // React rules
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/prop-types': 'off', // Not needed with TypeScript
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    // TypeScript rules
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    // Animation-related rules
    'no-unused-expressions': ['error', { 'allowShortCircuit': true }], // Prevent unused animations
    // Custom rules for animations
    'custom-rules/animation-cleanup': 'off',
    'custom-rules/use-animation-error-handling': 'off',
    'custom-rules/prefer-native-driver': 'off',
    '@typescript-eslint/func-call-spacing': 'off',
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'no-bitwise': ['warn', { 'allow': ['|'] }],
  },
  settings: {
    'import/resolver': {
      typescript: {},
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src/'],
      },
    },
    react: {
      version: 'detect',
    },
  },
  overrides: [
    // Animation component specific rules
    {
      files: ['**/animations/**/*.{ts,tsx}', '**/*Animation*.{ts,tsx}'],
      rules: {
        'react-hooks/exhaustive-deps': 'error', // Stricter for animation components
        'no-console': ['error', { allow: ['warn', 'error'] }], // Only allow console.error in animation files
      },
    },
  ],
}; 