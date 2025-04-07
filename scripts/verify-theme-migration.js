/**
 * Theme Migration Verification Script
 * 
 * This script scans the codebase for components that still use the old theme system
 * and generates a report of files that need to be migrated.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patterns to search for
const OLD_THEME_IMPORT = "from '@/hooks/useTheme'";
const OLD_THEME_PATTERNS = [
  'theme.colors.text.primary',
  'theme.colors.text.secondary',
  'theme.colors.text.inverse',
  'theme.isDark',
  'const { theme } = useTheme()'
];

// Directories to exclude
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  'scripts',
  'dist',
  '.expo',
  'web-build'
];

// Output file
const REPORT_FILE = 'theme-migration-report.md';

// Function to find all files with a specific extension
function findFiles(dir, extensions, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !EXCLUDE_DIRS.includes(file)) {
      findFiles(filePath, extensions, results);
    } else if (
      stat.isFile() && 
      extensions.includes(path.extname(file).toLowerCase())
    ) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Function to check if a file contains any of the old theme patterns
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const results = {
    path: filePath,
    hasOldImport: content.includes(OLD_THEME_IMPORT),
    oldPatterns: []
  };
  
  for (const pattern of OLD_THEME_PATTERNS) {
    if (content.includes(pattern)) {
      results.oldPatterns.push(pattern);
    }
  }
  
  return results;
}

// Main function
function main() {
  console.log('Scanning for files that need theme migration...');
  
  // Find all TypeScript and React files
  const files = findFiles('.', ['.ts', '.tsx']);
  console.log(`Found ${files.length} TypeScript/React files to scan.`);
  
  // Check each file for old theme patterns
  const results = [];
  for (const file of files) {
    const fileResult = checkFile(file);
    if (fileResult.hasOldImport || fileResult.oldPatterns.length > 0) {
      results.push(fileResult);
    }
  }
  
  // Generate report
  const reportContent = generateReport(results);
  fs.writeFileSync(REPORT_FILE, reportContent);
  
  console.log(`\nFound ${results.length} files that need migration.`);
  console.log(`Report saved to ${REPORT_FILE}`);
}

// Function to generate a markdown report
function generateReport(results) {
  let report = `# Theme Migration Report\n\nGenerated on ${new Date().toLocaleString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- **Total files to migrate:** ${results.length}\n`;
  report += `- **Files with old imports:** ${results.filter(r => r.hasOldImport).length}\n`;
  report += `- **Files with old theme patterns:** ${results.filter(r => r.oldPatterns.length > 0).length}\n\n`;
  
  report += `## Files That Need Migration\n\n`;
  report += `| File | Has Old Import | Old Patterns |\n`;
  report += `|------|---------------|-------------|\n`;
  
  for (const result of results) {
    const relativePath = result.path.replace(/\\/g, '/');
    report += `| ${relativePath} | ${result.hasOldImport ? '✅' : '❌'} | ${result.oldPatterns.join(', ') || 'None'} |\n`;
  }
  
  report += `\n## Next Steps\n\n`;
  report += `1. Focus on migrating files with old imports first\n`;
  report += `2. Then update files with old theme patterns\n`;
  report += `3. Update the migration plan document with your progress\n`;
  
  return report;
}

// Run the script
main(); 