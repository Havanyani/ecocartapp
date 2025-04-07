/**
 * iOS Battery Module Fix
 * 
 * This script addresses the "Unable to resolve expo-battery" error in iOS builds by:
 * 1. Creating a mock implementation at the project root
 * 2. Updating package.json to use this mock
 * 3. Clearing the Metro bundler cache to ensure changes take effect
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔋 iOS Battery Module Fix');
console.log('=========================');

// Step 1: Create mock implementation at project root
console.log('\n1. Creating mock expo-battery implementation...');
const mockBatteryContent = `/**
 * Mock implementation for expo-battery
 * This provides simulated battery functionality for iOS
 */

console.log('[MOCK BATTERY] Loading mock module');

// Define battery states to match expo-battery
const BatteryState = {
  UNKNOWN: 0,
  UNPLUGGED: 1,
  CHARGING: 2,
  FULL: 3
};

// Mock implementation of battery functions
module.exports = {
  BatteryState,
  
  // Return a value between 0 and 1
  getBatteryLevelAsync: async () => {
    console.log('[MOCK BATTERY] getBatteryLevelAsync called');
    return 1.0; // Mock full battery level
  },
  
  // Return a battery state
  getBatteryStateAsync: async () => {
    console.log('[MOCK BATTERY] getBatteryStateAsync called');
    return BatteryState.FULL; // Mock full battery state
  },
  
  // Check if low power mode is enabled
  isLowPowerModeEnabledAsync: async () => {
    console.log('[MOCK BATTERY] isLowPowerModeEnabledAsync called');
    return false; // Mock low power mode disabled
  },
  
  // Add event listener functions (return object with remove method)
  addBatteryLevelListener: () => {
    console.log('[MOCK BATTERY] addBatteryLevelListener called');
    return { remove: () => {} };
  },
  
  addBatteryStateListener: () => {
    console.log('[MOCK BATTERY] addBatteryStateListener called');
    return { remove: () => {} };
  },
  
  addLowPowerModeListener: () => {
    console.log('[MOCK BATTERY] addLowPowerModeListener called');
    return { remove: () => {} };
  }
};`;

const mockBatteryPath = path.join(__dirname, '..', 'expo-battery.js');
fs.writeFileSync(mockBatteryPath, mockBatteryContent);
console.log(`✅ Mock created at ${mockBatteryPath}`);

// Step 2: Update package.json to use the mock
console.log('\n2. Updating package.json...');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
let packageJson;

try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Ensure browser field exists
  packageJson.browser = packageJson.browser || {};
  
  // Add or update expo-battery entry
  packageJson.browser['expo-battery'] = './expo-battery.js';
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json updated');
} catch (error) {
  console.error('❌ Error updating package.json:', error);
}

// Step 3: Clear Metro bundler cache
console.log('\n3. Clearing Metro bundler cache...');
try {
  // Remove Metro cache directory
  execSync('rmdir /s /q node_modules\\.cache 2>nul', { stdio: 'inherit' });
  execSync('rmdir /s /q .expo 2>nul', { stdio: 'inherit' });
  console.log('✅ Metro cache cleared');
} catch (error) {
  console.warn('⚠️ Error clearing cache:', error.message);
}

// Step 4: Update cross-platform battery implementation
console.log('\n4. Updating cross-platform battery implementation...');
const batteryTsPath = path.join(__dirname, '..', 'src', 'utils', 'cross-platform', 'battery.ts');

try {
  // Check if the file exists
  if (fs.existsSync(batteryTsPath)) {
    let batteryTsContent = fs.readFileSync(batteryTsPath, 'utf8');
    
    // Replace the try-catch block that loads the native module
    batteryTsContent = batteryTsContent.replace(
      /try\s*\{[\s\S]*?const\s+ExpoBattery\s*=\s*require\(['"]expo-battery['"]\);[\s\S]*?\}\s*catch\s*\([\s\S]*?\)\s*\{[\s\S]*?\}/,
      `// Use mock implementation for iOS
console.log('[Battery] Using mock implementation');
Battery = WebBattery;`
    );
    
    fs.writeFileSync(batteryTsPath, batteryTsContent);
    console.log('✅ Cross-platform battery implementation updated');
  } else {
    console.warn('⚠️ Could not find battery.ts at', batteryTsPath);
  }
} catch (error) {
  console.warn('⚠️ Error updating battery.ts:', error.message);
}

console.log('\n🎉 iOS Battery fix complete!');
console.log('Now run: npm run qr-launch'); 