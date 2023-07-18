/* eslint-disable unicorn/prefer-module */
'use strict'

const process = require('node:process')
// eslint-disable-next-line import/no-extraneous-dependencies
const xoTs = require('eslint-config-xo-typescript')

const isProd = process.env.NODE_ENV === 'production'
const {
  object,
  Function,
  null: n,
  ...types
} = xoTs.rules['@typescript-eslint/ban-types'][1].types

const config = {
  root: true,
  extends: [
    'xo',
    require.resolve('xo/config/plugins.cjs'),
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['dist', 'coverage'],
  overrides: [
    {
      files: ['*.ts'],
      extends: ['xo-typescript', 'prettier'],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        'import/extensions': ['error', 'never'],
        'import/named': 'off',
        'import/no-mutable-exports': 'off',
        'unicorn/no-for-loop': 'off',
        'unicorn/import-style': 'off',
        'unicorn/prefer-ternary': 'off',
        'unicorn/prefer-includes': 'off',
        'unicorn/no-array-for-each': 'off',
        'unicorn/prevent-abbreviations': 'off',
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/prefer-for-of': 'off',
        '@typescript-eslint/prefer-includes': 'off',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/promise-function-async': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/prefer-optional-chain': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/ban-types': [
          'error',
          { extendDefaults: false, types },
        ],
      },
    },
  ],
  globals: {
    App: 'readonly',
    Page: 'readonly',
    Component: 'readonly',
    __DEV__: 'readonly',
  },
}

if (!isProd) {
  config.rules = {
    'eslint-comments/no-unused-disable': 'off',
  }
  config.extends = [
    ...config.extends,
    'silent',
    'silent/import',
    'silent/prettier',
    'silent/unicorn',
  ]
  config.overrides[0].extends = [
    ...config.overrides[0].extends,
    'silent/@typescript-eslint',
  ]
}

module.exports = config
