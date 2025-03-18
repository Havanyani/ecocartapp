// Fix ThemedText import paths
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
  
  // Apply multiple fixes in one pass
  let newContent = content;
  
  // Fix 1: @/ThemedText -> @/components/ui/ThemedText
  newContent = newContent.replace(
    /import\s+\{([^}]*ThemedText[^}]*)\}\s+from\s+['"]@\/ThemedText['"];?/g,
    'import {$1} from \'@/components/ui/ThemedText\';'
  );
  
  // Fix 2: relative imports like ../../../ThemedText -> @/components/ui/ThemedText
  newContent = newContent.replace(
    /import\s+\{([^}]*ThemedText[^}]*)\}\s+from\s+['"](\.\.\/)+ThemedText['"];?/g,
    'import {$1} from \'@/components/ui/ThemedText\';'
  );
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Fixed ThemedText imports in ${file}`);
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} files with ThemedText import issues.`); 