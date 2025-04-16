import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module"
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "prettier": prettierPlugin
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "prettier/prettier": "error"
    }
  }
];
