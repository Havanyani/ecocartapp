/**
 * EcoCart Platform Launcher
 * A Node.js script to launch different versions of the EcoCart app
 */

const readline = require('readline');
const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get project root directory
const projectRoot = path.resolve(__dirname, '..');

// Function to clear Metro cache and node_modules
function clearCache() {
  console.log("Clearing Metro Bundler cache and resetting environment...");
  
  // Create an array of commands to run in sequence
  const commands = [
    'npm cache clean --force',
    'rmdir /s /q node_modules\\.cache',
    'npx expo doctor',
    'npx expo install expo-battery'
  ];
  
  // Execute commands in sequence
  executeCommandsSequentially(commands, 0, () => {
    console.log("\nCache clearing complete.");
    console.log("Reinstalled expo-battery package to fix bundling errors.");
    askToReturnToMenu();
  });
}

// Helper function to execute commands in sequence
function executeCommandsSequentially(commands, index, callback) {
  if (index >= commands.length) {
    callback();
    return;
  }
  
  console.log(`Running: ${commands[index]}`);
  exec(commands[index], (error) => {
    if (error) {
      console.error(`Error executing command: ${commands[index]}`, error);
    }
    executeCommandsSequentially(commands, index + 1, callback);
  });
}

// Function to launch the debug mode
function launchDebugMode() {
  console.log("Starting EcoCart in Debug Mode...");
  console.log("This is a simplified version that shows initialization progress");
  console.log("Useful for troubleshooting connection issues");
  
  // Run the debug-mode script
  const debugProcess = spawn('npm', ['run', 'debug-mode'], {
    stdio: 'inherit',
    shell: true
  });
  
  debugProcess.on('close', (code) => {
    console.log("Debug mode exited with code " + code);
    askToReturnToMenu();
  });
}

// Function to repair corrupted web-version folder
function repairWebVersion() {
  console.log("Repairing corrupted web-version folder...");
  
  // Create an array of commands to run in sequence
  const commands = [
    'cd web-version && rmdir /s /q node_modules',
    'cd web-version && npm cache clean --force',
    'cd web-version && npm install --legacy-peer-deps'
  ];
  
  // Execute commands in sequence
  executeCommandsSequentially(commands, 0, () => {
    console.log("\nWeb-version repair complete. Any corruption in the React Native files should now be fixed.");
    askToReturnToMenu();
  });
}

// Add a new function for launching web diagnostics
function launchWebDiagnostics() {
  console.log(`${colors.cyan}Launching EcoCart Web Diagnostics Tool...${colors.reset}`);
  const htmlPath = path.join(projectRoot, 'web-diagnostics.html');
  
  const isWindows = process.platform === 'win32';
  if (isWindows) {
    exec(`start "" "${htmlPath}"`);
  } else if (process.platform === 'darwin') {
    exec(`open "${htmlPath}"`);
  } else {
    exec(`xdg-open "${htmlPath}"`);
  }
  
  askToReturnToMenu();
}

// Add a new function for launching minimal web test
function launchMinimalWebTest() {
  console.log(`${colors.cyan}Launching EcoCart Minimal Web Test (Absolute Basics)...${colors.reset}`);
  const htmlPath = path.join(projectRoot, 'minimal-web-test.html');
  
  const isWindows = process.platform === 'win32';
  if (isWindows) {
    exec(`start "" "${htmlPath}"`);
  } else if (process.platform === 'darwin') {
    exec(`open "${htmlPath}"`);
  } else {
    exec(`xdg-open "${htmlPath}"`);
  }
  
  askToReturnToMenu();
}

// Display menu and handle selection
function showMainMenu() {
  // Clear console for better visibility
  console.clear();
  
  console.log("=======================================================");
  console.log("            ECOCART UNIFIED PLATFORM LAUNCHER          ");
  console.log("=======================================================");
  console.log("");
  console.log("AVAILABLE OPTIONS:");
  console.log("");
  console.log("1) Web Version (Static HTML - Works Reliably)");
  console.log("2) Web Version (Web-Version Folder - Separate Implementation)");
  console.log("3) Mobile Web Version (Expo Router - Platform Auto-Detection)");
  console.log("4) Android Version (Platform-Specific UI & Features)");
  console.log("5) iOS Version (Platform-Specific UI & Features)");
  console.log("6) Direct QR Code Connection (Platform Auto-Detection)");
  console.log("7) Debug Mode (Simplified App for Testing)");
  console.log("8) Clear Cache and Reset Environment");
  console.log("9) Repair Corrupted Web-Version Folder");
  console.log("10) Web Diagnostics Tool (NEW)");
  console.log("11) Minimal Web Test (Just HTML/JS, No React)");
  console.log("12) Exit");
  console.log("");
  console.log("NOTE: Platform-specific versions now correctly load native or web UI");
  console.log("=======================================================");
  
  rl.question("Enter your choice (1-12): ", function(choice) {
    console.log(`You selected option: ${choice}`);
    
    switch(choice) {
      case "1":
        launchStaticHTML();
        break;
      case "2":
        launchWebVersion();
        break;
      case "3":
        launchMobileWeb();
        break;
      case "4":
        launchAndroid();
        break;
      case "5":
        launchIOS();
        break;
      case "6":
        launchQRCodeOnly();
        break;
      case "7":
        launchDebugMode();
        break;
      case "8":
        clearCache();
        break;
      case "9":
        repairWebVersion();
        break;
      case "10":
        launchWebDiagnostics();
        break;
      case "11":
        launchMinimalWebTest();
        break;
      case "12":
        console.log("Exiting EcoCart Launcher...");
        rl.close();
        process.exit(0);
        break;
      default:
        console.log("Invalid choice, please try again.");
        setTimeout(() => showMainMenu(), 1000);
    }
  });
}

// Function to launch static HTML version
function launchStaticHTML() {
  console.log(`${colors.cyan}Launching EcoCart Static Web Version...${colors.reset}`);
  const htmlPath = path.join(projectRoot, 'basic-test.html');
  
  const isWindows = process.platform === 'win32';
  if (isWindows) {
    exec(`start "" "${htmlPath}"`);
  } else if (process.platform === 'darwin') {
    exec(`open "${htmlPath}"`);
  } else {
    exec(`xdg-open "${htmlPath}"`);
  }
  
  askToReturnToMenu();
}

// Function to launch web folder version
function launchWebVersion() {
  console.log(`${colors.cyan}Launching EcoCart Web Version from web-version folder...${colors.reset}`);
  const htmlPath = path.join(projectRoot, 'web-version', 'index.html');
  
  const isWindows = process.platform === 'win32';
  if (isWindows) {
    exec(`start "" "${htmlPath}"`);
  } else if (process.platform === 'darwin') {
    exec(`open "${htmlPath}"`);
  } else {
    exec(`xdg-open "${htmlPath}"`);
  }
  
  askToReturnToMenu();
}

// Function to launch mobile web version
function launchMobileWeb() {
  console.log(`${colors.yellow}Launching EcoCart Mobile Web Version (Expo Router)...${colors.reset}`);
  console.log(`${colors.yellow}Using webpack.config.js (auto-detected by Expo)...${colors.reset}`);
  
  // Set environment variables
  process.env.EXPO_PUBLIC_PLATFORM = 'web';
  process.env.EXPO_DEBUG = 'true';
  process.env.EXPO_WEB_DEBUG = 'true';
  
  // Start expo web with ThemeProvider - Expo will automatically use webpack.config.js in project root
  const expoProcess = spawn('npx', ['expo', 'start', '--web', '--clear', '--no-dev'], {
    stdio: 'inherit',
    shell: true,
    env: {...process.env, EXPO_DEBUG_NO_WEB_VERSION: 'true', EXPO_WEB_LAUNCH_BROWSER: '1'}
  });
  
  expoProcess.on('close', (code) => {
    console.log(`${colors.yellow}Expo process exited with code ${code}${colors.reset}`);
    askToReturnToMenu();
  });
}

// Function to launch Android version
function launchAndroid() {
  console.log(`${colors.blue}Launching EcoCart Android Version...${colors.reset}`);
  
  // Check if Android SDK is available
  if (process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT) {
    console.log(`${colors.blue}Android SDK found. Starting Android version.${colors.reset}`);
    console.log(`${colors.blue}Note: You can scan the QR code that will appear with the Expo GO app on your Android device.${colors.reset}`);
    
    // Set flag to ensure native mode
    process.env.EXPO_PUBLIC_PLATFORM = 'android';
    
    const androidProcess = spawn('npx', ['expo', 'start', '--android', '--clear'], {
      stdio: 'inherit',
      shell: true,
      env: {...process.env, FORCE_NATIVE_PLATFORM: '1'}
    });
    
    androidProcess.on('close', (code) => {
      console.log(`${colors.blue}Android process exited with code ${code}${colors.reset}`);
      askToReturnToMenu();
    });
  } else {
    console.log(`${colors.red}Android SDK not found or not configured properly.${colors.reset}`);
    console.log(`${colors.red}Please make sure you have Android SDK installed and ANDROID_HOME environment variable set.${colors.reset}`);
    askToReturnToMenu();
  }
}

// Function to launch iOS version
function launchIOS() {
  console.log(`${colors.magenta}Attempting to launch EcoCart iOS Version...${colors.reset}`);
  
  // Check if running on Windows
  if (process.platform === 'win32') {
    console.log(`${colors.magenta}Windows detected. Starting with QR code for iOS device connection.${colors.reset}`);
    console.log(`${colors.yellow}Instructions:${colors.reset}`);
    console.log(`${colors.yellow}1. Install Expo GO app on your iOS device${colors.reset}`);
    console.log(`${colors.yellow}2. Scan the QR code that will appear in the terminal${colors.reset}`);
    console.log(`${colors.yellow}3. Make sure your iOS device is on the same network as this computer${colors.reset}`);
    
    // Use clean start to avoid corrupted files, using port 19002 to avoid conflicts
    const iosProcess = spawn('npx', ['expo', 'start', '--clear', '--host', 'lan', '--port', '19002', '--no-dev'], {
      stdio: 'inherit',
      shell: true,
      env: {...process.env, EXPO_DEBUG_NO_WEB_VERSION: 'true'}
    });
    
    iosProcess.on('close', (code) => {
      console.log(`${colors.magenta}Expo process exited with code ${code}${colors.reset}`);
      askToReturnToMenu();
    });
  } else {
    console.log(`${colors.magenta}Starting iOS version...${colors.reset}`);
    
    const iosProcess = spawn('npx', ['expo', 'start', '--ios', '--clear'], {
      stdio: 'inherit',
      shell: true
    });
    
    iosProcess.on('close', (code) => {
      console.log(`${colors.magenta}iOS process exited with code ${code}${colors.reset}`);
      askToReturnToMenu();
    });
  }
}

// Function to launch with QR code only
function launchQRCodeOnly() {
  console.log("Starting Expo with QR Code for Device Connection...");
  console.log("Instructions:");
  console.log("1. Install Expo GO app on your iOS or Android device");
  console.log("2. Scan the QR code that will appear in the terminal");
  console.log("3. Make sure your device is on the same network as this computer");
  console.log("\nFallback Options:");
  console.log("- Press 'c' if you don't see a QR code");
  console.log("- If app gets stuck, try option 7 (Debug Mode)");
  console.log("\nStarting Expo with clean environment...");
  
  // First run cache cleaning to fix any potential issues
  console.log("\nPre-cleaning environment before starting...");
  exec('npm cache clean --force && (rmdir /s /q node_modules\\.cache 2>nul || echo "No cache directory found")', (error) => {
    if (error) {
      console.warn("Warning: Cache cleaning failed, continuing anyway:", error.message);
    }
    
    // Set explicit environment variables to ensure proper platform detection
    const envVars = {
      ...process.env,
      EXPO_PUBLIC_PLATFORM: 'native',
      EXPO_NO_WEB_BUILD: '1',
      FORCE_NATIVE_PLATFORM: '1',
      EXPO_NO_BUNDLER_CACHE: '1',   // Avoid using cache that might be corrupted
      EXPO_USE_METRO_MOCKS: '1'     // Enable proper mock resolution
    };
    
    console.log("\nStarting Expo with platform overrides to ensure native behavior...");
    
    // Use a direct spawn to ensure proper stdout/stderr handling
    const expoProcess = spawn('npx', ['expo', 'start', '--clear'], {
      stdio: 'inherit',
      shell: true,
      env: envVars
    });
    
    expoProcess.on('close', (code) => {
      console.log("Expo process exited with code " + code);
      askToReturnToMenu();
    });
  });
}

// Ask user if they want to return to menu
function askToReturnToMenu() {
  console.log("");
  console.log("=======================================================");
  process.stdout.write("Return to main menu? (Y/N): ");
  
  rl.question("", (answer) => {
    console.log("");
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes' || answer === '') {
      showMainMenu();
    } else {
      console.log("Exiting EcoCart Launcher...");
      rl.close();
      process.exit(0);
    }
  });
}

// Start the menu
showMainMenu(); 