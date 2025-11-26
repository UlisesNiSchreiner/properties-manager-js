// eslint.config.cjs
const js = require("@eslint/js");
const ts = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const importPlugin = require("eslint-plugin-import");

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  // Ignorar carpetas de build / coverage / docs generados
  {
    ignores: ["dist", "coverage", "docs"],
  },

  // Reglas básicas de JS recomendadas por ESLint
  js.configs.recommended,

  // ---------- TypeScript (código de la librería) ----------
  {
  files: ["test/**/*.ts"],
  languageOptions: {
    parser: tsParser,       // ⬅️ IMPORTANTE: usar el parser de TS también en tests
    ecmaVersion: 2022,
    sourceType: "module",
    globals: {
      // Vitest + Node
      describe: "readonly",
      it: "readonly",
      test: "readonly",
      expect: "readonly",
      beforeAll: "readonly",
      beforeEach: "readonly",
      afterAll: "readonly",
      afterEach: "readonly",
      vi: "readonly",
      process: "readonly",
      console: "readonly",
    },
  },
  plugins: {
    import: importPlugin,
    "@typescript-eslint": ts,
  },
  rules: {
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
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
  },
},
  // ---------- Tests (Vitest) ----------
  {
    files: ["test/**/*.ts"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Vitest + Node
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly",
        vi: "readonly",
        process: "readonly",
        console: "readonly",
      },
    },
    plugins: {
      import: importPlugin,
      "@typescript-eslint": ts,
    },
    rules: {
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
      // Un poco más relajado en tests si quisieras:
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // ---------- Scripts Node (init-template, etc.) ----------
  {
    files: ["scripts/**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module", // porque tu init-template es .mjs
      globals: {
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    rules: {
      // No queremos que se queje de require/process/etc acá
      "no-undef": "off",
    },
  },
];
