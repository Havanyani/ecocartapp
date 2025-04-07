/**
 * web-launcher.js
 * A Node.js script that handles the two-step process for launching the web version of EcoCart.
 * 
 * This script:
 * 1. Starts the Metro bundler in the background
 * 2. Waits for it to be ready
 * 3. Opens the web version in a browser
 */

const { spawn } = require('child_process');
const readline = require('readline');
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
};

console.log(`${colors.green}Starting EcoCart Web Launcher${colors.reset}`);
console.log(`${colors.yellow}This script uses a two-step process to launch the web version${colors.reset}`);

// Step 1: Start the Metro bundler
console.log(`${colors.blue}Step 1: Starting Metro bundler...${colors.reset}`);

// Set an environment variable to indicate we're in the web platform
process.env.EXPO_PUBLIC_PLATFORM = 'web';

// Start Metro bundler with the clear cache option
const metroBundler = spawn('npx', ['expo', 'start', '--clear'], {
  stdio: ['inherit', 'pipe', 'inherit'],
  shell: true,
});

// Create readline interface to read Metro bundler output
const rl = readline.createInterface({
  input: metroBundler.stdout,
  terminal: false,
});

// Flag to track if we've already started the web step
let webStarted = false;

// Listen for Metro bundler output
rl.on('line', (line) => {
  // Echo the bundler output
  console.log(`${colors.cyan}[Metro] ${line}${colors.reset}`);
  
  // Look for indicators that Metro is ready
  if ((line.includes('Metro waiting') || line.includes('Metro server')) && !webStarted) {
    webStarted = true;
    // Wait a bit to ensure Metro is fully ready
    setTimeout(() => {
      // Step 2: Open the web version
      console.log(`${colors.blue}Step 2: Opening web version...${colors.reset}`);
      const webProcess = spawn('npx', ['expo', 'web'], {
        stdio: 'inherit',
        shell: true,
      });
      
      webProcess.on('error', (error) => {
        console.error(`${colors.red}Error starting web version: ${error.message}${colors.reset}`);
      });
    }, 3000); // Wait 3 seconds
  }
});

// Handle Metro bundler errors
metroBundler.on('error', (error) => {
  console.error(`${colors.red}Error starting Metro bundler: ${error.message}${colors.reset}`);
  process.exit(1);
});

// Handle Metro bundler exit
metroBundler.on('close', (code) => {
  if (code !== 0) {
    console.error(`${colors.red}Metro bundler exited with code ${code}${colors.reset}`);
  }
  console.log(`${colors.green}Metro bundler has been closed${colors.reset}`);
  process.exit(code);
});

// Listen for user termination signals
process.on('SIGINT', () => {
  console.log(`${colors.yellow}Stopping all processes...${colors.reset}`);
  metroBundler.kill();
  process.exit(0);
});

console.log(`${colors.green}EcoCart Web Launcher started. Press Ctrl+C to exit.${colors.reset}`); 