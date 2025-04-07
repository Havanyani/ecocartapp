/**
 * Minimal App in CommonJS format
 */
const React = require('react');
const { Text, View } = require('react-native');

function MinimalApp() {
  return React.createElement(
    View, 
    { style: { flex: 1, alignItems: 'center', justifyContent: 'center' } },
    React.createElement(
      Text,
      null,
      'Hello from React Native (CommonJS)'
    )
  );
}

module.exports = {
  default: MinimalApp
}; 