import React from 'react';
import { Text, View } from 'react-native';

// Create basic mock components for SVG elements
const createSvgComponent = (name) => {
  const Component = (props) => (
    <View {...props} style={[{ display: 'none' }, props.style]}>
      {props.children}
    </View>
  );
  Component.displayName = name;
  return Component;
};

// Export mock SVG components
export const Svg = createSvgComponent('Svg');
export const Circle = createSvgComponent('Circle');
export const Ellipse = createSvgComponent('Ellipse');
export const G = createSvgComponent('G');
export const Text = createSvgComponent('SvgText');
export const TSpan = createSvgComponent('TSpan');
export const TextPath = createSvgComponent('TextPath');
export const Path = createSvgComponent('Path');
export const Polygon = createSvgComponent('Polygon');
export const Polyline = createSvgComponent('Polyline');
export const Line = createSvgComponent('Line');
export const Rect = createSvgComponent('Rect');
export const Use = createSvgComponent('Use');
export const Image = createSvgComponent('SvgImage');
export const Symbol = createSvgComponent('Symbol');
export const Defs = createSvgComponent('Defs');
export const LinearGradient = createSvgComponent('LinearGradient');
export const RadialGradient = createSvgComponent('RadialGradient');
export const Stop = createSvgComponent('Stop');
export const ClipPath = createSvgComponent('ClipPath');
export const Pattern = createSvgComponent('Pattern');
export const Mask = createSvgComponent('Mask');

// Export a dummy SvgUri component
export const SvgUri = (props) => (
  <View style={props.style}>
    <Text>SVG URI (Web Fallback)</Text>
  </View>
);

// Export default as Svg component
export default Svg; 