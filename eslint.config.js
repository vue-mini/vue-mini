import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

const config = [
  { ignores: ['packages/api-typings/', '**/cache/', '**/dist/'] },
  {
    files: ['**/*.js', '**/*.ts'],
    linterOptions: { reportUnusedDisableDirectives: true },
    rules: {
      ...eslint.configs.recommended.rules,
      // Avoid conflicts with Prettier
      // https://github.com/prettier/eslint-config-prettier#no-unexpected-multiline
      'no-unexpected-multiline': 'off',
    },
  },
  ...tseslint.configs.recommendedTypeChecked.map((c) => ({
    ...c,
    files: ['**/*.ts'],
  })),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration[const=true]',
          message: 'Please use non-const enums.',
        },
        {
          selector: 'ObjectPattern > RestElement',
          message:
            'Our output target is ES2016, and object rest spread results in ' +
            'verbose helpers and should be avoided.',
        },
        {
          selector: 'ObjectExpression > SpreadElement',
          message:
            'Our output target is ES2016, and object rest spread results in ' +
            'verbose helpers and should be avoided.',
        },
        {
          selector: 'AwaitExpression',
          message:
            'Our output target is ES2016, so async/await syntax should be avoided.',
        },
        {
          selector: 'ChainExpression',
          message:
            'Our output target is ES2016, and optional chaining results in ' +
            'verbose helpers and should be avoided.',
        },
      ],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.spec.ts', 'build.ts', 'release.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
]

export default config
