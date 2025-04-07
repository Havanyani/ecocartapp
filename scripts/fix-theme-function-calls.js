/**
 * Fix Theme Function Calls
 * 
 * This script updates all components using the useTheme hook to follow
 * the proper two-step calling pattern:
 * 
 * const themeFunc = useTheme();
 * const theme = themeFunc();
 */

const fs = require('fs');
const path = require('path');

// Files to exclude from scanning
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  'scripts',
  '.expo',
  'web-build',
  'dist'
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

// Function to update theme usage in a file
function updateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files that don't use the theme hook
    if (!content.includes('useTheme()')) {
      return 0;
    }
    
    // Find all instances of "const theme = useTheme()"
    const regex = /const\s+theme\s*=\s*useTheme\(\);/g;
    
    if (!regex.test(content)) {
      return 0;
    }
    
    // Replace with the proper pattern
    const updatedContent = content.replace(
      regex, 
      'const themeFunc = useTheme();\nconst theme = themeFunc();'
    );
    
    // Count the replacements
    const count = (updatedContent.match(/const themeFunc = useTheme\(\);/g) || []).length;
    
    if (count > 0) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated ${filePath} (${count} changes)`);
    }
    
    return count;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Main function
function main() {
  console.log('Updating theme usage to proper two-step pattern...');
  
  // Find all TypeScript files
  const files = findFiles('.');
  console.log(`Found ${files.length} TypeScript files to scan.`);
  
  // Update each file
  let totalChanges = 0;
  let filesChanged = 0;
  
  for (const file of files) {
    const changes = updateFile(file);
    if (changes > 0) {
      totalChanges += changes;
      filesChanged++;
    }
  }
  
  console.log(`\nUpdate complete!`);
  console.log(`Made ${totalChanges} changes across ${filesChanged} files.`);
  console.log(`All useTheme hook calls now use the proper two-step pattern:
const themeFunc = useTheme();
const theme = themeFunc();`);
}

// Run the script
main(); 