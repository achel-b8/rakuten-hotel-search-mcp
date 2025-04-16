export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module"
      }
    },
    plugins: {
      "@typescript-eslint": await (await import("@typescript-eslint/eslint-plugin")).default,
      "prettier": await (await import("eslint-plugin-prettier")).default
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "prettier/prettier": "error"
    }
  }
];
