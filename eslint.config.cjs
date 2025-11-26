// eslint.config.cjs - Flat config for ESLint 9

const js = require("@eslint/js");
const ts = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const importPlugin = require("eslint-plugin-import");

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  // Ignorar paths (reemplaza .eslintignore)
  {
    ignores: ["dist", "coverage", "docs"],
  },

  // Reglas base JS recomendadas
  js.configs.recommended,

  // Reglas para TypeScript
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": ts,
      import: importPlugin,
    },
    rules: {
      // Reglas recomendadas de TypeScript
      ...ts.configs.recommended.rules,

      // Orden de imports
      "import/order": [
        "warn",
        {
          groups: [
            ["builtin", "external"],
            ["internal"],
            ["parent", "sibling", "index"],
          ],
          "newlines-between": "always",
        },
      ],
    },
  },
  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        console: "readonly",
        process: "readonly",
      },
    },
    rules: {
      // En scripts CLI no tiene sentido quejarse de "require"/"process"/etc.
      "no-undef": "off",
    },
  },
];
