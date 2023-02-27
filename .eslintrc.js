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
    'plugin:react/jsx-runtime',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
    ecmaFeatures: {
      jsx: true,
    },
    project: ['tsconfig.json'],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
  ],
  overrides: [
    {
      extends: ['eslint:recommended', 'prettier'],
      files: ['*.js'],
      parser: 'espree',
      parserOptions: {
        emcaVersion: 'latest',
        sourceType: 'commonjs',
      },    
    },
  ],
}