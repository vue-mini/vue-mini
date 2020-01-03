'use strict';

const xoTs = require('eslint-config-xo-typescript')

const isProd = process.env.NODE_ENV === 'production';
const { Function, Omit, ...types } = xoTs.rules['@typescript-eslint/ban-types'][1].types

const config = {
  root: true,
  extends: [
    'xo/esnext',
    require.resolve('xo/config/plugins'),
    'plugin:prettier/recommended',
    'prettier/unicorn'
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'xo-typescript',
        'prettier/@typescript-eslint',
      ],
      parserOptions: {
        project: './tsconfig.json'
      },
      rules: {
        'no-redeclare': 'error',
        'import/no-mutable-exports': 'off',
        '@typescript-eslint/promise-function-async': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/ban-types': ['error', { types }]
      }
    }
  ],
  globals: {
    __DEV__: 'readonly'
  }
};

if (!isProd) {
  config.extends = [
    ...config.extends,
    'silent',
    'silent/import',
    'silent/prettier',
    'silent/unicorn'
  ];
  config.overrides[0].extends = [
    ...config.overrides[0].extends,
    'silent/@typescript-eslint'
  ];
}

module.exports = config;
