// Fix malformed UI imports script
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
  
  // Fix imports from @/ui/Component to @/components/ui/Component
  const newContent = content.replace(/@\/ui\/([A-Za-z0-9]+)/g, '@/components/ui/$1');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Fixed UI imports in ${file}`);
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} files with UI import issues.`); 