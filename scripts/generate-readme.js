/**
 * EcoCart README Generator Script
 * 
 * This script generates standardized README files for components that don't have them,
 * based on the component's TypeScript definition file.
 * 
 * Usage:
 * node scripts/generate-readme.js [component-path]
 * 
 * Example:
 * node scripts/generate-readme.js src/components/ui/Button.tsx
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Template for the generated README
const README_TEMPLATE = `# {{ComponentName}}

## Overview
{{ComponentDescription}}

## Usage

\`\`\`tsx
import { {{ComponentName}} } from '@/components/{{ComponentPath}}';

// Basic usage
<{{ComponentName}} {{BasicProps}} />

// Advanced usage with all props
<{{ComponentName}} {{AllProps}} />
\`\`\`

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
{{PropTable}}

## Features
- {{Feature1}}
- {{Feature2}}
- Additional features and capabilities

## Styling
Describes how the component can be styled, customized, or themed.

\`\`\`tsx
// Example of styling options
<{{ComponentName}} 
  style={{ /* style properties */ }}
/>
\`\`\`

## Best Practices
- **Do**: Use the component for {{RecommendedUse}}
- **Don't**: Avoid {{NotRecommendedUse}}
- **Accessibility**: Ensure {{AccessibilityTip}}

## Examples

### Basic Example
\`\`\`tsx
<{{ComponentName}} {{BasicExample}} />
\`\`\`

### With Custom Styling
\`\`\`tsx
<{{ComponentName}} 
  {{BasicProps}}
  style={{ 
    // Custom styles
  }} 
/>
\`\`\`

### Complex Integration
\`\`\`tsx
<{{ComponentName}} 
  {{ComplexExample}}
>
  {/* Child content if applicable */}
</{{ComponentName}}>
\`\`\`

## Implementation Details
Brief explanation of how the component works internally.

## Related Components
{{RelatedComponents}}

## Related Documentation
- [EcoCart Component Guidelines](../../../docs/component-guidelines.md)
`;

/**
 * Extracts component name from file path
 */
function extractComponentName(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  return fileName;
}

/**
 * Extracts component path relative to src/components
 */
function extractComponentPath(filePath) {
  const relativePath = path.relative('src/components', filePath);
  return path.dirname(relativePath);
}

/**
 * Attempts to parse TypeScript interface for props
 */
async function extractPropsFromTypeScript(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const props = [];
    
    // Look for interface or type definitions for props
    const interfaceMatch = content.match(/interface\s+(\w+Props)\s*{([^}]*)}/s);
    const typeMatch = content.match(/type\s+(\w+Props)\s*=\s*{([^}]*)}/s);
    
    const propsContent = interfaceMatch ? interfaceMatch[2] : typeMatch ? typeMatch[2] : '';
    
    // Very basic prop parsing - would need a proper TypeScript parser for better results
    if (propsContent) {
      const propLines = propsContent.split('\n');
      
      for (const line of propLines) {
        const propMatch = line.match(/(\w+)(\??):\s*([^;/]+);?\s*(?:\/\/\s*(.*))?/);
        
        if (propMatch) {
          const [_, name, optional, type, comment] = propMatch;
          
          props.push({
            name,
            type: type.trim(),
            required: optional !== '?',
            description: comment ? comment.trim() : 'Description needed',
          });
        }
      }
    }
    
    return props;
  } catch (error) {
    console.error(`Error extracting props from ${filePath}:`, error);
    return [];
  }
}

/**
 * Generates a prop table based on extracted props
 */
function generatePropTable(props) {
  if (props.length === 0) {
    return '| `prop` | `type` | No | `undefined` | Description needed |';
  }
  
  return props.map(prop => {
    return `| \`${prop.name}\` | \`${prop.type}\` | ${prop.required ? 'Yes' : 'No'} | ${prop.required ? '-' : '`undefined`'} | ${prop.description} |`;
  }).join('\n');
}

/**
 * Generates basic props string for usage example
 */
function generateBasicProps(props) {
  const requiredProps = props.filter(prop => prop.required);
  
  if (requiredProps.length === 0) {
    return 'prop="value"';
  }
  
  return requiredProps.map(prop => {
    if (prop.type.includes('string')) {
      return `${prop.name}="value"`;
    } else if (prop.type.includes('number')) {
      return `${prop.name}={42}`;
    } else if (prop.type.includes('boolean')) {
      return `${prop.name}={true}`;
    } else if (prop.type.includes('function') || prop.type.includes('=>')) {
      return `${prop.name}={() => {}}`;
    } else {
      return `${prop.name}={${prop.name}Value}`;
    }
  }).join('\n  ');
}

/**
 * Generates all props string for advanced usage example
 */
function generateAllProps(props) {
  if (props.length === 0) {
    return 'prop="value"';
  }
  
  return props.map(prop => {
    if (prop.type.includes('string')) {
      return `${prop.name}="value"`;
    } else if (prop.type.includes('number')) {
      return `${prop.name}={42}`;
    } else if (prop.type.includes('boolean')) {
      return `${prop.name}={true}`;
    } else if (prop.type.includes('function') || prop.type.includes('=>')) {
      return `${prop.name}={() => {}}`;
    } else {
      return `${prop.name}={${prop.name}Value}`;
    }
  }).join('\n  ');
}

/**
 * Attempts to find related components by analyzing imports
 */
async function findRelatedComponents(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const relatedComponents = [];
    
    // Look for component imports
    const importMatches = content.matchAll(/import\s+{([^}]+)}\s+from\s+['"]@\/components\/([^'"]+)['"]/g);
    
    for (const match of importMatches) {
      const importNames = match[1].split(',').map(name => name.trim());
      
      for (const name of importNames) {
        if (name !== extractComponentName(filePath) && /^[A-Z]/.test(name)) {
          relatedComponents.push(name);
        }
      }
    }
    
    if (relatedComponents.length === 0) {
      return '- No directly related components';
    }
    
    return relatedComponents.map(name => `- \`${name}\`: Related component`).join('\n');
  } catch (error) {
    console.error(`Error finding related components for ${filePath}:`, error);
    return '- No directly related components';
  }
}

/**
 * Looks for JSDoc comments to extract component description
 */
async function extractComponentDescription(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Look for component JSDoc comment
    const jsdocMatch = content.match(/\/\*\*\s*\n([^*]|\*[^/])*\*\/\s*\nexport\s+(function|const)\s+\w+/);
    
    if (jsdocMatch) {
      const jsdoc = jsdocMatch[0];
      const descriptionMatch = jsdoc.match(/\*\s*([^@\n]+)/);
      
      if (descriptionMatch) {
        return descriptionMatch[1].trim();
      }
    }
    
    // Look for component name to create a generic description
    const componentName = extractComponentName(filePath);
    return `A reusable ${componentName} component for the EcoCart application.`;
  } catch (error) {
    console.error(`Error extracting description from ${filePath}:`, error);
    return 'A reusable UI component for the EcoCart application.';
  }
}

/**
 * Generates a README file for a component
 */
async function generateReadme(componentPath) {
  try {
    // Ensure the path is absolute
    const absolutePath = path.isAbsolute(componentPath) 
      ? componentPath 
      : path.join(process.cwd(), componentPath);
    
    // Check if the file exists
    const exists = fs.existsSync(absolutePath);
    if (!exists) {
      console.error(`Component file not found: ${absolutePath}`);
      return;
    }
    
    const componentName = extractComponentName(absolutePath);
    const componentDir = path.dirname(absolutePath);
    const relativeComponentPath = extractComponentPath(absolutePath);
    
    // Extract information from the component file
    const props = await extractPropsFromTypeScript(absolutePath);
    const relatedComponents = await findRelatedComponents(absolutePath);
    const componentDescription = await extractComponentDescription(absolutePath);
    
    // Generate README content
    let readme = README_TEMPLATE;
    readme = readme.replace(/{{ComponentName}}/g, componentName);
    readme = readme.replace(/{{ComponentPath}}/g, relativeComponentPath);
    readme = readme.replace(/{{ComponentDescription}}/g, componentDescription);
    readme = readme.replace(/{{PropTable}}/g, generatePropTable(props));
    readme = readme.replace(/{{BasicProps}}/g, generateBasicProps(props));
    readme = readme.replace(/{{AllProps}}/g, generateAllProps(props));
    readme = readme.replace(/{{BasicExample}}/g, generateBasicProps(props));
    readme = readme.replace(/{{ComplexExample}}/g, generateAllProps(props));
    readme = readme.replace(/{{RelatedComponents}}/g, relatedComponents);
    
    // Replace placeholders with generic text
    readme = readme.replace(/{{Feature1}}/g, `Primary functionality of the ${componentName} component`);
    readme = readme.replace(/{{Feature2}}/g, `Secondary functionality of the ${componentName} component`);
    readme = readme.replace(/{{RecommendedUse}}/g, 'its intended purpose');
    readme = readme.replace(/{{NotRecommendedUse}}/g, 'using the component for unintended purposes');
    readme = readme.replace(/{{AccessibilityTip}}/g, 'proper semantic elements and ARIA attributes are used');
    
    // Determine the output file path
    const readmePath = path.join(componentDir, `${componentName}.README.md`);
    
    // Write the README file
    await writeFile(readmePath, readme, 'utf8');
    
    console.log(`Generated README file: ${readmePath}`);
  } catch (error) {
    console.error(`Error generating README for ${componentPath}:`, error);
  }
}

/**
 * Recursively finds all component files in a directory
 */
async function findComponentFiles(dir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      const subResults = await findComponentFiles(fullPath);
      results.push(...subResults);
    } else if (
      entry.name.endsWith('.tsx') && 
      !entry.name.includes('.test.') &&
      !entry.name.includes('.spec.')
    ) {
      // Check if it's likely a component (first letter capitalized)
      if (/^[A-Z]/.test(entry.name.charAt(0))) {
        // Check if README exists
        const baseName = path.basename(entry.name, '.tsx');
        const readmePath = path.join(dir, `${baseName}.README.md`);
        
        if (!fs.existsSync(readmePath)) {
          results.push(fullPath);
        }
      }
    }
  }
  
  return results;
}

/**
 * Main function
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    
    // If a specific component path is provided
    if (args.length > 0) {
      const componentPath = args[0];
      await generateReadme(componentPath);
      return;
    }
    
    // Otherwise, find components without README files
    console.log('Finding components without README files...');
    
    const componentDirs = [
      'src/components/ui',
      'src/components/collection',
      'src/components/community',
      // Add other component directories as needed
    ];
    
    let componentsWithoutReadme = [];
    
    for (const dir of componentDirs) {
      if (fs.existsSync(dir)) {
        const components = await findComponentFiles(dir);
        componentsWithoutReadme.push(...components);
      }
    }
    
    console.log(`Found ${componentsWithoutReadme.length} components without README files.`);
    
    if (componentsWithoutReadme.length === 0) {
      console.log('All components have README files.');
      return;
    }
    
    // Ask if user wants to generate READMEs for all components
    console.log('\nComponents without README files:');
    componentsWithoutReadme.forEach((comp, i) => {
      console.log(`${i + 1}. ${comp}`);
    });
    
    console.log('\nTo generate a README for a specific component, run:');
    console.log('node scripts/generate-readme.js [component-path]');
    
    console.log('\nTo generate READMEs for all listed components, run:');
    console.log('node scripts/generate-readme.js --all');
    
    // If --all flag is provided, generate READMEs for all components
    if (args.includes('--all')) {
      console.log('\nGenerating READMEs for all components without documentation...');
      
      for (const componentPath of componentsWithoutReadme) {
        await generateReadme(componentPath);
      }
      
      console.log('\nAll READMEs generated successfully!');
    }
    
  } catch (error) {
    console.error('Error in README generator:', error);
    process.exit(1);
  }
}

// Run the script
main(); 