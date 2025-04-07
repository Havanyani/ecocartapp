/**
 * Simple static file server that doesn't use Metro bundler
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Create the directory if it doesn't exist
const webTestDir = path.join(__dirname, 'web-test');
if (!fs.existsSync(webTestDir)) {
  fs.mkdirSync(webTestDir, { recursive: true });
}

// Create Express app
const app = express();
const PORT = 3000;

// Serve static files from web-test directory
app.use(express.static(path.join(__dirname, 'web-test')));

// Serve node_modules for browser modules if needed
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-test', 'index.html'));
});

// Start the server
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`
=================================================
  EcoCart Static Test Server
  
  Server running at: http://localhost:${PORT}
  
  This is a simple static server that doesn't 
  use Metro bundler or Expo, to test basic
  web functionality and localStorage.
=================================================
`);
}); 