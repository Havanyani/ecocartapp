#!/usr/bin/env node
/**
 * Custom Metro bundler starter that bypasses Expo CLI's dependency validation
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const compression = require('compression');
const { startBundler } = require('@react-native-community/cli-server-api');

// Set environment variables
process.env.EXPO_PUBLIC_PLATFORM = 'web';
process.env.EXPO_DEBUG_NO_ROUTER = 'true';
process.env.EXPO_DEBUG_WEB_ONLY = 'true';

// Port and host configuration
const PORT = process.env.PORT || 8081;
const HOST = process.env.HOST || '0.0.0.0'; // Use 0.0.0.0 to listen on all interfaces

console.log(`Starting Metro bundler on ${HOST}:${PORT}...`);

// Force CommonJS for Metro config
const configPath = path.resolve(__dirname, './metro.config.cjs');

// Make sure we have the correct file
if (!fs.existsSync(configPath)) {
  console.error(`Error: Metro config file not found at ${configPath}`);
  process.exit(1);
}

console.log(`Starting Metro with config: ${configPath}`);

// Start Metro with explicit config
startBundler({
  port: 8081,
  configPath,
  config: {
    maxWorkers: 2,
    resetCache: true,
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'cjs', 'json', 'svg'],
    transformer: {
      babelTransformerPath: require.resolve('metro-babel-transformer'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
  },
})
  .then(() => {
    console.log('Metro bundler running!');
  })
  .catch((err) => {
    console.error('Failed to start metro:', err);
    process.exit(1);
  });

// Create a basic express app for serving static web files
function createWebServer() {
  const app = express();
  app.use(compression());
  
  // Serve static files from the project root
  app.use(express.static(path.join(__dirname, 'web-build')));
  
  // Fallback for SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
  });
  
  return app;
}

// Load and modify the Metro configuration
async function startMetro() {
  try {
    // First check if port is available
    await checkPort();
    
    // Create web server
    const app = createWebServer();
    
    // Load base config
    const config = await MetroConfig.loadConfig();
    
    // Modify configuration to ensure proper web serving
    config.server = config.server || {};
    config.server.port = PORT;
    config.server.host = HOST;
    
    // Add middleware for web serving
    const originalMiddleware = config.server.enhanceMiddleware;
    config.server.enhanceMiddleware = (middleware) => {
      // Apply the original middleware if it exists
      if (originalMiddleware) {
        middleware = originalMiddleware(middleware);
      }
      
      // Enhance with our web middleware
      return (req, res, next) => {
        // Special handling for web bundle requests
        if (req.url === '/index.bundle?platform=web') {
          // Set appropriate headers for web bundle
          res.setHeader('Content-Type', 'application/javascript');
          res.setHeader('Access-Control-Allow-Origin', '*');
        }
        
        // Use express for paths that might be web-related
        if (req.url.startsWith('/static') || 
            req.url.endsWith('.html') || 
            req.url.endsWith('.css') || 
            req.url.endsWith('.png') || 
            req.url.endsWith('.jpg') || 
            req.url.endsWith('.svg')) {
          return app(req, res, next);
        }
        
        // Otherwise, use the metro middleware
        return middleware(req, res, next);
      };
    };
    
    // Ensure web platform is enabled
    config.resolver = config.resolver || {};
    config.resolver.platforms = [...(config.resolver.platforms || []), 'web'];
    
    // Start Metro with our config
    const metroBundlerServer = await Metro.runMetro(config);
    
    console.log('\nMetro Bundler is running!');
    console.log(`Web is available at http://localhost:${PORT}`);
    console.log('Open this URL in your browser to view the app');
    console.log('\nPress Ctrl+C to stop\n');
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('Stopping Metro bundler...');
      metroBundlerServer.end();
      process.exit();
    });
  } catch (error) {
    console.error('Failed to start Metro bundler:', error);
    process.exit(1);
  }
}

// Start Metro
startMetro(); 