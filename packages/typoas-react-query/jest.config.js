module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.spec.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/lib/'],
};
