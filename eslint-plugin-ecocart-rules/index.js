/**
 * @fileoverview ESLint plugin for EcoCart custom rules
 * @author EcoCart Team
 */

"use strict";

module.exports = {
  rules: {
    "enforce-theme-usage": require("../eslint-rules/enforce-theme-usage"),
  },
  configs: {
    recommended: {
      plugins: ["ecocart-rules"],
      rules: {
        "ecocart-rules/enforce-theme-usage": "error",
      },
    },
  },
}; 