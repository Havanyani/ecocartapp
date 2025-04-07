/**
 * Fix Theme Usage Script
 * 
 * This script analyzes the codebase for inconsistent useTheme hook usage patterns
 * and generates a report on files that need to be fixed.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patterns to find
const USAGE_PATTERNS = [
  { pattern: 'const theme = useTheme()', count: 0, files: [] },
  { pattern: 'const theme = useTheme()()', count: 0, files: [] },
  { pattern: 'const theme = useTheme()()()', count: 0, files: [] },
  { pattern: 'const { theme } = useTheme()', count: 0, files: [] }
];

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

// Function to check a file for theme usage patterns
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = [];
    
    for (const pattern of USAGE_PATTERNS) {
      if (content.includes(pattern.pattern)) {
        pattern.count++;
        pattern.files.push(filePath);
        results.push(pattern.pattern);
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
}

// Main function
function main() {
  console.log('Analyzing theme usage patterns...');
  
  // Find all TypeScript files
  const files = findFiles('.');
  console.log(`Found ${files.length} TypeScript files to analyze.`);
  
  // Check each file for theme usage patterns
  const patternsFound = new Map();
  
  for (const file of files) {
    const patterns = checkFile(file);
    if (patterns.length > 0) {
      patternsFound.set(file, patterns);
    }
  }
  
  // Generate report
  console.log('\nTheme Usage Analysis:');
  console.log('=====================\n');
  
  for (const pattern of USAGE_PATTERNS) {
    console.log(`${pattern.pattern}: ${pattern.count} occurrences`);
  }
  
  console.log('\nFiles with Multiple Patterns:');
  console.log('============================\n');
  
  for (const [file, patterns] of patternsFound.entries()) {
    if (patterns.length > 1) {
      console.log(`${file}:`);
      patterns.forEach(pattern => console.log(`  - ${pattern}`));
      console.log('');
    }
  }
  
  // Generate the report file
  const reportContent = generateReport(patternsFound);
  fs.writeFileSync('theme-usage-report.md', reportContent);
  console.log('Report saved to theme-usage-report.md');
}

// Function to generate markdown report
function generateReport(patternsFound) {
  let report = `# Theme Usage Report\n\nGenerated on ${new Date().toLocaleString()}\n\n`;
  
  report += `## Summary\n\n`;
  
  for (const pattern of USAGE_PATTERNS) {
    report += `- **${pattern.pattern}**: ${pattern.count} occurrences\n`;
  }
  
  report += `\n## Inconsistent Usage Patterns\n\n`;
  report += `The following files have inconsistent usage patterns:\n\n`;
  
  for (const [file, patterns] of patternsFound.entries()) {
    if (patterns.length > 1) {
      report += `### ${file}\n\n`;
      patterns.forEach(pattern => report += `- ${pattern}\n`);
      report += `\n`;
    }
  }
  
  report += `\n## Detailed File List\n\n`;
  
  for (const pattern of USAGE_PATTERNS) {
    report += `### ${pattern.pattern}\n\n`;
    pattern.files.forEach(file => report += `- ${file}\n`);
    report += `\n`;
  }
  
  report += `\n## Recommendation\n\n`;
  report += `Based on the analysis, the recommended usage pattern is: **${getMostCommonPattern()}**\n\n`;
  report += `You should update all components to use this consistent pattern.\n`;
  
  return report;
}

// Function to get the most common pattern
function getMostCommonPattern() {
  let mostCommon = USAGE_PATTERNS[0];
  
  for (const pattern of USAGE_PATTERNS) {
    if (pattern.count > mostCommon.count) {
      mostCommon = pattern;
    }
  }
  
  return mostCommon.pattern;
}

// Run the script
main(); 