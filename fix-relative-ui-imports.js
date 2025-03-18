// Fix relative UI imports script
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
  
  // Fix relative imports like "../../ui" to "@/components/ui"
  const newContent = content.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"](\.\.\/)+ui['"];?/g, 
    'import {$1} from \'@/components/ui\';'
  );
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Fixed relative UI import in ${file}`);
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} files with relative UI import issues.`); 