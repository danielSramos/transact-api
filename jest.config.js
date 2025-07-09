module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest', {
        tsconfig: 'tsconfig.json',
      }
    ],
  },
  transformIgnorePatterns: ["node_modules/(?!@nestjs)"],
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  }
};