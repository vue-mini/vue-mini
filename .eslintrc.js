'use strict';

const isProd = process.env.NODE_ENV === 'production';

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
        'no-redeclare': 2,
        '@typescript-eslint/promise-function-async': 0,
        '@typescript-eslint/prefer-nullish-coalescing': 0
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
