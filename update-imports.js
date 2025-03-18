"// Import path update script - Fix malformed imports" 

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all source files
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  ignore: ['src/**/__tests__/**', 'src/tests/**', '**/node_modules/**']
});

let fixedCount = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Look for malformed imports with @/../
  let newContent = content.replace(/@\/\.\.\//g, '@/');
  
  // Also fix incorrect paths like @/../contexts to @/contexts
  newContent = newContent.replace(/@\/\.\./g, '@');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Fixed malformed imports in ${file}`);
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} files with malformed imports.`); 