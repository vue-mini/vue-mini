module.exports = {
  '**/*.js': filenames => [
    `cross-env NODE_ENV=production eslint --fix ${filenames.join(' ')}`,
    `git add ${filenames.join(' ')}`
  ],
  '**/*.ts': filenames => [
    `cross-env NODE_ENV=production eslint --fix ${filenames.join(' ')}`,
    'tsc --noEmit',
    `git add ${filenames.join(' ')}`
  ]
}
