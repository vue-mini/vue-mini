'use strict'

const fs = require('fs-extra')
const rollup = require('rollup')
const replace = require('@rollup/plugin-replace')
const { terser } = require('rollup-plugin-terser')
const typescript = require('@rollup/plugin-typescript')
const { default: resolve } = require('@rollup/plugin-node-resolve')
const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor')

const input = 'src/index.ts'
const external = ['@vue/reactivity']

async function generateDeclaration() {
  const bundle = await rollup.rollup({
    input,
    external,
    plugins: [
      typescript({
        declaration: true,
        declarationMap: true,
        declarationDir: 'dist',
      }),
    ],
  })
  await bundle.write({
    dir: 'dist',
    format: 'es',
  })
}

async function generateCode({ minify, external, replaces, fileName, format }) {
  const bundle = await rollup.rollup({
    input,
    external,
    plugins: [
      ...(minify
        ? [
            terser({
              compress: {
                ecma: 2015,
                // eslint-disable-next-line camelcase
                pure_getters: true,
              },
            }),
          ]
        : []),
      typescript(),
      replace(replaces),
      resolve(),
    ],
  })
  await bundle.write({ file: `dist/${fileName}`, format })
}

async function build() {
  await fs.remove('dist')

  await generateDeclaration()

  const extractorConfig = ExtractorConfig.loadFileAndPrepare(
    'api-extractor.json'
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

  await fs.remove('dist/src')
  await fs.remove('dist/index.js')
  await fs.remove('dist/__tests__')

  await generateCode({
    minify: false,
    replaces: {
      __DEV__: true,
      'process.env.NODE_ENV': JSON.stringify('development'),
    },
    fileName: 'wechat.cjs.js',
    format: 'cjs',
  })

  await generateCode({
    minify: true,
    replaces: {
      __DEV__: false,
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    fileName: 'wechat.cjs.prod.js',
    format: 'cjs',
  })

  await generateCode({
    minify: false,
    external,
    replaces: {
      __DEV__: `(process.env.NODE_ENV !== 'production')`,
    },
    fileName: 'wechat.esm-bundler.js',
    format: 'es',
  })
}

build()
