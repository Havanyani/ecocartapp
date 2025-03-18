/**
 * fix-async-storage.js
 * 
 * Script to update all AsyncStorage imports and usages to SafeStorage
 * throughout the codebase.
 */
const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

// Source directory
const sourceDir = './src';

// Patterns to match
const importPattern = /import\s+AsyncStorage\s+from\s+['"]@react-native-async-storage\/async-storage['"]/g;
const replacementImport = "import { SafeStorage } from '@/utils/storage'";

// AsyncStorage method patterns
const methodPatterns = [
  { 
    regex: /AsyncStorage\.getItem\((.*?)\)/g, 
    replacement: 'SafeStorage.getItem($1)'
  },
  { 
    regex: /AsyncStorage\.setItem\((.*?)\)/g, 
    replacement: 'SafeStorage.setItem($1)'
  },
  { 
    regex: /AsyncStorage\.removeItem\((.*?)\)/g, 
    replacement: 'SafeStorage.removeItem($1)'
  },
  { 
    regex: /AsyncStorage\.multiGet\((.*?)\)/g, 
    replacement: 'SafeStorage.multiGet($1)'
  },
  { 
    regex: /AsyncStorage\.multiSet\((.*?)\)/g, 
    replacement: 'SafeStorage.multiSet($1)'
  },
  { 
    regex: /AsyncStorage\.multiRemove\((.*?)\)/g, 
    replacement: 'SafeStorage.multiRemove($1)'
  },
  { 
    regex: /AsyncStorage\.clear\(\)/g, 
    replacement: 'SafeStorage.clear()'
  },
  { 
    regex: /AsyncStorage\.getAllKeys\(\)/g, 
    replacement: 'SafeStorage.getAllKeys()'
  }
];

// Skip test files and mock files
const skipPatterns = [
  /__tests__/,
  /__mocks__/,
  /\.test\./,
  /\.spec\./,
  /node_modules/
];

// Function to check if a file should be skipped
function shouldSkipFile(filePath) {
  return skipPatterns.some(pattern => pattern.test(filePath));
}

// Find all TypeScript and JavaScript files in src directory
const files = globSync(`${sourceDir}/**/*.{ts,tsx,js,jsx}`, { ignore: ['**/node_modules/**'] });

let totalFilesChanged = 0;
let totalImportsReplaced = 0;
let totalMethodsReplaced = 0;

files.forEach(file => {
  if (shouldSkipFile(file)) {
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  let fileChanged = false;

  // Replace imports
  const importMatches = content.match(importPattern);
  if (importMatches) {
    content = content.replace(importPattern, replacementImport);
    totalImportsReplaced += importMatches.length;
    fileChanged = true;
  }

  // Replace method calls
  methodPatterns.forEach(pattern => {
    const methodMatches = content.match(pattern.regex);
    if (methodMatches) {
      content = content.replace(pattern.regex, pattern.replacement);
      totalMethodsReplaced += methodMatches.length;
      fileChanged = true;
    }
  });

  // Save the file if changes were made
  if (fileChanged) {
    fs.writeFileSync(file, content, 'utf8');
    totalFilesChanged++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`
Migration Complete:
- Total files changed: ${totalFilesChanged}
- Total imports replaced: ${totalImportsReplaced}
- Total method calls replaced: ${totalMethodsReplaced}
`); 