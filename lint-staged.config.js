/* eslint-disable unicorn/prefer-module */
'use strict'

module.exports = {
  '**/*.js': (filenames) => [
    `prettier --write ${filenames.join(' ')}`,
    `eslint ${filenames.join(' ')}`,
  ],
  '**/*.ts': (filenames) => [
    `prettier --write ${filenames.join(' ')}`,
    `eslint ${filenames.join(' ')}`,
    'tsc --noEmit',
  ],
  '**/*.md': (filenames) => [`prettier --write ${filenames.join(' ')}`],
}
