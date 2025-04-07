@echo off
echo Opening EcoCart static test directly in browser...

:: Open the HTML file directly in the default browser
start "" "%~dp0static-test.html"

echo HTML file should now be open in your browser.
echo If it doesn't open automatically, manually open the file:
echo %~dp0static-test.html
pause 