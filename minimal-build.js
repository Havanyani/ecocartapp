const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

console.log('Building minimal web version...');

// Source file paths
const sourceFile = path.resolve(__dirname, 'minimal-web.js');
const outputFile = path.resolve(__dirname, 'dist', 'minimal-web.js');
const htmlFile = path.resolve(__dirname, 'minimal.html');
const outputHtmlFile = path.resolve(__dirname, 'dist', 'index.html');

// Create dist directory if it doesn't exist
if (!fs.existsSync(path.resolve(__dirname, 'dist'))) {
  fs.mkdirSync(path.resolve(__dirname, 'dist'));
}

// Transform the JS file with Babel
try {
  const source = fs.readFileSync(sourceFile, 'utf8');
  const result = babel.transformSync(source, {
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: [
      ['@babel/plugin-transform-react-jsx', { pragma: 'React.createElement' }]
    ]
  });

  // Write the transformed code to the output file
  fs.writeFileSync(outputFile, result.code);
  console.log(`Successfully compiled ${sourceFile} to ${outputFile}`);

  // Copy the HTML file
  fs.copyFileSync(htmlFile, outputHtmlFile);
  console.log(`Successfully copied ${htmlFile} to ${outputHtmlFile}`);

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Error during build:', error);
  process.exit(1);
} 