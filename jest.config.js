'use strict'

module.exports = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./jest.setup.js'],
  globals: {
    __DEV__: true,
  },
  testMatch: ['<rootDir>/packages/**/__tests__/**/*.spec.ts'],
  coverageProvider: 'v8',
  collectCoverageFrom: ['packages/*/src/**/*.ts', '!packages/*/src/index.ts'],
  watchPathIgnorePatterns: ['/node_modules/'],
  testEnvironment: 'node',
}
