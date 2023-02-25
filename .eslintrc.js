module.exports = {
  globals: {
    __NODE__: true,
  },
  env: {
    node: true,
    es2021: true,
  },
  // Prevent prettier formatting from conflicting with eslint rules
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
    project: ['tsconfig.json'],
  },
}