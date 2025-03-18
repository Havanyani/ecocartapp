import * as fs from 'fs';
import * as path from 'path';

const UTILS_DIR = '../src/utils';

interface FileMapping {
  jsFile: string;
  tsFile: string;
  status: 'js-only' | 'ts-only' | 'both';
}

function getUtilsFiles(): FileMapping[] {
  const files = fs.readdirSync(path.resolve(__dirname, UTILS_DIR));
  const mappings: FileMapping[] = [];
  
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const tsFiles = files.filter(f => f.endsWith('.ts'));
  
  jsFiles.forEach(jsFile => {
    const baseName = jsFile.replace('.js', '');
    const tsFile = `${baseName}.ts`;
    
    mappings.push({
      jsFile,
      tsFile,
      status: tsFiles.includes(tsFile) ? 'both' : 'js-only'
    });
  });
  
  tsFiles.forEach(tsFile => {
    const baseName = tsFile.replace('.ts', '');
    const jsFile = `${baseName}.js`;
    
    if (!jsFiles.includes(jsFile)) {
      mappings.push({
        jsFile,
        tsFile,
        status: 'ts-only'
      });
    }
  });
  
  return mappings;
}

function analyzeConversionStatus(): void {
  const mappings = getUtilsFiles();
  
  console.log('\nTypeScript Conversion Status:');
  console.log('----------------------------');
  
  const jsOnly = mappings.filter(m => m.status === 'js-only');
  const tsOnly = mappings.filter(m => m.status === 'ts-only');
  const both = mappings.filter(m => m.status === 'both');
  
  console.log('\nFiles needing conversion (JS only):');
  jsOnly.forEach(m => console.log(`- ${m.jsFile}`));
  
  console.log('\nFiles to verify and delete JS version (Both JS and TS):');
  both.forEach(m => console.log(`- ${m.jsFile} → ${m.tsFile}`));
  
  console.log('\nCompleted conversions (TS only):');
  tsOnly.forEach(m => console.log(`- ${m.tsFile}`));
  
  console.log('\nSummary:');
  console.log(`Total files: ${mappings.length}`);
  console.log(`Need conversion: ${jsOnly.length}`);
  console.log(`Need verification: ${both.length}`);
  console.log(`Completed: ${tsOnly.length}`);
}

analyzeConversionStatus(); 