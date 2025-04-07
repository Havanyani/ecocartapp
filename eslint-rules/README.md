# Custom ESLint Rules

This directory contains custom ESLint rules for the EcoCart application.

## Theme Usage Enforcer

The `enforce-theme-usage.js` rule enforces a consistent pattern for using the theme hook across the application. It ensures that all theme usages follow the recommended two-step pattern:

```typescript
// Correct pattern:
const themeFunc = useTheme();
const theme = themeFunc();

// Incorrect pattern (will be flagged):
const theme = useTheme();
```

### Integration with ESLint Configuration

To use this custom rule in your ESLint configuration, add the following to your `.eslintrc.js` file:

```javascript
module.exports = {
  // ... existing configuration
  
  // Add the custom rules directory
  plugins: [
    // ... existing plugins
    "ecocart-rules"
  ],
  
  // Configure the custom rules
  rules: {
    // ... existing rules
    "ecocart-rules/enforce-theme-usage": "error",
  },
  
  // Configure the ESLint plugin to load the custom rules
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      plugins: ["ecocart-rules"],
      rules: {
        "ecocart-rules/enforce-theme-usage": "error",
      },
    },
  ],
};
```

### Install Required Packages

You'll also need to create and install a local ESLint plugin. Create a new directory called `eslint-plugin-ecocart-rules` with the following structure:

```
eslint-plugin-ecocart-rules/
├── index.js
└── package.json
```

#### index.js
```javascript
module.exports = {
  rules: {
    "enforce-theme-usage": require("../../eslint-rules/enforce-theme-usage"),
  },
};
```

#### package.json
```json
{
  "name": "eslint-plugin-ecocart-rules",
  "version": "1.0.0",
  "description": "Custom ESLint rules for EcoCart",
  "main": "index.js",
  "license": "UNLICENSED",
  "private": true
}
```

Then install the local plugin:

```sh
npm link eslint-plugin-ecocart-rules
npm install --save-dev eslint-plugin-ecocart-rules
```

### Alternative Simple Integration

For a simpler integration without creating a plugin, you can update your `.eslintrc.js` file as follows:

```javascript
const themeUsageRule = require('./eslint-rules/enforce-theme-usage');

module.exports = {
  // ... existing configuration
  
  plugins: [
    // ... existing plugins
  ],
  
  rules: {
    // ... existing rules
  },
  
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      rules: {
        // Add the custom rule directly
        "@typescript-eslint/no-unused-vars": "warn",
        // ... other TypeScript-specific rules
      },
    },
  ],
};

// Add the custom rule directly to the ESLint instance
module.exports.rules = {
  "enforce-theme-usage": themeUsageRule,
};
```

## Running the Rules

To run ESLint with the custom rules, use the normal ESLint command:

```sh
npx eslint src/**/*.tsx --fix
```

This will automatically flag any incorrect theme usages and fix them according to the recommended pattern. 