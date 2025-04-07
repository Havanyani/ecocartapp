/**
 * @fileoverview Rule to enforce proper theme usage pattern
 * @author EcoCart Team
 */

"use strict";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce proper theme usage pattern",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      incorrectUsage: "Incorrect theme usage. Use the two-step pattern: 'const themeFunc = useTheme(); const theme = themeFunc();'",
    },
  },

  create: function (context) {
    return {
      // Look for variable declarations
      VariableDeclaration(node) {
        // Check each declaration in the variable declaration
        node.declarations.forEach((declaration) => {
          // Only interested in 'const theme = useTheme()'
          if (
            declaration.id &&
            declaration.id.type === "Identifier" &&
            declaration.id.name === "theme" &&
            declaration.init &&
            declaration.init.type === "CallExpression" &&
            declaration.init.callee &&
            declaration.init.callee.type === "Identifier" &&
            declaration.init.callee.name === "useTheme"
          ) {
            context.report({
              node: declaration,
              messageId: "incorrectUsage",
              fix: function (fixer) {
                // Replace with the proper two-step pattern
                return fixer.replaceText(
                  node,
                  "const themeFunc = useTheme();\nconst theme = themeFunc();"
                );
              },
            });
          }
        });
      },
    };
  },
}; 