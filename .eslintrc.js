module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'comma-dangle': ["error", "never"],
    'quotes': ["error", "double"],
    'arrow-parens': ["error", "as-needed"],
    'max-len': ["error", { "code": 120 }]
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
