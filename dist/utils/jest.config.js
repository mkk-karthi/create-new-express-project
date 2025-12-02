export default {
  testEnvironment: "node",
  collectCoverage: false,
  coveragePathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ["./jest.setup.js"],
  collectCoverageFrom: [],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  transform: {},
};
