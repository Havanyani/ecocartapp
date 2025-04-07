@echo off
echo Starting EcoCart Static Web Test...

echo Testing if Python is available for HTTP server...
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo Using Python HTTP server on port 8000
  echo Open http://localhost:8000/static-test.html in your browser
  
  :: Start the server
  start "" http://localhost:8000/static-test.html
  python -m http.server 8000
) else (
  echo Python is not available. Opening HTML file directly...
  start "" static-test.html
)

echo Test completed. 