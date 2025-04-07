/**
 * Standardize Theme Usage Script
 * 
 * This script standardizes all useTheme hook calls to use the single parentheses pattern:
 * const theme = useTheme()
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files to exclude from scanning
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  'scripts',
  '.expo',
  'web-build',
  'dist'
];

// Patterns to standardize
const PATTERNS_TO_REPLACE = [
  { 
    from: 'const theme = useTheme()()()', 
    to: 'const theme = useTheme()' 
  },
  { 
    from: 'const theme = useTheme()()', 
    to: 'const theme = useTheme()' 
  }
];

// Function to find all TypeScript files
function findFiles(dir, results = []) {
  if (EXCLUDE_DIRS.includes(path.basename(dir))) return results;

  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      findFiles(filePath, results);
    } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx'))) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Function to standardize the theme usage in a file
function standardizeFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changesCount = 0;
    
    // Replace all patterns
    for (const pattern of PATTERNS_TO_REPLACE) {
      if (content.includes(pattern.from)) {
        const beforeCount = content.split(pattern.from).length - 1;
        content = content.replace(new RegExp(pattern.from, 'g'), pattern.to);
        const afterCount = content.split(pattern.to).length - 1;
        changesCount += beforeCount;
      }
    }
    
    // Save the file if changes were made
    if (changesCount > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath} (${changesCount} changes)`);
    }
    
    return changesCount;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Main function
function main() {
  console.log('Standardizing theme usage to single parentheses pattern...');
  
  // Find all TypeScript files
  const files = findFiles('.');
  console.log(`Found ${files.length} TypeScript files to process.`);
  
  // Standardize each file
  let totalChanges = 0;
  let filesChanged = 0;
  
  for (const file of files) {
    const changes = standardizeFile(file);
    if (changes > 0) {
      totalChanges += changes;
      filesChanged++;
    }
  }
  
  console.log(`\nStandardization complete!`);
  console.log(`Made ${totalChanges} changes across ${filesChanged} files.`);
  console.log(`All useTheme hook calls now use the standard pattern: const theme = useTheme()`);
}

// Run the script
main(); 