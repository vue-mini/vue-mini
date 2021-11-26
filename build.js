'use strict'

const process = require('process')
const path = require('path')
const fs = require('fs-extra')
const rollup = require('rollup')
const replace = require('@rollup/plugin-replace')
const { terser } = require('rollup-plugin-terser')
const typescript = require('@rollup/plugin-typescript')
const { default: resolve } = require('@rollup/plugin-node-resolve')
const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor')

const input = 'src/index.ts'
const external = ['@vue/reactivity']

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
    input: path.join(target, input),
    external,
    plugins: [
      typescript({
        rootDir: target,
        declaration: true,
        declarationMap: true,
        declarationDir: path.join(target, 'dist'),
      }),
    ],
  })
  await bundle.write({
    dir: path.join(target, 'dist'),
    format: 'es',
  })
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
    input: path.join(target, input),
    external,
    plugins: [
      minify &&
        terser({
          compress: {
            ecma: 2015,
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

  const extractorConfig = ExtractorConfig.loadFileAndPrepare(
    path.join(target, 'api-extractor.json')
  )
  const extractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true,
  })

  if (extractorResult.succeeded) {
    console.log(`API Extractor completed successfully`)
  } else {
    console.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`
    )
    process.exitCode = 1
  }

  await fs.remove(path.join(target, 'dist', 'src'))
  await fs.remove(path.join(target, 'dist', 'index.js'))
  await fs.remove(path.join(target, 'dist', '__tests__'))

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
    external,
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

  build(target).catch(() => {
    process.exitCode = 1
  })
}
