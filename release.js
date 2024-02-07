import { execa } from 'execa'

// eslint-disable-next-line unicorn/prevent-abbreviations
function run(bin, args) {
  return execa(bin, args, { stdio: 'inherit' })
}

await run('pnpm', ['lint'])
await run('pnpm', ['type'])
await run('pnpm', ['test'])
await run('pnpm', ['build'])
await run('pnpm', ['-r', 'publish', '--access', 'public'])
