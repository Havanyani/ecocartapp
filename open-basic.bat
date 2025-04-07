@echo off
echo Opening basic EcoCart test in your default browser...

:: Get the full path to the HTML file
set HTML_PATH=%~dp0basic-test.html

:: Open the HTML file in the default browser
start "" "%HTML_PATH%"

echo You should see the test page in your browser now.
pause 