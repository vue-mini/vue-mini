'use strict'

const fs = require('fs-extra')
const rollup = require('rollup')
const replace = require('@rollup/plugin-replace')
const typescript = require('@rollup/plugin-typescript')
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

async function generateCode({ isDev, format, fileName }) {
  const bundle = await rollup.rollup({
    input,
    external,
    plugins: [typescript(), replace({ __DEV__: isDev })],
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
    isDev: true,
    format: 'es',
    fileName: 'wechat.esm.js',
  })

  await generateCode({
    isDev: false,
    format: 'es',
    fileName: 'wechat.esm.prod.js',
  })

  await generateCode({
    isDev: true,
    format: 'cjs',
    fileName: 'wechat.cjs.js',
  })

  await generateCode({
    isDev: false,
    format: 'cjs',
    fileName: 'wechat.cjs.prod.js',
  })
}

build()
