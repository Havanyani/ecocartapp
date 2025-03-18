/**
 * Custom ESLint rules for animations in the EcoCart app
 */

module.exports = {
  rules: {
    // Ensure animations have proper cleanup in useEffect
    'animation-cleanup': {
      create: function (context) {
        return {
          'CallExpression[callee.name="useEffect"]': function (node) {
            const callbackBody = node.arguments[0].body.body;
            
            // Check if there's an animation being started
            const hasAnimation = callbackBody.some(statement =>
              statement.type === 'ExpressionStatement' &&
              statement.expression.type === 'CallExpression' &&
              statement.expression.callee.property &&
              statement.expression.callee.property.name === 'start'
            );
            
            // Check if there's a return function for cleanup
            const hasCleanup = callbackBody.some(statement =>
              statement.type === 'ReturnStatement' &&
              statement.argument &&
              (statement.argument.type === 'ArrowFunctionExpression' ||
               statement.argument.type === 'FunctionExpression')
            );
            
            if (hasAnimation && !hasCleanup) {
              context.report({
                node,
                message: 'Animations should have cleanup functions in useEffect',
              });
            }
          },
        };
      },
    },
    
    // Enforce using error handling for animations
    'use-animation-error-handling': {
      create: function (context) {
        return {
          'CallExpression[callee.property.name="start"]': function (node) {
            // Check if the animation is wrapped in a try-catch or uses error handling utility
            const isSafelyHandled = context.getAncestors().some(ancestor =>
              (ancestor.type === 'TryStatement') ||
              (ancestor.type === 'CallExpression' && 
               ancestor.callee.name === 'withAnimationErrorHandling' ||
               ancestor.callee.name === 'safelyRunAnimation')
            );
            
            if (!isSafelyHandled) {
              context.report({
                node,
                message: 'Animation should be wrapped with error handling',
                fix: function (fixer) {
                  return fixer.insertTextBefore(
                    node,
                    'try { '
                  );
                },
              });
            }
          },
        };
      },
    },
    
    // Prefer using the native driver for animations
    'prefer-native-driver': {
      create: function (context) {
        return {
          'ObjectExpression': function (node) {
            // Check if this is an animation configuration object
            const isAnimationConfig = node.properties.some(prop => 
              prop.key.name === 'duration' || prop.key.name === 'toValue'
            );
            
            if (isAnimationConfig) {
              // Check if useNativeDriver is set to true
              const hasNativeDriver = node.properties.some(prop =>
                prop.key.name === 'useNativeDriver' && 
                prop.value.value === true
              );
              
              if (!hasNativeDriver) {
                context.report({
                  node,
                  message: 'Prefer using the native driver for animations',
                  fix: function (fixer) {
                    return fixer.insertTextAfter(
                      node.properties[node.properties.length - 1],
                      ', useNativeDriver: true'
                    );
                  },
                });
              }
            }
          },
        };
      },
    },
  },
}; 