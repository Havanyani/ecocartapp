/**
 * Bulk Theme Migration Script
 * 
 * This script performs bulk migration of files from the old theme system to the new one.
 * It looks for files with old imports and replaces them, and also updates old theme patterns.
 * 
 * Phase 11: Update remaining files based on verification report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const specificDirs = args.length > 0 ? args : null;

// Directories to process - if no specific directories are provided, use default list
const TARGET_DIRS = specificDirs || [
  'app',
  'src/components',
  'src/screens',
  'src/navigation'
];

// Patterns to find and replace
const FIND_IMPORT = "import { useTheme } from '@/hooks/useTheme'";
const REPLACE_IMPORT = "import { useTheme } from '@/theme'";

// Theme pattern replacements
const THEME_PATTERNS = [
  { find: 'theme.colors.text.primary', replace: 'theme.colors.text' },
  { find: 'theme.colors.text.secondary', replace: 'theme.colors.textSecondary' },
  { find: 'theme.colors.text.inverse', replace: 'theme.colors.textInverse' },
  { find: 'theme.isDark', replace: 'theme.dark' },
  { find: 'const { theme } = useTheme()', replace: 'const theme = useTheme()' }
];

// Function to process a file
function processFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Replace old import with new one
    if (content.includes(FIND_IMPORT)) {
      content = content.replace(FIND_IMPORT, REPLACE_IMPORT);
      console.log(`  - Updated theme import.`);
      hasChanges = true;
    } else {
      console.log(`  - No old theme import found.`);
    }
    
    // Replace old theme patterns
    let patternChanges = 0;
    for (const pattern of THEME_PATTERNS) {
      const regex = new RegExp(pattern.find.replace(/\./g, '\\.'), 'g');
      const matches = content.match(regex);
      
      if (matches && matches.length > 0) {
        content = content.replace(regex, pattern.replace);
        patternChanges += matches.length;
        console.log(`  - Replaced ${matches.length} instances of '${pattern.find}' with '${pattern.replace}'`);
      }
    }
    
    if (patternChanges > 0) {
      console.log(`  - Updated ${patternChanges} theme patterns.`);
      hasChanges = true;
    } else {
      console.log(`  - No old theme patterns found.`);
    }
    
    // Write updated content back to file if any changes were made
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  - Saved changes to file.`);
    }
    
    return hasChanges;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to find all TS/TSX files in a directory
function findFiles(dir) {
  const files = [];
  
  try {
    // Check if directory exists
    if (!fs.existsSync(dir)) {
      console.log(`Directory ${dir} not found. Skipping.`);
      return files;
    }
    
    // Handle glob pattern in directory name
    if (dir.includes('**')) {
      const basePath = dir.split('/**')[0];
      return findFilesWithGlob(basePath, dir);
    }
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...findFiles(entryPath));
      } else if (entry.isFile() && 
                (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        files.push(entryPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

// Function to handle glob patterns
function findFilesWithGlob(basePath, pattern) {
  const files = [];
  
  try {
    const baseEntries = fs.readdirSync(basePath, { withFileTypes: true });
    
    for (const entry of baseEntries) {
      if (entry.isDirectory()) {
        const dirPath = path.join(basePath, entry.name);
        // Find all ts/tsx files in the directory structure
        const allFiles = findFiles(dirPath);
        files.push(...allFiles);
      }
    }
  } catch (error) {
    console.error(`Error handling glob pattern ${pattern}:`, error.message);
  }
  
  return files;
}

// Function to filter files that need migration based on verification
function filterFilesNeedingMigration(files) {
  const needsMigration = [];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const hasOldImport = content.includes(FIND_IMPORT);
      const hasOldPattern = THEME_PATTERNS.some(pattern => 
        content.includes(pattern.find)
      );
      
      if (hasOldImport || hasOldPattern) {
        needsMigration.push(file);
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error.message);
    }
  }
  
  return needsMigration;
}

// Main function
function main() {
  let totalFiles = 0;
  let updatedFiles = 0;
  
  console.log(`Starting bulk theme migration for directories: ${specificDirs ? specificDirs.join(', ') : 'all default directories'}`);
  
  // Process each target directory
  for (const dir of TARGET_DIRS) {
    console.log(`\nProcessing directory: ${dir}`);
    
    const allFiles = findFiles(dir);
    const files = filterFilesNeedingMigration(allFiles);
    
    totalFiles += files.length;
    
    console.log(`Found ${allFiles.length} TypeScript/React files.`);
    console.log(`${files.length} files need migration.`);
    
    for (const file of files) {
      if (processFile(file)) {
        updatedFiles++;
      }
    }
  }
  
  console.log(`\nSummary:`);
  console.log(`- Total files processed: ${totalFiles}`);
  console.log(`- Files updated: ${updatedFiles}`);
  
  // Suggest running the verification script again
  console.log(`\nRecommended next step: Run verification script to check remaining files:`);
  console.log(`node scripts/verify-theme-migration.js`);
}

// Run the script
main(); 