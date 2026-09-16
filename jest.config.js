module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: ['/node_modules/(?!uuid/)'],
  moduleFileExtensions: ['js', 'ts', 'vue', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  coverageDirectory: '<rootDir>/test/unit/coverage',
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/lib/**/*.{js,ts,vue}',
    '<rootDir>/stores/**/*.{js,ts}',
    '!**/node_modules/**',
  ],
}
