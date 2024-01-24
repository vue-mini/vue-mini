import path from 'node:path'
import fs from 'fs-extra'
import { rollup } from 'rollup'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import dts from 'rollup-plugin-dts'

function getBanner(version) {
  return `/*!
 * vue-mini v${version}
 * https://github.com/vue-mini/vue-mini
 * (c) 2019-present Yang Mingshan
 * @license MIT
 */`
}

async function generateDeclaration(target) {
  const bundle = await rollup({
    input: path.join(target, 'src', 'index.ts'),
    external: ['miniprogram-api-typings', '@vue/reactivity'],
    plugins: [
      typescript({
        tsconfig: 'tsconfig.build.json',
        compilerOptions: {
          declaration: true,
          declarationDir: path.join(target, 'dist'),
        },
      }),
    ],
  })
  await bundle.write({
    dir: path.join(target, 'dist'),
    format: 'es',
  })

  const dtsBundle = await rollup({
    input: path.join(target, 'dist', 'index.d.ts'),
    plugins: [dts()],
  })
  await dtsBundle.write({
    file: path.join(target, 'dist', 'wechat.d.ts'),
    format: 'es',
  })

  const removals = []
  for (const file of await fs.readdirSync(path.join(target, 'dist'))) {
    if (file === 'wechat.d.ts') continue
    removals.push(fs.remove(path.join(target, 'dist', file)))
  }

  await Promise.all(removals)
}

async function generateCode({
  target,
  minify,
  external,
  replaces,
  fileName,
  format,
}) {
  const bundle = await rollup({
    input: path.join(target, 'src', 'index.ts'),
    external,
    plugins: [
      minify &&
        terser({
          compress: {
            ecma: 2016,
            // eslint-disable-next-line camelcase
            pure_getters: true,
          },
          format: {
            // Remove comments for tests
            comments: /^!/,
          },
        }),
      typescript({ tsconfig: 'tsconfig.build.json' }),
      replace({ values: replaces, preventAssignment: true }),
      resolve(),
    ].filter(Boolean),
  })
  const { version } = JSON.parse(
    await fs.readFile(path.resolve(target, 'package.json'), 'utf8'),
  )
  await bundle.write({
    file: path.join(target, 'dist', fileName),
    banner: getBanner(version),
    format,
  })
}

async function build(target) {
  await fs.remove(path.join(target, 'dist'))

  await generateDeclaration(target)

  await generateCode({
    target,
    minify: false,
    replaces: {
      __DEV__: true,
      'process.env.NODE_ENV': JSON.stringify('development'),
    },
    fileName: 'wechat.cjs.js',
    format: 'cjs',
  })

  await generateCode({
    target,
    minify: true,
    replaces: {
      __DEV__: false,
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    fileName: 'wechat.cjs.prod.js',
    format: 'cjs',
  })

  await generateCode({
    target,
    minify: false,
    external: ['@vue/reactivity'],
    replaces: {
      __DEV__: `(process.env.NODE_ENV !== 'production')`,
    },
    fileName: 'wechat.esm-bundler.js',
    format: 'es',
  })
}

for (const pkg of ['wechat']) {
  const target = path.join('packages', pkg)
  // eslint-disable-next-line no-await-in-loop
  await build(target)
}
