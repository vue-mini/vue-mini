/* eslint-disable unicorn/prefer-module */
'use strict'

const process = require('node:process')
const fs = require('node:fs')
const path = require('node:path')
const execa = require('execa')

function run(bin, args, options) {
  return execa(bin, args, { stdio: 'inherit', ...options })
}

// eslint-disable-next-line unicorn/prefer-top-level-await
;(async () => {
  try {
    await run('yarn', ['lint'])
    await run('yarn', ['type'])
    await run('yarn', ['test'])
    await run('yarn', ['build'])
    for (const pkg of fs.readdirSync('packages')) {
      const target = path.resolve('packages', pkg)
      if (!fs.statSync(target).isDirectory()) continue
      const { version } = require(path.join(target, 'package.json'))
      // eslint-disable-next-line no-await-in-loop
      await run(
        'yarn',
        [
          'publish',
          '--registry',
          'https://registry.npmjs.org',
          '--new-version',
          version,
          '--access',
          'public',
        ],
        { cwd: target },
      )
    }
  } catch {
    process.exitCode = 1
  }
})()
