'use strict'

module.exports = {
  root: true,
  extends: ['xo', require.resolve('xo/config/plugins.cjs'), 'prettier'],
  ignorePatterns: ['api-typings', 'dist', 'coverage'],
  overrides: [
    {
      files: ['*.ts'],
      extends: ['xo-typescript', 'prettier'],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        'logical-assignment-operators': 'off',
        'import/extensions': ['error', 'never'],
        'import/no-duplicates': ['error', { 'prefer-inline': false }],
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
        '@typescript-eslint/ban-types': 'off',
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
