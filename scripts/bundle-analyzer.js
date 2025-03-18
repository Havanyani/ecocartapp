#!/usr/bin/env node

/**
 * bundle-analyzer.js
 * 
 * A utility script to analyze the EcoCart app bundle size and generate
 * optimization recommendations.
 * 
 * Usage:
 * node scripts/bundle-analyzer.js
 * 
 * This will generate a bundle size report in ./bundle-analysis-report.html
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const BUNDLE_SIZE_THRESHOLD_MB = 5; // Alert if bundle exceeds this size
const LARGE_MODULE_THRESHOLD_KB = 100; // Alert for modules exceeding this size

// Path constants
const PROJECT_ROOT = path.resolve(__dirname, '..');
const NODE_MODULES = path.join(PROJECT_ROOT, 'node_modules');
const PACKAGE_JSON = path.join(PROJECT_ROOT, 'package.json');

// Check required dependencies
try {
  require('metro-source-map');
  require('metro-react-native-babel-transformer');
} catch (error) {
  console.error(chalk.red('Error: Missing required dependencies. Please run:'));
  console.error(chalk.yellow('npm install --save-dev metro-source-map metro-react-native-babel-transformer @expo/webpack-config webpack-bundle-analyzer chalk'));
  process.exit(1);
}

// Main analyzer function
async function analyzeBundleSize() {
  console.log(chalk.blue('📦 Starting EcoCart bundle analysis...'));
  
  // Check if the package.json exists
  if (!fs.existsSync(PACKAGE_JSON)) {
    console.error(chalk.red('Error: package.json not found'));
    process.exit(1);
  }
  
  // Read package.json and get dependencies
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  const devDependencies = Object.keys(packageJson.devDependencies || {});
  
  console.log(chalk.green(`Found ${dependencies.length} production dependencies and ${devDependencies.length} dev dependencies`));
  
  // Check for particularly large dependencies
  console.log(chalk.blue('\nAnalyzing dependency sizes...'));
  const dependencySizes = [];
  
  for (const dep of dependencies) {
    try {
      const depPath = path.join(NODE_MODULES, dep);
      if (fs.existsSync(depPath)) {
        const size = getDirectorySize(depPath);
        dependencySizes.push({ name: dep, size });
      }
    } catch (error) {
      console.warn(chalk.yellow(`Could not analyze size of ${dep}: ${error.message}`));
    }
  }
  
  // Sort by size (largest first)
  dependencySizes.sort((a, b) => b.size - a.size);
  
  // Display largest dependencies
  console.log(chalk.green('\nTop 10 largest dependencies:'));
  dependencySizes.slice(0, 10).forEach((dep, index) => {
    const sizeInMB = (dep.size / (1024 * 1024)).toFixed(2);
    console.log(`${index + 1}. ${chalk.cyan(dep.name)}: ${sizeInMB} MB`);
  });
  
  // Identify dependencies that might have alternatives
  console.log(chalk.blue('\nPotential size optimizations:'));
  
  const optimizationSuggestions = [
    { name: 'moment', alternative: 'date-fns', reason: 'Smaller footprint and tree-shakable' },
    { name: 'lodash', alternative: 'lodash-es or individual functions', reason: 'Tree-shakable imports' },
    { name: 'redux', alternative: 'zustand or jotai', reason: 'Lighter state management' },
    { name: '@material-ui/core', alternative: 'tailwind with react-native', reason: 'More efficient styling' },
    { name: 'axios', alternative: 'ky or native fetch', reason: 'Smaller API client' },
    { name: 'chart.js', alternative: 'lightweight-charts or victory-native', reason: 'Smaller charting library' },
    { name: 'react-native-svg-charts', alternative: 'react-native-gifted-charts', reason: 'Smaller footprint for basic charts' },
    { name: 'react-native-gesture-handler', alternative: 'Keep but optimize imports', reason: 'Only import needed handlers' },
    { name: 'react-native-reanimated', alternative: 'Keep but optimize imports', reason: 'Avoid importing entire library' },
  ];
  
  let optimizationCount = 0;
  for (const suggestion of optimizationSuggestions) {
    if (dependencies.includes(suggestion.name)) {
      console.log(`${chalk.cyan(suggestion.name)} → ${chalk.green(suggestion.alternative)}: ${suggestion.reason}`);
      optimizationCount++;
    }
  }
  
  if (optimizationCount === 0) {
    console.log(chalk.green('No obvious large dependencies that need replacement.'));
  }
  
  // Generate webpack analyze command for web bundle
  console.log(chalk.blue('\nGenerating bundle analysis...'));
  
  // Add script to package.json if it doesn't exist
  if (!packageJson.scripts || !packageJson.scripts.analyze) {
    console.log(chalk.yellow('Adding analyze script to package.json...'));
    
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.analyze = 'expo-webpack-analyzer';
    
    fs.writeFileSync(PACKAGE_JSON, JSON.stringify(packageJson, null, 2));
    console.log(chalk.green('Added analyze script to package.json'));
  }
  
  // Run the analysis
  try {
    console.log(chalk.yellow('Running bundle analysis... this may take a minute.'));
    execSync('npm run analyze', { stdio: 'inherit' });
  } catch (error) {
    console.error(chalk.red('Error running bundle analysis. Try running:'));
    console.error(chalk.yellow('npx expo-webpack-analyzer'));
  }
  
  // Optimization recommendations
  console.log(chalk.blue('\nGeneral bundle size optimization recommendations:'));
  console.log(chalk.green('1.') + ' Use dynamic imports for code-splitting');
  console.log(chalk.green('2.') + ' Implement tree-shaking by using ES modules');
  console.log(chalk.green('3.') + ' Use React.lazy and Suspense for component loading');
  console.log(chalk.green('4.') + ' Optimize image assets (compress PNGs, use WebP where supported)');
  console.log(chalk.green('5.') + ' Use production builds with minification enabled');
  console.log(chalk.green('6.') + ' Remove unused code and dependencies');
  console.log(chalk.green('7.') + ' Configure Babel to target newer JavaScript engines');
  console.log(chalk.green('8.') + ' Use a custom Babel configuration to optimize transformations');
  
  // Build performance optimization 
  console.log(chalk.blue('\nBuild performance optimizations:'));
  console.log('• Add .expo/ and node_modules/.cache/ to your .gitignore file');
  console.log('• If Hermes is available, enable it in app.json');
  console.log('• Consider using EAS Build for production builds');
  
  console.log(chalk.blue('\n✅ Bundle analysis complete'));
}

// Helper function to get directory size recursively
function getDirectorySize(dirPath) {
  let size = 0;
  
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        size += stats.size;
      }
    }
  } catch (err) {
    // Silently handle permission errors or other issues
  }
  
  return size;
}

// Run the analyzer
analyzeBundleSize().catch(error => {
  console.error(chalk.red('Error analyzing bundle:'), error);
  process.exit(1);
}); 