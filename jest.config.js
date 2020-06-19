module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^vue$': 'vue/dist/vue.common.js',
  },
  moduleFileExtensions: ['js', 'ts', 'vue', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '.*\\.(vue)$': 'vue-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  coverageDirectory: '<rootDir>/test/unit/coverage',
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/lib/**/*.{js,ts,vue}',
    '<rootDir>/store/**/*.{js,ts}',
    '!**/node_modules/**',
  ],
}
