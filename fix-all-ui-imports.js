// Comprehensive UI imports fix script
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
  
  // Fix 1: @/ui/Component -> @/components/ui/Component
  newContent = newContent.replace(/@\/ui\/([A-Za-z0-9]+)/g, '@/components/ui/$1');
  
  // Fix 2: @/ui -> @/components/ui 
  newContent = newContent.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"]@\/ui['"];?/g, 
    'import {$1} from \'@/components/ui\';'
  );
  
  // Fix 3: relative ui imports like ../../ui -> @/components/ui
  newContent = newContent.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"](\.\.\/)+ui['"];?/g, 
    'import {$1} from \'@/components/ui\';'
  );
  
  // Fix 4: indirect relative imports like ../../ui/Component -> @/components/ui/Component
  newContent = newContent.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"](\.\.\/)+ui\/([A-Za-z0-9]+)['"];?/g, 
    'import {$1} from \'@/components/ui/$3\';'
  );
  
  // Fix 5: import * as UI from '@/ui' -> import * as UI from '@/components/ui'
  newContent = newContent.replace(
    /import\s+\*\s+as\s+([A-Za-z0-9]+)\s+from\s+['"]@\/ui['"];?/g,
    'import * as $1 from \'@/components/ui\';'
  );
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Fixed UI imports in ${file}`);
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} files with UI import issues.`); 