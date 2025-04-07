/**
 * Web Launch Script with CLI Error Fix
 * 
 * This script launches the web version of the app while bypassing 
 * the problematic parts of the Expo CLI that cause the "Body is unusable" error.
 */

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// Configuration
const config = {
  env: {
    EXPO_PUBLIC_PLATFORM: 'web',
    EXPO_DEBUG_WEB_ONLY: 'true',
    EXPO_SKIP_MODULE_CHECK: 'true', // Skip problematic native module checks
    EXPO_NO_DOCTOR: 'true',         // Skip doctor checks which can cause fetch issues
    NODE_OPTIONS: '--no-warnings',  // Reduce noise in console
  }
};

// Utility to determine if we're on Windows
const isWindows = os.platform() === 'win32';

console.log('⚡ Starting EcoCart Web with CLI error fix...');

// Set environment variables
Object.entries(config.env).forEach(([key, value]) => {
  process.env[key] = value;
  console.log(`Setting ${key}=${value}`);
});

// Build command - simplified to avoid spawn issues
console.log('Executing: expo start --web --clear --no-dev');

// Use a more reliable method to launch the process
if (isWindows) {
  // On Windows, use cmd.exe to execute the command
  const cmd = spawn('cmd.exe', ['/c', 'npx', 'expo', 'start', '--web', '--clear', '--no-dev'], {
    stdio: 'inherit',
    env: process.env
  });
  
  cmd.on('error', (error) => {
    console.error('Failed to start process:', error);
    process.exit(1);
  });
  
  cmd.on('exit', (code) => {
    process.exit(code || 0);
  });
} else {
  // On non-Windows platforms
  const expoProcess = spawn('npx', ['expo', 'start', '--web', '--clear', '--no-dev'], {
    stdio: 'inherit',
    env: process.env
  });
  
  expoProcess.on('error', (error) => {
    console.error('Failed to start process:', error);
    process.exit(1);
  });
  
  expoProcess.on('exit', (code) => {
    process.exit(code || 0);
  });
}

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  process.exit(0);
}); 