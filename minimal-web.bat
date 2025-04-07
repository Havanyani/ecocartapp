@echo off
echo Creating minimal web test folder...

:: Create the dist directory if it doesn't exist
if not exist "dist" mkdir dist

:: Copy the minimal HTML file to the dist directory
copy minimal.html dist\index.html

:: Open the HTML file in the default browser
echo Opening minimal web test in browser...
start dist\index.html

echo Done! 