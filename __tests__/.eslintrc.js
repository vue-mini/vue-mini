'use strict'

module.exports = {
  env: {
    jest: true
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-expressions': 'off'
      }
    }
  ],
};
