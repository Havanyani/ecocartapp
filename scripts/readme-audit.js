/**
 * EcoCart Component README Audit Script
 * 
 * This script analyzes all component README files in the project to check their
 * compliance with the standard template structure.
 * 
 * Usage:
 * node scripts/readme-audit.js
 * 
 * Output:
 * - Console report of README compliance
 * - CSV file with detailed audit results
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);

// Component directories to scan
const COMPONENT_DIRS = [
  'src/components/analytics',
  'src/components/collection',
  'src/components/community',
  'src/components/form',
  'src/components/gamification',
  'src/components/materials',
  'src/components/notifications',
  'src/components/performance',
  'src/components/real-time',
  'src/components/rewards',
  'src/components/storage',
  'src/components/sustainability',
  'src/components/ui',
];

// Required sections in a standardized README
const REQUIRED_SECTIONS = [
  '# ', // Title (heading level 1)
  '## Overview',
  '## Usage',
  '## Props',
  '## Features',
  '## Styling',
  '## Best Practices',
  '## Examples',
];

// Optional but recommended sections
const RECOMMENDED_SECTIONS = [
  '## Implementation Details',
  '## Related Components',
  '## Related Documentation',
];

/**
 * Recursively finds all README.md and *.README.md files in a directory
 */
async function findReadmeFiles(dir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      const subResults = await findReadmeFiles(fullPath);
      results.push(...subResults);
    } else if (
      entry.name === 'README.md' || 
      entry.name.endsWith('.README.md')
    ) {
      results.push(fullPath);
    }
  }
  
  return results;
}

/**
 * Analyzes a README file for compliance with the standard structure
 */
async function analyzeReadme(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const lines = content.split('\n');
    
    const result = {
      filePath,
      fileName: path.basename(filePath),
      directory: path.dirname(filePath),
      isEmpty: content.trim().length === 0,
      missingRequiredSections: [],
      missingRecommendedSections: [],
      hasPropTable: content.includes('| Prop | Type | Required | Default | Description |'),
      hasCodeExamples: content.includes('```tsx'),
      lineCount: lines.length,
      complianceScore: 0,
    };
    
    // Check for required sections
    for (const section of REQUIRED_SECTIONS) {
      if (!content.includes(section)) {
        result.missingRequiredSections.push(section.trim());
      }
    }
    
    // Check for recommended sections
    for (const section of RECOMMENDED_SECTIONS) {
      if (!content.includes(section)) {
        result.missingRecommendedSections.push(section.trim());
      }
    }
    
    // Calculate compliance score (0-100)
    const requiredWeight = 0.7;
    const recommendedWeight = 0.3;
    
    const requiredScore = (REQUIRED_SECTIONS.length - result.missingRequiredSections.length) / REQUIRED_SECTIONS.length;
    const recommendedScore = (RECOMMENDED_SECTIONS.length - result.missingRecommendedSections.length) / RECOMMENDED_SECTIONS.length;
    
    result.complianceScore = Math.round(
      (requiredScore * requiredWeight + recommendedScore * recommendedWeight) * 100
    );
    
    return result;
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error);
    return {
      filePath,
      error: error.message,
      complianceScore: 0,
    };
  }
}

/**
 * Generates a CSV report from audit results
 */
function generateCsvReport(results) {
  // CSV header
  let csv = 'FilePath,FileName,Directory,IsEmpty,MissingRequiredSections,MissingRecommendedSections,HasPropTable,HasCodeExamples,LineCount,ComplianceScore\n';
  
  // Add each result as a row
  for (const result of results) {
    csv += [
      result.filePath,
      result.fileName,
      result.directory,
      result.isEmpty,
      result.missingRequiredSections?.join(';'),
      result.missingRecommendedSections?.join(';'),
      result.hasPropTable,
      result.hasCodeExamples,
      result.lineCount,
      result.complianceScore,
    ].join(',') + '\n';
  }
  
  return csv;
}

/**
 * Prints a summary report to the console
 */
function printSummaryReport(results) {
  // Sort by compliance score in ascending order (lowest first)
  const sortedResults = [...results].sort((a, b) => a.complianceScore - b.complianceScore);
  
  // Calculate statistics
  const totalFiles = results.length;
  const emptyFiles = results.filter(r => r.isEmpty).length;
  const highCompliance = results.filter(r => r.complianceScore >= 80).length;
  const mediumCompliance = results.filter(r => r.complianceScore >= 50 && r.complianceScore < 80).length;
  const lowCompliance = results.filter(r => r.complianceScore < 50).length;
  const averageCompliance = results.reduce((sum, r) => sum + r.complianceScore, 0) / totalFiles;
  
  console.log('\n==== EcoCart Component README Audit Report ====\n');
  console.log(`Total README files analyzed: ${totalFiles}`);
  console.log(`Empty README files: ${emptyFiles}`);
  console.log(`High compliance (80-100%): ${highCompliance} (${Math.round(highCompliance/totalFiles*100)}%)`);
  console.log(`Medium compliance (50-79%): ${mediumCompliance} (${Math.round(mediumCompliance/totalFiles*100)}%)`);
  console.log(`Low compliance (0-49%): ${lowCompliance} (${Math.round(lowCompliance/totalFiles*100)}%)`);
  console.log(`Average compliance score: ${Math.round(averageCompliance)}%\n`);
  
  // Show top 5 least compliant files
  console.log('Top 5 files needing the most attention:');
  for (let i = 0; i < Math.min(5, sortedResults.length); i++) {
    const result = sortedResults[i];
    console.log(`${i+1}. ${result.filePath} (Score: ${result.complianceScore}%)`);
    if (result.missingRequiredSections && result.missingRequiredSections.length > 0) {
      console.log(`   Missing required sections: ${result.missingRequiredSections.join(', ')}`);
    }
  }
  
  console.log('\nDetailed results have been saved to readme-audit-results.csv');
}

/**
 * Main function to run the audit
 */
async function main() {
  try {
    console.log('Starting component README audit...');
    
    // Find all README files
    let readmeFiles = [];
    for (const dir of COMPONENT_DIRS) {
      if (fs.existsSync(dir)) {
        const files = await findReadmeFiles(dir);
        readmeFiles.push(...files);
      } else {
        console.warn(`Directory not found: ${dir}`);
      }
    }
    
    console.log(`Found ${readmeFiles.length} README files to analyze.`);
    
    // Analyze each file
    const results = [];
    for (const file of readmeFiles) {
      const result = await analyzeReadme(file);
      results.push(result);
    }
    
    // Generate and save CSV report
    const csvReport = generateCsvReport(results);
    await writeFile('readme-audit-results.csv', csvReport, 'utf8');
    
    // Print summary to console
    printSummaryReport(results);
    
  } catch (error) {
    console.error('Error running README audit:', error);
    process.exit(1);
  }
}

// Run the script
main(); 