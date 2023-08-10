module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  plugins: [
    'disable',
  ],
  extends: [
    'standard',
  ],
  globals: {
  },
  settings: {
  },
  rules: {
    'no-var': 1,
    'no-debugger': 2,
    'spaced-comment': 1,
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'ignore',
    }],
    indent: ['error', 2],
    'max-len': [1, 80, { ignoreUrls: true, ignoreStrings: true }],
    'one-var': 1,
    'no-useless-escape': 1,
    'no-throw-literal': 1,
  },
}
