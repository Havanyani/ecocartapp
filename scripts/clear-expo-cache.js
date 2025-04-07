/**
 * Expo & Metro Cache Cleaner
 * 
 * This script clears all Expo and Metro related caches to resolve 
 * "Body is unusable" and other caching-related errors.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const rimraf = require('rimraf');

// Determine platform-specific paths
const isWindows = os.platform() === 'win32';
const homeDir = os.homedir();
const cacheDirectories = [
  // Project-specific caches
  path.join(process.cwd(), 'node_modules', '.cache'),
  path.join(process.cwd(), '.expo'),
  path.join(process.cwd(), '.babel-cache'),
  
  // Global expo caches
  path.join(homeDir, '.expo'),
  path.join(homeDir, '.metro'),
];

// Windows-specific caches
if (isWindows) {
  cacheDirectories.push(
    path.join(process.env.LOCALAPPDATA || '', 'Temp', 'react-native-*'),
    path.join(process.env.LOCALAPPDATA || '', 'Temp', 'metro-*')
  );
} else {
  // Unix-specific caches
  cacheDirectories.push(
    path.join(os.tmpdir(), 'react-native-*'),
    path.join(os.tmpdir(), 'metro-*'),
    path.join(homeDir, 'Library/Caches/Expo') // macOS specific
  );
}

console.log('🧹 Cleaning Expo and Metro caches...');

// Remove directories
cacheDirectories.forEach(dir => {
  try {
    console.log(`Removing: ${dir}`);
    if (dir.includes('*')) {
      // For wildcard paths, use rimraf
      rimraf.sync(dir);
    } else if (fs.existsSync(dir)) {
      // For existing directories, use fs.rmSync recursively (or rimraf if not available)
      if (fs.rmSync) {
        fs.rmSync(dir, { recursive: true, force: true });
      } else {
        rimraf.sync(dir);
      }
    }
  } catch (err) {
    console.warn(`Warning: Could not remove ${dir}: ${err.message}`);
  }
});

// Clear npm cache
try {
  console.log('Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });
} catch (err) {
  console.warn(`Warning: Could not clear npm cache: ${err.message}`);
}

// Watchman flush (if installed)
try {
  console.log('Flushing Watchman...');
  execSync('watchman watch-del-all', { stdio: 'inherit' });
} catch (err) {
  // Watchman might not be installed, so this is not critical
}

console.log('✅ Cache cleaning complete!');
console.log('You can now run the app with: npm run web-fix'); 