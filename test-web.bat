@echo off
echo Testing basic HTML web page...

:: Use the built-in Python HTTP server to serve the file
:: This avoids any bundling issues with Metro/Webpack
echo Starting a simple HTTP server on port 8000...
echo Open http://localhost:8000/test.html in your browser

:: Start a Python HTTP server
python -m http.server 8000

echo Server stopped. 