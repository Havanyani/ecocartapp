/**
 * Ultra simple static HTTP server without dependencies
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create web-test directory if it doesn't exist
const webTestDir = path.join(__dirname, 'web-test');
if (!fs.existsSync(webTestDir)) {
  fs.mkdirSync(webTestDir, { recursive: true });
}

// Define MIME types for common files
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

// Create server
const server = http.createServer((request, response) => {
  console.log(`Request: ${request.url}`);
  
  // Get the file path
  let filePath = path.join(webTestDir, request.url === '/' ? 'index.html' : request.url);
  
  // Handle asyncstorage-test route
  if (request.url === '/asyncstorage') {
    filePath = path.join(webTestDir, 'asyncstorage-test.html');
  }
  
  // Get file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  // Read the file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found
        const indexPath = path.join(webTestDir, 'index.html');
        fs.readFile(indexPath, (err, indexContent) => {
          if (err) {
            // Even index.html not found
            response.writeHead(404);
            response.end('404 - File Not Found');
          } else {
            // Serve index.html as fallback
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(indexContent, 'utf-8');
          }
        });
      } else {
        // Server error
        response.writeHead(500);
        response.end(`Server Error: ${error.code}`);
      }
    } else {
      // Success - serve the file
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`
=================================================
  EcoCart Simple Static Test Server
  
  Server running at: http://localhost:${PORT}
  
  Available pages:
  - http://localhost:${PORT}/
  - http://localhost:${PORT}/asyncstorage
  
  This static server doesn't use Metro bundler
  or any external dependencies.
=================================================
`);
}); 