/**
 * Script to install custom ESLint rules
 * 
 * This script updates the .eslintrc.js file to include the custom theme usage rule.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to ESLint config
const eslintConfigPath = path.join(process.cwd(), '.eslintrc.js');

// Check if .eslintrc.js exists
if (!fs.existsSync(eslintConfigPath)) {
  console.error('.eslintrc.js not found. Please create one first.');
  process.exit(1);
}

// Install the plugin locally
try {
  console.log('Installing custom ESLint plugin...');
  execSync('npm link ./eslint-plugin-ecocart-rules');
  execSync('npm install --save-dev ./eslint-plugin-ecocart-rules');
  console.log('Plugin installed successfully.');
} catch (error) {
  console.error('Error installing plugin:', error.message);
  process.exit(1);
}

// Read current ESLint config
let eslintConfig;
try {
  eslintConfig = fs.readFileSync(eslintConfigPath, 'utf8');
} catch (error) {
  console.error('Error reading .eslintrc.js:', error.message);
  process.exit(1);
}

// Check if the plugin is already included
if (eslintConfig.includes('ecocart-rules')) {
  console.log('Plugin already configured in .eslintrc.js.');
  process.exit(0);
}

// Backup the original config
fs.writeFileSync(`${eslintConfigPath}.backup`, eslintConfig, 'utf8');
console.log('Backup of original .eslintrc.js created.');

// Create the updated config with our custom rule
let updatedConfig;

if (eslintConfig.includes('module.exports = {')) {
  // Standard ESLint config format
  updatedConfig = eslintConfig.replace(
    'module.exports = {',
    `module.exports = {
  // Add custom ESLint plugin
  plugins: [
    ...(module.exports.plugins || []),
    'ecocart-rules'
  ],
  
  // Add custom rules
  rules: {
    ...(module.exports.rules || {}),
    'ecocart-rules/enforce-theme-usage': 'error',
  },
`
  );
} else {
  // Cannot reliably modify the config, provide instructions
  console.log('Could not automatically update .eslintrc.js.');
  console.log('Please manually add the following to your ESLint config:');
  console.log(`
  plugins: [
    // ... your existing plugins
    'ecocart-rules'
  ],
  
  rules: {
    // ... your existing rules
    'ecocart-rules/enforce-theme-usage': 'error',
  },
  `);
  process.exit(0);
}

// Write the updated config
try {
  fs.writeFileSync(eslintConfigPath, updatedConfig, 'utf8');
  console.log('.eslintrc.js updated successfully.');
} catch (error) {
  console.error('Error updating .eslintrc.js:', error.message);
  console.log('Restoring backup...');
  fs.copyFileSync(`${eslintConfigPath}.backup`, eslintConfigPath);
  process.exit(1);
}

console.log('\nCustom ESLint rule installation complete!');
console.log('You can now run ESLint to enforce the theme usage pattern:');
console.log('npx eslint src/**/*.tsx --fix'); 