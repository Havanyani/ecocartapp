/**
 * Custom CommonJS entry point to avoid ESM conflicts
 */
const { AppRegistry } = require('react-native');
const React = require('react');

// Use require for our minimal app (CommonJS version)
const MinimalApp = require('./MinimalApp.cjs').default;

// Register using plain React Native AppRegistry
AppRegistry.registerComponent('main', () => MinimalApp);

// If web, also register for DOM rendering
if (typeof document !== 'undefined') {
  const { createRoot } = require('react-dom/client');
  const rootTag = document.getElementById('root');
  
  if (rootTag) {
    const root = createRoot(rootTag);
    root.render(React.createElement(MinimalApp));
  }
} 