import { execa } from 'execa'

function run(bin: string, args: string[]) {
  return execa(bin, args, { stdio: 'inherit' })
}

// @ts-expect-error
await run('pnpm', ['lint'])
// @ts-expect-error
await run('pnpm', ['type'])
// @ts-expect-error
await run('pnpm', ['test'])
// @ts-expect-error
await run('pnpm', ['build'])
// @ts-expect-error
await run('pnpm', ['-r', 'publish', '--access', 'public'])
