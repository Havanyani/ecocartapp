#!/usr/bin/env ts-node
/**
 * Image Migration Script
 * 
 * This script scans the source code for React Native Image components
 * and converts them to our optimized OptimizedImage component.
 * 
 * Usage:
 *   npx ts-node scripts/migrate-to-optimized-images.ts --dir=src/screens
 */

import * as chalk from 'chalk';
import * as fs from 'fs';
import * as glob from 'glob';
import { parse, print } from 'recast';
import * as tsParser from 'recast/parsers/typescript';
import * as yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Define arguments
const argv = yargs(hideBin(process.argv))
  .option('dir', {
    type: 'string',
    description: 'Directory to scan for files',
    default: 'src',
  })
  .option('ext', {
    type: 'string',
    description: 'File extensions to scan',
    default: '{tsx,jsx,ts,js}',
  })
  .option('dry-run', {
    type: 'boolean',
    description: 'Run without making changes',
    default: false,
  })
  .option('verbose', {
    type: 'boolean',
    description: 'Show detailed output',
    default: false,
  })
  .option('placeholder', {
    type: 'string',
    description: 'Path to default placeholder image',
    default: '@/assets/images/placeholder.png',
  })
  .help()
  .alias('help', 'h')
  .parseSync();

// Stats tracking
const stats = {
  filesScanned: 0,
  filesModified: 0,
  imagesConverted: 0,
  importStatementsAdded: 0,
  errors: 0,
};

// Path for placeholder image
const placeholderPath = argv.placeholder;

/**
 * Map React Native Image resizeMode to OptimizedImage contentFit
 */
function mapResizeModeToContentFit(resizeMode: string): string {
  const mapping: Record<string, string> = {
    'cover': 'cover',
    'contain': 'contain',
    'stretch': 'fill',
    'center': 'none',
    'repeat': 'none',
  };

  return mapping[resizeMode] || 'cover'; // Default to cover
}

/**
 * Find files to process
 */
function findFiles(directory: string, extensions: string): string[] {
  const pattern = `${directory}/**/*.${extensions}`;
  return glob.sync(pattern, { nodir: true });
}

/**
 * Process a single file
 */
function processFile(filePath: string): boolean {
  try {
    // Read file
    const code = fs.readFileSync(filePath, 'utf-8');
    
    // Parse the file
    const ast = parse(code, {
      parser: tsParser,
    });
    
    let modified = false;
    let hasOptimizedImageImport = false;
    let hasReactNativeImageImport = false;
    let hasRemovedReactNativeImageImport = false;
    
    // First pass - check imports and identify Image usage
    const importVisitor = {
      visitImportDeclaration(path: any) {
        const node = path.node;
        
        // Check for React Native import with Image
        if (node.source.value === 'react-native') {
          const specifiers = node.specifiers || [];
          const hasImageSpecifier = specifiers.some((specifier: any) => 
            specifier.imported && specifier.imported.name === 'Image'
          );
          
          if (hasImageSpecifier) {
            hasReactNativeImageImport = true;
          }
        }
        
        // Check if OptimizedImage is already imported
        if (node.source.value === '@/components/OptimizedImage') {
          hasOptimizedImageImport = true;
        }
        
        this.traverse(path);
      }
    };
    
    // Apply the visitor to find imports
    recast.visit(ast, importVisitor);
    
    // If no React Native Image import, skip file
    if (!hasReactNativeImageImport) {
      if (argv.verbose) {
        console.log(chalk.gray(`No React Native Image imports in ${filePath}`));
      }
      return false;
    }
    
    // Second pass - transform Image components to OptimizedImage
    const transformer = {
      visitJSXElement(path: any) {
        const element = path.node;
        
        // Check if this is a React Native Image component
        if (element.openingElement.name.name === 'Image') {
          let source;
          let style;
          let resizeMode;
          
          // Extract props from the React Native Image
          element.openingElement.attributes.forEach((attr: any) => {
            if (attr.name && attr.name.name === 'source') {
              source = attr;
            } else if (attr.name && attr.name.name === 'style') {
              style = attr;
            } else if (attr.name && attr.name.name === 'resizeMode') {
              resizeMode = attr.value.value;
            }
          });
          
          // Only transform if we have a source prop
          if (source) {
            // Create new props array for OptimizedImage
            const newProps = [];
            
            // Add source prop
            newProps.push(source);
            
            // Add style prop if exists
            if (style) {
              newProps.push(style);
            }
            
            // Convert resizeMode to contentFit
            if (resizeMode) {
              const contentFit = mapResizeModeToContentFit(resizeMode);
              newProps.push({
                type: 'JSXAttribute',
                name: {
                  type: 'JSXIdentifier',
                  name: 'contentFit',
                },
                value: {
                  type: 'StringLiteral',
                  value: contentFit,
                },
              });
            }
            
            // Add placeholder image
            newProps.push({
              type: 'JSXAttribute',
              name: {
                type: 'JSXIdentifier',
                name: 'placeholder',
              },
              value: {
                type: 'JSXExpressionContainer',
                expression: {
                  type: 'CallExpression',
                  callee: {
                    type: 'Identifier',
                    name: 'require',
                  },
                  arguments: [
                    {
                      type: 'StringLiteral',
                      value: placeholderPath,
                    },
                  ],
                },
              },
            });
            
            // Add lazyLoad prop
            newProps.push({
              type: 'JSXAttribute',
              name: {
                type: 'JSXIdentifier',
                name: 'lazyLoad',
              },
              value: {
                type: 'JSXExpressionContainer',
                expression: {
                  type: 'BooleanLiteral',
                  value: true,
                },
              },
            });
            
            // Create new OptimizedImage element
            element.openingElement.name.name = 'OptimizedImage';
            element.openingElement.attributes = newProps;
            
            // If there's a closing element, rename it too
            if (element.closingElement) {
              element.closingElement.name.name = 'OptimizedImage';
            }
            
            modified = true;
            stats.imagesConverted++;
          }
        }
        
        this.traverse(path);
      }
    };
    
    // Apply the transformation
    recast.visit(ast, transformer);
    
    // If we've modified the file, ensure we have the OptimizedImage import
    if (modified && !hasOptimizedImageImport) {
      // Find where to insert the import
      const body = ast.program.body;
      
      // Create import statement
      const importOptimizedImage = parse(
        `import OptimizedImage from '@/components/OptimizedImage';`,
        { parser: tsParser }
      ).program.body[0];
      
      // Find the last import statement
      let lastImportIndex = -1;
      body.forEach((node: any, index: number) => {
        if (node.type === 'ImportDeclaration') {
          lastImportIndex = index;
        }
      });
      
      // Insert after the last import
      body.splice(lastImportIndex + 1, 0, importOptimizedImage);
      stats.importStatementsAdded++;
      
      // Check if we can remove the Image import from react-native
      if (hasReactNativeImageImport) {
        for (let i = 0; i < body.length; i++) {
          const node = body[i];
          if (node.type === 'ImportDeclaration' && node.source.value === 'react-native') {
            // Get the specifiers
            const specifiers = node.specifiers || [];
            // Filter out Image specifier
            const nonImageSpecifiers = specifiers.filter((s: any) => 
              !(s.imported && s.imported.name === 'Image')
            );
            
            // If we still have specifiers, update the import
            if (nonImageSpecifiers.length > 0) {
              node.specifiers = nonImageSpecifiers;
            } 
            // If no specifiers left, remove the import
            else if (nonImageSpecifiers.length === 0) {
              body.splice(i, 1);
              i--;
            }
            
            hasRemovedReactNativeImageImport = true;
          }
        }
      }
    }
    
    // Only save if modified and not in dry-run mode
    if (modified && !argv['dry-run']) {
      fs.writeFileSync(filePath, print(ast).code);
      stats.filesModified++;
      if (argv.verbose) {
        console.log(chalk.green(`✓ Updated ${filePath}`));
        console.log(`  - Converted ${chalk.bold(stats.imagesConverted)} Image components`);
        console.log(`  - Added OptimizedImage import: ${hasOptimizedImageImport ? 'No (already exists)' : 'Yes'}`);
        console.log(`  - Removed Image from react-native import: ${hasRemovedReactNativeImageImport ? 'Yes' : 'No'}`);
      }
    } else if (modified) {
      // In dry-run mode, just report
      stats.filesModified++;
      if (argv.verbose) {
        console.log(chalk.yellow(`Would update ${filePath} (dry run)`));
        console.log(`  - Would convert ${chalk.bold(stats.imagesConverted)} Image components`);
        console.log(`  - Would add OptimizedImage import: ${hasOptimizedImageImport ? 'No (already exists)' : 'Yes'}`);
        console.log(`  - Would remove Image from react-native import: ${hasRemovedReactNativeImageImport ? 'Yes' : 'No'}`);
      }
    }
    
    return modified;
  } catch (error) {
    console.error(chalk.red(`Error processing ${filePath}:`), error);
    stats.errors++;
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log(chalk.blue(`🔍 Scanning directory: ${argv.dir}`));
  console.log(chalk.blue(`🔍 File extensions: ${argv.ext}`));
  if (argv['dry-run']) {
    console.log(chalk.yellow('⚠️  Dry run mode - no files will be modified'));
  }
  
  // Find files
  const files = findFiles(argv.dir, argv.ext);
  console.log(chalk.blue(`🔍 Found ${files.length} files to scan`));
  
  // Process files
  files.forEach(file => {
    stats.filesScanned++;
    processFile(file);
    
    // Log progress every 20 files
    if (stats.filesScanned % 20 === 0) {
      console.log(chalk.gray(`Progress: ${stats.filesScanned}/${files.length} files scanned`));
    }
  });
  
  // Print summary
  console.log('\n' + chalk.green('✨ Migration Summary:'));
  console.log(`📁 Files scanned: ${stats.filesScanned}`);
  console.log(`✏️  Files modified: ${stats.filesModified}`);
  console.log(`🖼️  Image components converted: ${stats.imagesConverted}`);
  console.log(`📥 Import statements added: ${stats.importStatementsAdded}`);
  console.log(`❌ Errors: ${stats.errors}`);
  
  if (argv['dry-run']) {
    console.log(chalk.yellow('\n⚠️  This was a dry run. Run without --dry-run to apply changes.'));
  }
  
  if (stats.errors > 0) {
    console.log(chalk.red('\n⚠️  There were errors during migration. Please check the output above.'));
    process.exit(1);
  }
}

// Run the script
main(); 