module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'prettier/vue',
    'plugin:vue/recommended',
    'plugin:prettier/recommended',
    '@nuxtjs/eslint-config-typescript',
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  plugins: ['vue'],
  // add your custom rules here
  rules: {
    'no-empty-pattern': 'off',
    'no-console': 'off',
    'prettier/prettier': ['error', { semi: false }],
    'vue/html-self-closing': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/max-attributes-per-line': 'off',
    'space-before-function-paren': 'off',
    'comma-dangle': 'off',
  },
}
