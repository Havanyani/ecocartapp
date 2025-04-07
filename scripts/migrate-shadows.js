/**
 * migrate-shadows.js
 * 
 * A helper script to suggest shadow style migrations in React Native components.
 * This script scans a file for shadow* properties and suggests replacements
 * using the createShadow() utility.
 * 
 * Usage: node scripts/migrate-shadows.js path/to/component.tsx
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

// Get file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.error(`${colors.red}Error: Please provide a file path${colors.reset}`);
  console.log(`Usage: node ${path.basename(__filename)} path/to/component.tsx`);
  process.exit(1);
}

// Read the file
try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n');
  
  // Define regex patterns for shadow properties
  const shadowColorPattern = /shadowColor:\s*['"]([^'"]+)['"]/;
  const shadowOffsetPattern = /shadowOffset:\s*{\s*width:\s*(-?\d+(\.\d+)?),\s*height:\s*(-?\d+(\.\d+)?)\s*}/;
  const shadowOpacityPattern = /shadowOpacity:\s*(-?\d+(\.\d+)?)/;
  const shadowRadiusPattern = /shadowRadius:\s*(-?\d+(\.\d+)?)/;
  const elevationPattern = /elevation:\s*(-?\d+(\.\d+)?)/;
  
  // Find style blocks with shadow properties
  let inStyleBlock = false;
  let styleBlockStart = -1;
  let styleBlockEnd = -1;
  let styleObjectName = '';
  let currentStyleObject = '';
  let styleObjects = [];
  
  // First pass: identify style objects
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we're entering a StyleSheet.create({}) block
    if (line.includes('StyleSheet.create({')) {
      inStyleBlock = true;
      styleBlockStart = i;
      continue;
    }
    
    // Check if we're exiting a StyleSheet.create({}) block
    if (inStyleBlock && line.includes('});')) {
      inStyleBlock = false;
      styleBlockEnd = i;
      continue;
    }
    
    // Check for style object declarations within the StyleSheet
    if (inStyleBlock && line.match(/^\s+\w+:\s*{/)) {
      if (currentStyleObject) {
        styleObjects.push({
          name: styleObjectName,
          content: currentStyleObject,
          hasShadow: currentStyleObject.includes('shadowColor') || 
                     currentStyleObject.includes('shadowOffset') ||
                     currentStyleObject.includes('shadowOpacity') ||
                     currentStyleObject.includes('shadowRadius')
        });
      }
      
      styleObjectName = line.match(/^\s+(\w+):/)[1];
      currentStyleObject = line;
    } else if (inStyleBlock && styleObjectName) {
      currentStyleObject += '\n' + line;
      
      // Check if we're closing a style object
      if (line.match(/^\s+},?$/)) {
        styleObjects.push({
          name: styleObjectName,
          content: currentStyleObject,
          hasShadow: currentStyleObject.includes('shadowColor') || 
                     currentStyleObject.includes('shadowOffset') ||
                     currentStyleObject.includes('shadowOpacity') ||
                     currentStyleObject.includes('shadowRadius')
        });
        styleObjectName = '';
        currentStyleObject = '';
      }
    }
  }
  
  // Filter style objects with shadow properties
  const shadowStyleObjects = styleObjects.filter(obj => obj.hasShadow);
  
  if (shadowStyleObjects.length === 0) {
    console.log(`${colors.green}No shadow styles found in ${filePath}${colors.reset}`);
    process.exit(0);
  }
  
  console.log(`${colors.green}Found ${shadowStyleObjects.length} style object(s) with shadow properties in ${filePath}${colors.reset}`);
  
  // Second pass: analyze shadow properties and suggest replacements
  shadowStyleObjects.forEach(styleObj => {
    console.log(`\n${colors.cyan}Style object: ${styleObj.name}${colors.reset}`);
    
    // Extract shadow properties
    let shadowColor = styleObj.content.match(shadowColorPattern)?.[1] || '#000';
    let shadowOffsetWidth = styleObj.content.match(shadowOffsetPattern)?.[1] || '0';
    let shadowOffsetHeight = styleObj.content.match(shadowOffsetPattern)?.[3] || '2';
    let shadowOpacity = styleObj.content.match(shadowOpacityPattern)?.[1] || '0.1';
    let shadowRadius = styleObj.content.match(shadowRadiusPattern)?.[1] || '4';
    let elevation = styleObj.content.match(elevationPattern)?.[1] || '2';
    
    // Print original properties
    console.log(`${colors.yellow}Original shadow properties:${colors.reset}`);
    if (styleObj.content.includes('shadowColor')) {
      console.log(`  shadowColor: '${shadowColor}'`);
    }
    if (styleObj.content.includes('shadowOffset')) {
      console.log(`  shadowOffset: { width: ${shadowOffsetWidth}, height: ${shadowOffsetHeight} }`);
    }
    if (styleObj.content.includes('shadowOpacity')) {
      console.log(`  shadowOpacity: ${shadowOpacity}`);
    }
    if (styleObj.content.includes('shadowRadius')) {
      console.log(`  shadowRadius: ${shadowRadius}`);
    }
    if (styleObj.content.includes('elevation')) {
      console.log(`  elevation: ${elevation}`);
    }
    
    // Suggest replacement
    console.log(`\n${colors.green}Suggested replacement:${colors.reset}`);
    console.log(`...createShadow({`);
    if (shadowColor !== '#000') {
      console.log(`  color: '${shadowColor}',`);
    }
    if (shadowOffsetWidth !== '0') {
      console.log(`  offsetX: ${shadowOffsetWidth},`);
    }
    if (shadowOffsetHeight !== '2') {
      console.log(`  offsetY: ${shadowOffsetHeight},`);
    }
    if (shadowOpacity !== '0.1') {
      console.log(`  opacity: ${shadowOpacity},`);
    }
    if (shadowRadius !== '4') {
      console.log(`  radius: ${shadowRadius},`);
    }
    if (elevation !== '2') {
      console.log(`  elevation: ${elevation},`);
    }
    console.log(`}),`);
  });
  
  console.log(`\n${colors.blue}Don't forget to add the import:${colors.reset}`);
  console.log(`import { createShadow } from '@/utils/styleUtils';`);
  
} catch (err) {
  console.error(`${colors.red}Error reading file: ${err.message}${colors.reset}`);
  process.exit(1);
} 