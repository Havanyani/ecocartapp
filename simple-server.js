const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Default to serving the static-test.html file
  let filePath = './static-test.html';
  
  // If a specific path is requested, try to serve that file
  if (req.url !== '/' && req.url !== '/static-test.html') {
    filePath = '.' + req.url;
  }
  
  // Get the file extension
  const extname = path.extname(filePath);
  
  // Set the content type based on file extension
  let contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
  }
  
  // Read the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      // If file not found
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found: ' + filePath);
      } else {
        // Server error
        res.writeHead(500);
        res.end('Server Error: ' + err.code);
      }
    } else {
      // Success - return the file
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Access the static test at http://localhost:${PORT}/static-test.html`);
  console.log('Press Ctrl+C to stop the server');
}); 