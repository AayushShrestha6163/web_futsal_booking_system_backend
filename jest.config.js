/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // where tests are located
  roots: ["<rootDir>/src"],

  // find test files
  testMatch: ["**/test/**/*.test.ts"],

  // file extensions
  moduleFileExtensions: ["ts", "js", "json"],

  // transform TypeScript
  transform: {
    "^.+\\.ts$": "ts-jest",
  },

  // clear mocks between tests
  clearMocks: true,

  // timeout for tests
  testTimeout: 30000,

  // ignore build folders
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],

  // setup file to silence logs
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],

  // coverage settings (optional but useful)
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/index.ts",
    "!src/**/*.d.ts",
    "!src/test/**",
  ],
};