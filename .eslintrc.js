module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'prettier',
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
    'vue/multi-word-component-names': 'off',
    'space-before-function-paren': 'off',
    'comma-dangle': 'off',
    'vue/script-indent': ['warn', 2, { switchCase: 1 }],
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        indent: 'off',
      },
    },
  ],
}
