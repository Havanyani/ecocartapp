const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8081;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request for ${req.url}`);
  
  // Handle root request, serve index.html
  let filePath = req.url === '/' 
    ? path.join(__dirname, 'web-version', 'index.html')
    : path.join(__dirname, 'web-version', req.url);
  
  // Get file extension
  const extname = path.extname(filePath);
  
  // Set default content type
  let contentType = 'text/html';
  
  // Set content type based on file extension
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
      contentType = 'image/jpg';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
  }
  
  // Read the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      // If file not found, serve the index.html (for SPA routing)
      if (err.code === 'ENOENT') {
        console.log(`File not found: ${filePath}, serving index.html instead`);
        fs.readFile(path.join(__dirname, 'web-version', 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end(`Error: ${err.code}`);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Some other error
        console.error(`Server error: ${err.code}`);
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success - serve the file
      console.log(`Serving: ${filePath} as ${contentType}`);
      
      // Special case for index.html - add debugging console.log
      if (filePath.endsWith('index.html')) {
        // Add debugging to see JavaScript errors
        const modifiedContent = content.toString().replace('</body>', `
          <script>
            // Add error handling to debug loading issues
            window.onerror = function(message, source, lineno, colno, error) {
              console.error('JavaScript error:', message, 'at', source, lineno, colno);
              document.body.innerHTML += '<div style="color:red; position:fixed; bottom:0; left:0; right:0; padding:20px; background:rgba(0,0,0,0.8); z-index:9999;">Error: ' + message + '</div>';
              return false;
            };
            
            // Log when document is ready
            document.addEventListener('DOMContentLoaded', function() {
              console.log('DOM fully loaded');
            });
            
            // Check if React, ReactDOM and ReactNativeWeb are available
            setTimeout(function() {
              console.log('React available:', typeof React !== 'undefined');
              console.log('ReactDOM available:', typeof ReactDOM !== 'undefined');
              console.log('ReactNativeWeb available:', typeof ReactNativeWeb !== 'undefined');
            }, 1000);
          </script>
        </body>`);
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(modifiedContent, 'utf-8');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`IMPORTANT: Use http:// (not https://) in your browser`);
  console.log(`Open http://localhost:${PORT}/ in your browser`);
  console.log(`For diagnostics visit: http://localhost:${PORT}/debug.html`);
  console.log(`Serving content from web-version folder`);
  console.log(`Debug instructions:`);
  console.log(`1. Open browser dev tools (F12 or Ctrl+Shift+I)`);
  console.log(`2. Check the Console tab for JavaScript errors`);
  console.log(`3. Check the Network tab to see if any resources are failing to load`);
}); 