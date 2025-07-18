module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
   collectCoverage: true,
   setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
     'components/**/*.{ts,tsx}',
     'lib/**/*.{ts,tsx}',
     'app/api/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/test/**',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}
