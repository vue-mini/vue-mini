/* eslint-disable unicorn/prefer-module */
'use strict'

module.exports = {
  env: {
    jest: true,
  },
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
      },
    },
  ],
}
