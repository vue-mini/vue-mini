module.exports = {
  '**/*.js': (filenames) => [
    `cross-env NODE_ENV=production eslint --fix ${filenames.join(' ')}`,
  ],
  '**/*.ts': (filenames) => [
    `cross-env NODE_ENV=production eslint --fix ${filenames.join(' ')}`,
    'tsc --noEmit',
  ],
}
