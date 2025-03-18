/**
 * update-imports.ts
 * 
 * This script updates imports in the codebase to use the new consolidated utilities.
 * It replaces:
 * - Performance.ts, PerformanceBenchmark.ts, PerformanceMetrics.ts, WebSocketPerformance.ts → PerformanceMonitoring.ts
 * - MessageQueue.ts, MessageValidation.ts, MessageCompression.ts, MessageEncryption.ts → MessageHandling.ts
 * - RouteOptimizer.ts, DeliveryRouteOptimizer.tsx → RouteOptimization.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Mapping of old imports to new imports
const importMappings = [
  // Performance monitoring
  {
    pattern: /import\s+{([^}]*)}\s+from\s+['"]([^'"]*\/Performance)['"]/g,
    replacement: (match: string, imports: string, path: string) => {
      // Extract the imports
      const importedItems = imports.split(',').map(item => item.trim());
      
      // Map old imports to new ones
      const newImports = importedItems.map(item => {
        if (item === 'Performance') return 'PerformanceMonitor';
        if (item === 'PerformanceMonitor') return 'PerformanceMonitor';
        return item;
      }).join(', ');
      
      // Replace the path
      const newPath = path.replace(/\/Performance$/, '/PerformanceMonitoring');
      
      return `import { ${newImports} } from '${newPath}'`;
    }
  },
  {
    pattern: /import\s+{([^}]*)}\s+from\s+['"]([^'"]*\/PerformanceBenchmark)['"]/g,
    replacement: (match: string, imports: string, path: string) => {
      // Extract the imports
      const importedItems = imports.split(',').map(item => item.trim());
      
      // Map old imports to new ones
      const newImports = importedItems.map(item => {
        if (item === 'PerformanceBenchmark') return 'PerformanceMonitor';
        return item;
      }).join(', ');
      
      // Replace the path
      const newPath = path.replace(/\/PerformanceBenchmark$/, '/PerformanceMonitoring');
      
      return `import { ${newImports} } from '${newPath}'`;
    }
  },
  {
    pattern: /import\s+{([^}]*)}\s+from\s+['"]([^'"]*\/PerformanceMetrics)['"]/g,
    replacement: (match: string, imports: string, path: string) => {
      // Extract the imports
      const importedItems = imports.split(',').map(item => item.trim());
      
      // Map old imports to new ones
      const newImports = importedItems.map(item => {
        if (item === 'performanceMetrics') return 'PerformanceMonitor';
        return item;
      }).join(', ');
      
      // Replace the path
      const newPath = path.replace(/\/PerformanceMetrics$/, '/PerformanceMonitoring');
      
      return `import { ${newImports} } from '${newPath}'`;
    }
  },
  {
    pattern: /import\s+{([^}]*)}\s+from\s+['"]([^'"]*\/WebSocketPerformance)['"]/g,
    replacement: (match: string, imports: string, path: string) => {
      // Extract the imports
      const importedItems = imports.split(',').map(item => item.trim());
      
      // Map old imports to new ones
      const newImports = importedItems.map(item => {
        if (item === 'WebSocketPerformance') return 'PerformanceMonitor';
        return item;
      }).join(', ');
      
      // Replace the path
      const newPath = path.replace(/\/WebSocketPerformance$/, '/PerformanceMonitoring');
      
      return `import { ${newImports} } from '${newPath}'`;
    }
  },
  
  // Message handling
  {
    pattern: /import\s+{([^}]*)}\s+from\s+['"]([^'"]*\/MessageQueue)['"]/g,
    replacement: (match: string, imports: string, path: string) => {
      // Extract the imports
      const importedItems = imports.split(',').map(item => item.trim());
      
      // Replace the path
      const newPath = path.replace(/\/MessageQueue$/, '/MessageHandling');
      
      return `import { ${imports} } from '${newPath}'`;
    }
  },
  {
    pattern: /import\s+{([^}]*)}\s+from\s+['"]([^'"]*\/MessageValidation)['"]/g,
    replacement: (match: string, imports: string, path: string) => {
      // Extract the imports
      const importedItems = imports.split(',').map(item => item.trim());
      
      // Replace the path
      const newPath = path.replace(/\/MessageValidation$/, '/MessageHandling');
      
      return `import { ${imports} } from '${newPath}'`;
    }
  },
  {
    pattern: /import\s+{([^}]*)}\s+from\s+['"]([^'"]*\/MessageCompression)['"]/g,
    replacement: (match: string, imports: string, path: string) => {
      // Extract the imports
      const importedItems = imports.split(',').map(item => item.trim());
      
      // Replace the path
      const newPath = path.replace(/\/MessageCompression$/, '/MessageHandling');
      
      return `import { ${imports} } from '${newPath}'`;
    }
  },
  {
    pattern: /import\s+{([^}]*)}\s+from\s+['"]([^'"]*\/MessageEncryption)['"]/g,
    replacement: (match: string, imports: string, path: string) => {
      // Extract the imports
      const importedItems = imports.split(',').map(item => item.trim());
      
      // Replace the path
      const newPath = path.replace(/\/MessageEncryption$/, '/MessageHandling');
      
      return `import { ${imports} } from '${newPath}'`;
    }
  },
  
  // Route optimization
  {
    pattern: /import\s+{([^}]*)}\s+from\s+['"]([^'"]*\/RouteOptimizer)['"]/g,
    replacement: (match: string, imports: string, path: string) => {
      // Extract the imports
      const importedItems = imports.split(',').map(item => item.trim());
      
      // Replace the path
      const newPath = path.replace(/\/RouteOptimizer$/, '/RouteOptimization');
      
      return `import { ${imports} } from '${newPath}'`;
    }
  },
  {
    pattern: /import\s+{([^}]*)}\s+from\s+['"]([^'"]*\/DeliveryRouteOptimizer)['"]/g,
    replacement: (match: string, imports: string, path: string) => {
      // Extract the imports
      const importedItems = imports.split(',').map(item => item.trim());
      
      // Map old imports to new ones
      const newImports = importedItems.map(item => {
        if (item === 'DeliveryRouteOptimizer') return 'RouteOptimizer';
        return item;
      }).join(', ');
      
      // Replace the path
      const newPath = path.replace(/\/DeliveryRouteOptimizer$/, '/RouteOptimization');
      
      return `import { ${newImports} } from '${newPath}'`;
    }
  }
];

// Function to update imports in a file
async function updateImportsInFile(filePath: string): Promise<boolean> {
  try {
    // Read the file
    const content = await readFile(filePath, 'utf8');
    
    // Apply all import mappings
    let updatedContent = content;
    let hasChanges = false;
    
    for (const mapping of importMappings) {
      const newContent = updatedContent.replace(mapping.pattern, mapping.replacement);
      if (newContent !== updatedContent) {
        hasChanges = true;
        updatedContent = newContent;
      }
    }
    
    // Write the file if changes were made
    if (hasChanges) {
      await writeFile(filePath, updatedContent, 'utf8');
      console.log(`Updated imports in ${filePath}`);
    }
    
    return hasChanges;
  } catch (error) {
    console.error(`Error updating imports in ${filePath}:`, error);
    return false;
  }
}

// Function to recursively process files in a directory
async function processDirectory(dirPath: string): Promise<number> {
  let updatedCount = 0;
  
  try {
    const entries = await readdir(dirPath);
    
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry);
      const entryStat = await stat(entryPath);
      
      if (entryStat.isDirectory()) {
        // Skip node_modules and .git directories
        if (entry === 'node_modules' || entry === '.git') {
          continue;
        }
        
        // Process subdirectory
        updatedCount += await processDirectory(entryPath);
      } else if (entryStat.isFile()) {
        // Only process TypeScript and JavaScript files
        if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
          const updated = await updateImportsInFile(entryPath);
          if (updated) {
            updatedCount++;
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error);
  }
  
  return updatedCount;
}

// Main function
async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const srcDir = path.join(rootDir, 'src');
  
  console.log('Updating imports to use consolidated utilities...');
  
  const updatedCount = await processDirectory(srcDir);
  
  console.log(`Done! Updated imports in ${updatedCount} files.`);
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 