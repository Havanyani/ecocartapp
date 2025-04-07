/**
 * Expo CLI Patcher for "Body is unusable" Error
 * 
 * This script applies a patch to the Expo CLI code to fix the "Body is unusable" error
 * by modifying the way HTTP responses are handled.
 */

const fs = require('fs');
const path = require('path');

// Define the target files to patch
const targets = [
  {
    file: path.join('node_modules', '@expo', 'cli', 'build', 'api', 'getNativeModuleVersions.js'),
    searchPattern: /const response = await fetch\((.*?)\)/g,
    replacement: `const response = await fetch($1)
    // Clone the response before reading it to prevent "Body is unusable" error
    const clonedResponse = response.clone();`,
    
    searchPattern2: /const data = await response\.json\(\)/g,
    replacement2: `const data = await clonedResponse.json()`,
  },
  {
    file: path.join('node_modules', '@expo', 'cli', 'build', 'start', 'doctor', 'dependencies', 'bundledNativeModules.js'),
    searchPattern: /async function getVersionedNativeModulesAsync.*?{/g,
    replacement: `async function getVersionedNativeModulesAsync() {
    try {`,
    
    searchPattern2: /return getNativeModuleVersionsAsync.*?;/g,
    replacement2: `return getNativeModuleVersionsAsync();
    } catch (error) {
      console.warn('Error in getVersionedNativeModulesAsync:', error.message);
      return {}; // Return empty object on error to allow bundling to continue
    }`,
  }
];

console.log('🔧 Patching Expo CLI to fix "Body is unusable" error...');

let patchCount = 0;

// Apply patches to each target
targets.forEach(({ file, searchPattern, replacement, searchPattern2, replacement2 }) => {
  const filePath = path.resolve(process.cwd(), file);
  
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File not found: ${filePath}`);
    return;
  }
  
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Apply patches
    const originalContent = content;
    content = content.replace(searchPattern, replacement);
    
    if (searchPattern2 && replacement2) {
      content = content.replace(searchPattern2, replacement2);
    }
    
    // If content was modified, write it back
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Successfully patched: ${file}`);
      patchCount++;
    } else {
      console.log(`ℹ️ No changes needed for: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error patching ${file}:`, error.message);
  }
});

if (patchCount > 0) {
  console.log(`\n✅ Patched ${patchCount} file(s) successfully!`);
  console.log('You can now run the web version with: npm run web-fix');
} else {
  console.log('\n⚠️ No files were patched. The error might be in a different location or the CLI structure has changed.');
  console.log('Try using the web-fix script which uses environment variables to bypass the problematic code.');
} 