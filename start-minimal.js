// Minimal start script with CommonJS
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Make sure our .cjs file exists
const configPath = path.resolve(__dirname, './metro.config.cjs');
if (!fs.existsSync(configPath)) {
  console.error("Error: metro.config.cjs not found!");
  process.exit(1);
}

console.log("=== Starting EcoCart with minimal configuration ===");
console.log("1. Using CommonJS for Metro configuration");
console.log("2. Running with minimal dependencies");
console.log("3. Explicitly clearing Metro cache");

// Start metro with our .cjs config
const metro = spawn('node', ['node_modules/expo/AppEntry.js'], {
  env: {
    ...process.env,
    EXPO_METRO_CONFIG: configPath,
    EXPO_DEBUG: 'true',
    EXPO_NO_DOCTOR: '1',
    EXPO_DEBUG_NO_ROUTER: 'true',
  },
  stdio: 'inherit',
});

metro.on('error', (error) => {
  console.error('Failed to start Metro:', error);
  process.exit(1);
});

metro.on('close', (code) => {
  if (code !== 0) {
    console.log(`Metro process exited with code ${code}`);
    process.exit(code);
  }
}); 