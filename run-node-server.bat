@echo off
echo Starting Node.js server for EcoCart static test...

:: Start the Node.js server
start cmd /k "node simple-server.js"

:: Wait for the server to start
timeout /t 2 > nul

:: Open the browser
start "" "http://localhost:3000/static-test.html"

echo Server is running in a separate window.
echo Access the test page at: http://localhost:3000/static-test.html
echo Close the server window when done testing. 