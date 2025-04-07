/**
 * Script to run the CommonJS version of the app
 */
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('=== Starting EcoCart with CommonJS mode ===');

// Make sure metro.config.cjs exists
const metroConfigPath = path.join(__dirname, 'metro.config.cjs');
if (!fs.existsSync(metroConfigPath)) {
  console.error('Error: metro.config.cjs not found');
  process.exit(1);
}

// Create a temporary JSC/CommonJS-only babel.config.js
const tempBabelConfig = `
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@': './src',
        },
      }],
    ],
  };
};
`;

fs.writeFileSync('babel.config.js.temp', tempBabelConfig);

// Create a temporary app.json with JSC engine
const appJsonPath = path.join(__dirname, 'app.json');
let appJson;
try {
  appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  // Make a backup if it doesn't exist
  const backupPath = path.join(__dirname, 'app.json.bak');
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, JSON.stringify(appJson, null, 2));
  }
  
  // Modify app.json to use JSC engine
  if (appJson.expo) {
    appJson.expo.jsEngine = 'jsc';
    appJson.expo.web = {
      ...appJson.expo.web,
      bundler: 'metro'
    };
  }
  
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
} catch (err) {
  console.error('Error modifying app.json:', err);
}

// Use npx to run expo with our modifications
console.log('Starting Expo with CommonJS settings...');
const command = 'npx expo start --clear --no-dev --web --port 19000';

const child = exec(command, {
  env: {
    ...process.env,
    EXPO_NO_BUNDLER_TRANSFORM: '1',
    EXPO_NO_DOCTOR: '1',
    EXPO_DEBUG_NO_ROUTER: 'true',
    EXPO_USE_PATH_ALIASES: '1',
    EXPO_PUBLIC_ENTRY: './commonjs-entry.js',
    EXPO_METRO_CONFIG: metroConfigPath,
    NODE_OPTIONS: '--no-warnings --experimental-specifier-resolution=node'
  }
});

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

child.on('exit', (code) => {
  console.log(`Expo process exited with code ${code}`);
  
  // Cleanup temporary files and restore originals
  try {
    if (fs.existsSync('babel.config.js.temp')) {
      fs.unlinkSync('babel.config.js.temp');
    }
  } catch (err) {
    console.error('Error cleaning up temp files:', err);
  }
  
  process.exit(code);
}); 