/**
 * setup-eslint.js
 * 
 * This script installs ESLint and required plugins for the EcoCart project.
 */
const { execSync } = require('child_process');

console.log('Installing ESLint and required plugins...');

const packages = [
  'eslint',
  'eslint-plugin-react',
  'eslint-plugin-react-hooks',
  'eslint-plugin-import',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  'eslint-config-prettier',
  'eslint-import-resolver-typescript',
  'eslint-plugin-prettier',
  '@react-native/eslint-config',
];

try {
  execSync(`npm install --save-dev ${packages.join(' ')} --legacy-peer-deps`, { 
    stdio: 'inherit',
  });
  
  console.log('\nESLint packages installed successfully!');
  console.log('\nYou can now run ESLint with:');
  console.log('npx eslint --ext .js,.jsx,.ts,.tsx src/');
  
} catch (error) {
  console.error('Error installing ESLint packages:', error.message);
  process.exit(1);
} 