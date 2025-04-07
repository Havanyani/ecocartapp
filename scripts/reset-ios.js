/**
 * Reset iOS Configuration
 * 
 * This script resets the app configuration to a state
 * that should allow iOS to function correctly again.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📱 iOS Configuration Reset');
console.log('=========================');

// Clear Metro and Expo caches
console.log('\n1. Clearing caches...');
try {
  execSync('rmdir /s /q node_modules\\.cache 2>nul', { stdio: 'inherit' });
  execSync('rmdir /s /q .expo 2>nul', { stdio: 'inherit' });
  console.log('✅ Caches cleared');
} catch (error) {
  console.warn('⚠️ Error clearing caches:', error.message);
}

// Create a script to launch iOS with a cleaner environment
console.log('\n2. Creating clean iOS launcher...');
const iosLauncherContent = `@echo off
setlocal

echo === Clean iOS Launch ===
echo.
echo Terminating any Metro processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 2^>nul') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo Setting up clean environment...
set RCT_METRO_PORT=8081
set EXPO_NO_DOCTOR=1

echo.
echo Launching Expo with minimal options...
npx expo start --ios --port 8081

endlocal
`;

const iosLauncherPath = path.join(__dirname, 'clean-ios-launch.bat');
fs.writeFileSync(iosLauncherPath, iosLauncherContent);
console.log(`✅ Created ${iosLauncherPath}`);

// Add reference to package.json
console.log('\n3. Updating package.json scripts...');
try {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add our new command
  packageJson.scripts['ios-clean'] = 'scripts\\clean-ios-launch.bat';
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json updated with ios-clean script');
} catch (error) {
  console.error('❌ Error updating package.json:', error);
}

console.log('\n🎉 Reset complete!');
console.log('Run "npm run ios-clean" to launch iOS with minimal configuration.'); 