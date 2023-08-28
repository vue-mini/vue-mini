/* eslint-disable unicorn/prefer-module */
'use strict'

const process = require('node:process')
const path = require('node:path')
const fs = require('fs-extra')
const rollup = require('rollup')
const { default: replace } = require('@rollup/plugin-replace')
const { default: terser } = require('@rollup/plugin-terser')
const { default: typescript } = require('@rollup/plugin-typescript')
const { default: resolve } = require('@rollup/plugin-node-resolve')
const { default: dts } = require('rollup-plugin-dts')

function getBanner(version) {
  return `/*!
 * vue-mini v${version}
 * https://github.com/vue-mini/vue-mini
 * (c) 2019-present Yang Mingshan
 * @license MIT
 */`
}

async function generateDeclaration(target) {
  const bundle = await rollup.rollup({
    input: path.join(target, 'src', 'index.ts'),
    external: ['miniprogram-api-typings', '@vue/reactivity'],
    plugins: [
      typescript({
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

  const dtsBundle = await rollup.rollup({
    input: path.join(target, 'dist', 'src', 'index.d.ts'),
    plugins: [dts()],
  })
  await dtsBundle.write({
    file: path.join(target, 'dist', 'wechat.d.ts'),
    format: 'es',
  })

  await fs.remove(path.join(target, 'dist', 'src'))
  await fs.remove(path.join(target, 'dist', 'index.js'))
  await fs.remove(path.join(target, 'dist', '__tests__'))
}

async function generateCode({
  target,
  minify,
  external,
  replaces,
  fileName,
  format,
}) {
  const bundle = await rollup.rollup({
    input: path.join(target, 'src', 'index.ts'),
    external,
    plugins: [
      minify &&
        terser({
          compress: {
            ecma: 2015,
            // eslint-disable-next-line camelcase
            pure_getters: true,
          },
        }),
      typescript(),
      replace({ values: replaces, preventAssignment: true }),
      resolve(),
    ].filter(Boolean),
  })
  const { version } = require(path.resolve(target, 'package.json'))
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

for (const pkg of fs.readdirSync('packages')) {
  const target = path.join('packages', pkg)
  if (!fs.statSync(target).isDirectory()) continue
  // eslint-disable-next-line unicorn/prefer-top-level-await
  build(target).catch(() => {
    process.exitCode = 1
  })
}
