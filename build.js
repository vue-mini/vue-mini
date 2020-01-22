'use strict'

const fs = require('fs-extra')
const rollup = require('rollup')
const replace = require('@rollup/plugin-replace')
const typescript = require('rollup-plugin-typescript2')
const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor')

const input = 'src/index.ts'
const external = ['@next-vue/reactivity']
const check = false
const include = ['src', 'global.d.ts']

async function generateDeclaration() {
  const bundle = await rollup.rollup({
    input,
    external,
    plugins: [
      typescript({
        check,
        tsconfigOverride: {
          include,
          compilerOptions: {
            declaration: true,
            declarationMap: true
          }
        }
      })
    ]
  })
  await bundle.write({
    file: 'dist/temp/vue-mini.esm.js',
    format: 'es'
  })
}

async function generateCode({ isDev, format, fileName }) {
  const bundle = await rollup.rollup({
    input,
    external,
    plugins: [
      typescript({
        check,
        tsconfigOverride: { include }
      }),
      replace({ __DEV__: isDev })
    ]
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
    showVerboseMessages: true
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

  await fs.remove('dist/temp')

  await generateCode({
    isDev: true,
    format: 'es',
    fileName: 'vue-mini.esm.js'
  })

  await generateCode({
    isDev: false,
    format: 'es',
    fileName: 'vue-mini.esm.prod.js'
  })

  await generateCode({
    isDev: true,
    format: 'cjs',
    fileName: 'vue-mini.cjs.js'
  })

  await generateCode({
    isDev: false,
    format: 'cjs',
    fileName: 'vue-mini.cjs.prod.js'
  })
}

build()
