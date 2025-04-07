/**
 * iOS Launch Script with Connectivity Fix
 * 
 * This script launches the iOS version of the app while implementing
 * fixes for common "Could not connect to the development server" errors.
 */

const { spawn, execSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

// Get local IP address to assist with connection issues
function getLocalIpAddress() {
  try {
    const interfaces = os.networkInterfaces();
    
    // Find a suitable network interface (non-internal, IPv4)
    for (const iface of Object.values(interfaces)) {
      if (!iface) continue;
      
      const nonInternalIpv4 = iface.find(addr => 
        addr.family === 'IPv4' && !addr.internal
      );
      
      if (nonInternalIpv4) {
        return nonInternalIpv4.address;
      }
    }
    
    return '127.0.0.1'; // Fallback to localhost
  } catch (err) {
    console.warn('Error getting local IP address:', err.message);
    return '127.0.0.1';
  }
}

// Configuration
const config = {
  env: {
    // Force Metro to listen on all network interfaces (not just localhost)
    REACT_NATIVE_PACKAGER_HOSTNAME: getLocalIpAddress(),
    // Enable verbose logging
    DEBUG: 'true',
    // Skip problematic checks
    EXPO_NO_DOCTOR: 'true',
  },
  port: 8081 // Use a fixed port number
};

// Check if port 8081 is already in use and kill process if needed
function checkAndFreePort() {
  try {
    // Check if port 8081 is in use
    if (process.platform === 'win32') {
      const result = execSync('netstat -ano | findstr :8081').toString();
      if (result) {
        console.log('Port 8081 is currently in use. Attempting to free it...');
        // Extract PID and kill process
        const pidMatch = /\s+(\d+)$/.exec(result.split('\n')[0]);
        if (pidMatch && pidMatch[1]) {
          execSync(`taskkill /F /PID ${pidMatch[1]}`);
          console.log(`Killed process with PID ${pidMatch[1]}`);
        }
      }
    } else {
      // Unix/macOS
      const result = execSync('lsof -i:8081 -t').toString();
      if (result) {
        console.log('Port 8081 is currently in use. Attempting to free it...');
        execSync(`kill -9 ${result.trim()}`);
        console.log(`Killed process with PID ${result.trim()}`);
      }
    }
  } catch (err) {
    // Error might mean port is not in use, which is fine
    // console.log('Port check returned:', err.message);
  }
}

// Main function to launch the app
async function launchIOS() {
  console.log('⚡ Starting EcoCart iOS with connectivity fixes...');
  
  // Get the local IP address
  const localIp = getLocalIpAddress();
  console.log(`\nYour development machine's IP address: ${localIp}`);
  console.log('If connection issues persist, try manually using this IP in the Expo dev menu.\n');
  
  // Check if port is in use and free it
  checkAndFreePort();
  
  // Set environment variables
  Object.entries(config.env).forEach(([key, value]) => {
    process.env[key] = value;
    console.log(`Setting ${key}=${value}`);
  });
  
  // First start the Metro bundler in a separate process
  console.log('Starting Metro bundler...');
  const metroProcess = spawn('npx', ['react-native', 'start', '--port', config.port.toString()], {
    stdio: 'inherit',
    env: process.env,
  });
  
  // Wait a moment for the Metro bundler to start
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Then start the iOS simulator
  console.log('Starting iOS simulator...');
  const iosProcess = spawn('npx', ['expo', 'run:ios', '--simulator', '--port', config.port.toString()], {
    stdio: 'inherit',
    env: process.env,
  });
  
  // Handle process events
  metroProcess.on('error', (error) => {
    console.error('Failed to start Metro bundler:', error);
  });
  
  iosProcess.on('error', (error) => {
    console.error('Failed to start iOS simulator:', error);
  });
  
  // Handle termination signals
  process.on('SIGINT', () => {
    console.log('Shutting down all processes...');
    metroProcess.kill('SIGINT');
    iosProcess.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('Shutting down all processes...');
    metroProcess.kill('SIGTERM');
    iosProcess.kill('SIGTERM');
    process.exit(0);
  });
}

// Display connectivity troubleshooting tips
console.log('📱 iOS Connectivity Troubleshooting Guide');
console.log('----------------------------------------');
console.log('If you encounter "Could not connect to the development server":');
console.log('');
console.log('1. Ensure your iOS device/simulator and development computer are on the same network');
console.log('2. Temporarily disable your firewall or add exceptions for ports 8081 and 19000-19001');
console.log('3. On the iOS app, shake the device or press ⌘+D in simulator to open the dev menu');
console.log('4. Select "Change Bundle Location" and enter your development machine\'s IP, e.g.,');
console.log(`   http://${getLocalIpAddress()}:${config.port}`);
console.log('5. Check if Metro bundler is running and showing the "Metro waiting on exp://..." message');
console.log('----------------------------------------\n');

// Run the launcher
launchIOS().catch(err => {
  console.error('Error launching iOS app:', err);
  process.exit(1);
}); 