module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  plugins: ['jest', '@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
};
